/* eslint-disable camelcase */
import pg from 'pg'
import { ERROR_CODES, ERROR_MESSAGES, HTTP_STATUS } from '../utils/errors.js'
import { sendEmail, sendMultipleEmail } from '../utils/emails.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import ejs from 'ejs'

const API_KEY = process.env.KEY
const SECRET_KEY = process.env.SECRET_KEY

const config = {
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}

const pool = new pg.Pool(config)

async function getNoticesFromApi (user) {
  const categories = user.length === 1 ? user[0] : user.join(',')
  const results = await fetch(`https://newsdata.io/api/1/latest?apikey=${API_KEY}&language=en&country=us&category=${categories}&image=1&removeduplicate=1&sort=pubdateasc&size=5`)
  const noticias = await results.json()
  const newNotices = await noticias.results.map(noticia => {
    const { link, title, description, image_url } = noticia
    return { link, title, description, image_url }
  })

  return newNotices
}

export class NoticesModel {
  static async getUsersData () {
    let connection
    try {
      connection = await pool.connect()
      await connection.query('BEGIN')
      const [result] = await connection.query(`
      select user_email,json_agg(categories_name) as categories 
      from users 
      join 
      categories on categories.user_id = users.user_id 
      WHERE verification = true
      GROUP BY 
      user_email`)

      const usersData = result
      await connection.query('COMMIT')
      return { success: true, usersData, statusCode: HTTP_STATUS.OK }
    } catch (error) {
      await connection.query('ROLLBACK')
      return { success: false, message: ERROR_MESSAGES.INTERNAL_ERROR, code: ERROR_CODES.DATABASE_ERROR }
    } finally {
      connection.release()
    }
  }

  static async getNotices (usersData) {
    try {
      const noticesPromises = await usersData.map(async (data) => {
        const notices = await getNoticesFromApi(data.categories)
        const emails = data.user_email
        const info = { emails, notices }
        return info
      })
      const notices = await Promise.allSettled(noticesPromises)

      return { success: true, notices, statusCode: HTTP_STATUS.OK }
    } catch (error) {
      return { success: false, message: ERROR_MESSAGES.INTERNAL_ERROR, statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    }
  }

  static async SendNotices ({ input }) {
    try {
      await sendMultipleEmail(input.notices)
    } catch (error) {
      return error.message
    }
  }

  static async register ({ input }) {
    let connection
    try {
      const user_email = input.data.email
      const user_password = await bcrypt.hash(input.data.password, process.env.SALT_ROUNDS)
      const categories_name = input.data.categories
      const token = jwt.sign({ email: user_email }, SECRET_KEY, { expiresIn: '1h' })
      connection = await pool.connect()
      await connection.query('BEGIN')
      const [result] = await connection.query('insert into users (user_email,user_password,verification_token) values($1,$2,$3)', [user_email, user_password, token])

      const user_id = result.insertId

      const categoriesPromises = await categories_name.map(categorie => {
        return connection.query('insert into categories (categories_name,user_id) values($1,$2)', [categorie, user_id])
      })

      await Promise.all(categoriesPromises)

      const mailOptions = {
        from: 'morningdigest.news@gmail.com',
        to: user_email,
        subject: 'Verify your account',
        html: await ejs.renderFile('src/views/verification-email.ejs', { token })
      }
      await sendEmail(mailOptions)

      await connection.query('COMMIT')

      return { success: true, message: { message: 'User registered successfully check your email for verification code!' }, statusCode: HTTP_STATUS.CREATED }
    } catch (error) {
      if (connection === undefined) {
        return {
          success: false, message: ERROR_MESSAGES.INTERNAL_ERROR, statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
        }
      }
      await connection.query('ROLLBACK')

      if (error.code === '23505') {
        return {
          success: false, message: ERROR_MESSAGES.USER_EXISTS, statusCode: HTTP_STATUS.BAD_REQUEST
        }
      }
      return { success: false, message: error, statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    } finally {
      if (connection) connection.release()
    }
  }

  static async deletUser ({ input }) {
    const user_email = input.data.email
    let connection
    try {
      connection = await pool.connect()
      await connection.query('BEGIN')
      const [password] = await connection.query('select user_password from users where user_email = $1', [user_email])
      if (password.length === 0) throw new Error(ERROR_MESSAGES.INVALID_PASSWORD)
      const user_password = bcrypt.compareSync(input.data.password, password[0].user_password)
      if (!user_password === 0) throw new Error(ERROR_MESSAGES.INVALID_PASSWORD)
      const [categoriesResult] = await connection.query(`
        DELETE FROM categories 
        WHERE user_id IN (
        SELECT user_id FROM users 
        WHERE user_email = $1 );
        `
      , [user_email])

      const [usersResult] = await connection.query(`
        DELETE FROM users 
        WHERE user_email = $1;
        `
      , [user_email])

      await connection.query('COMMIT')

      const afectedRows = usersResult.affectedRows + categoriesResult.affectedRows
      if (afectedRows === 0) {
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND)
      } else {
        return { success: true, message: { message: 'User Deleted' }, statusCode: HTTP_STATUS.DELETED }
      }
    } catch (error) {
      if (connection === undefined) return { success: false, message: ERROR_MESSAGES.INTERNAL_ERROR, statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      await connection.query('ROLLBACK')
      if (error === ERROR_MESSAGES.USER_NOT_FOUND) return { success: false, message: ERROR_MESSAGES.USER_NOT_FOUND, statusCode: HTTP_STATUS.BAD_REQUEST }
      return { success: false, message: error.message, statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    } finally {
      if (connection) connection.release()
    }
  }

  static async verifyUser (token) {
    let connection

    try {
      const verifyToken = jwt.verify(token, SECRET_KEY)
      console.log(verifyToken)
      connection = await pool.connect()
      await connection.query('BEGIN')

      const [result] = await connection.query('select user_email,verification_token from users where user_email=$1 and verification_token=$2', [verifyToken.email, token])
      if (result.length === 0) {
        throw new Error(ERROR_MESSAGES.INVALID_TOKEN)
      }
      await connection.query(`update users set verification = true,verification_token = 'used'  where user_email = $1`, [verifyToken.email])

      await connection.query('COMMIT')

      return { success: true, message: { message: 'User verified correctly' }, statusCode: HTTP_STATUS.OK }
    } catch (error) {
      if (error.name === 'TokenExpiredError') return { success: false, message: ERROR_MESSAGES.EXPIRED_TOKEN, statusCode: HTTP_STATUS.UNAUTHORIZED }
      if (error.name === 'JsonWebTokenError') return { success: false, message: ERROR_MESSAGES.INVALID_TOKEN, statusCode: HTTP_STATUS.UNAUTHORIZED }
      return { success: false, message: ERROR_MESSAGES.INVALID_TOKEN, statusCode: HTTP_STATUS.UNAUTHORIZED }
    } finally {
      if (connection) connection.release()
    }
  }
}
