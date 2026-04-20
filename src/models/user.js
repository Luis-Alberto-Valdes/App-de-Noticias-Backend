/* eslint-disable camelcase */
import pg from 'pg'
import { ERROR_MESSAGES, HTTP_STATUS } from '../utils/errors.js'
import { sendEmail } from '../utils/emails.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import ejs from 'ejs'
import { config } from '../utils/database.js'

const SECRET_KEY = process.env.SECRET_KEY

const pool = new pg.Pool(config)

export class UsersModel {
  static async register ({ input }) {
    let client
    try {
      const user_email = input.data.email
      const user_password = await bcrypt.hash(input.data.password, parseInt(process.env.SALT_ROUNDS))
      const categories_name = input.data.categories
      const token = jwt.sign({ email: user_email }, SECRET_KEY, { expiresIn: '1h' })

      client = await pool.connect()
      await client.query('BEGIN')

      const result = await client.query(
        'INSERT INTO users (user_email, user_password, verification_token) VALUES ($1, $2, $3) RETURNING user_id',
        [user_email, user_password, token]
      )

      const user_id = result.rows[0].user_id

      const categoriesPromises = await categories_name.map(categorie => {
        return client.query(
          'INSERT INTO categories (categories_name, user_id) VALUES ($1, $2)',
          [categorie, user_id]
        )
      })

      await Promise.all(categoriesPromises)

      const mailOptions = {
        to: user_email,
        subject: 'Verify your account',
        html: await ejs.renderFile('src/views/verification-email.ejs', { token })
      }
      await sendEmail(mailOptions)

      await client.query('COMMIT')

      return { success: true, message: { message: 'User registered successfully check your email for verification code!' }, statusCode: HTTP_STATUS.CREATED }
    } catch (error) {
      if (client) await client.query('ROLLBACK')
      console.error(error)
      if (error.code === '23505') {
        return {
          success: false, message: ERROR_MESSAGES.USER_EXISTS, statusCode: HTTP_STATUS.BAD_REQUEST
        }
      }
      return { success: false, message: ERROR_MESSAGES.INTERNAL_ERROR, statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    } finally {
      if (client) client.release()
    }
  }

  static async deletUser ({ input }) {
    const user_email = input.data.email
    let client
    try {
      client = await pool.connect()
      await client.query('BEGIN')

      const passwordResult = await client.query(
        'SELECT user_password FROM users WHERE user_email = $1',
        [user_email]
      )

      if (passwordResult.rows.length === 0) throw new Error(ERROR_MESSAGES.INVALID_PASSWORD)

      const user_password = bcrypt.compareSync(input.data.password, passwordResult.rows[0].user_password)
      if (!user_password) throw new Error(ERROR_MESSAGES.INVALID_PASSWORD)

      await client.query(`
        DELETE FROM categories 
        WHERE user_id IN (
          SELECT user_id FROM users 
          WHERE user_email = $1
        )
      `, [user_email])

      const usersResult = await client.query(`
        DELETE FROM users 
        WHERE user_email = $1
      `, [user_email])

      await client.query('COMMIT')

      const affectedRows = usersResult.rowCount
      if (affectedRows === 0) {
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND)
      } else {
        return { success: true, message: { message: 'User Deleted' }, statusCode: HTTP_STATUS.DELETED }
      }
    } catch (error) {
      if (client) await client.query('ROLLBACK')
      console.error(error)
      if (error.message === ERROR_MESSAGES.USER_NOT_FOUND) return { success: false, message: ERROR_MESSAGES.USER_NOT_FOUND, statusCode: HTTP_STATUS.BAD_REQUEST }
      return { success: false, message: error.message, statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    } finally {
      if (client) client.release()
    }
  }

  static async deleteNotVerifyUsers () {
    let client
    try {
      client = await pool.connect()
      await client.query('BEGIN')

      // First delete categories associated with unverified users
      await client.query(`
        DELETE FROM categories 
        WHERE user_id IN (
          SELECT user_id FROM users 
          WHERE verification != true OR verification IS NULL OR verification = false
        )
      `)

      // Then delete users without verification
      const result = await client.query(`
        DELETE FROM users 
        WHERE verification != true OR verification IS NULL OR verification = false
      `)

      await client.query('COMMIT')

      const affectedRows = result.rowCount
      return { success: true, message: { message: `${affectedRows} unverified users deleted` }, statusCode: HTTP_STATUS.DELETED }
    } catch (error) {
      console.error(error)
      if (client) await client.query('ROLLBACK')
      return { success: false, message: ERROR_MESSAGES.INTERNAL_ERROR, statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    } finally {
      if (client) client.release()
    }
  }

  static async verifyUser (token) {
    let client

    try {
      const verifyToken = jwt.verify(token, SECRET_KEY)

      client = await pool.connect()
      await client.query('BEGIN')

      const result = await client.query(
        'SELECT user_email, verification_token FROM users WHERE user_email = $1 AND verification_token = $2',
        [verifyToken.email, token]
      )

      if (result.rows.length === 0) {  // ← Cambiado de result.length
        throw new Error(ERROR_MESSAGES.INVALID_TOKEN)
      }

      await client.query(
        "UPDATE users SET verification = true, verification_token = 'used' WHERE user_email = $1",
        [verifyToken.email]
      )

      await client.query('COMMIT')

      return { success: true, message: { message: 'User verified correctly' }, statusCode: HTTP_STATUS.OK }
    } catch (error) {
      if (client) await client.query('ROLLBACK')
      console.error(error)

      if (error.name === 'TokenExpiredError') return { success: false, message: ERROR_MESSAGES.EXPIRED_TOKEN, statusCode: HTTP_STATUS.UNAUTHORIZED }
      if (error.name === 'JsonWebTokenError') return { success: false, message: ERROR_MESSAGES.INVALID_TOKEN, statusCode: HTTP_STATUS.UNAUTHORIZED }

      return { success: false, message: ERROR_MESSAGES.INVALID_TOKEN, statusCode: HTTP_STATUS.UNAUTHORIZED }
    } finally {
      if (client) client.release()
    }
  }
}
