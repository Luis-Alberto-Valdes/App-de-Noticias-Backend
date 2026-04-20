import pg from 'pg'
import { ERROR_CODES, ERROR_MESSAGES, HTTP_STATUS } from '../utils/errors.js'
import { sendMultipleEmail } from '../utils/emails.js'
import { config } from '../utils/database.js'

const API_KEY = process.env.KEY

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
    let client
    try {
      client = await pool.connect()
      await client.query('BEGIN')

      const result = await client.query(`
            SELECT user_email, json_agg(categories_name) AS categories 
            FROM users 
            JOIN categories ON categories.user_id = users.user_id 
            WHERE verification = true
            GROUP BY user_email
          `)

      const usersData = result.rows
      await client.query('COMMIT')
      return { success: true, usersData, statusCode: HTTP_STATUS.OK }
    } catch (error) {
      if (client) await client.query('ROLLBACK')
      console.error(error)
      return { success: false, message: ERROR_MESSAGES.INTERNAL_ERROR, code: ERROR_CODES.DATABASE_ERROR }
    } finally {
      if (client) client.release()
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
      console.error(error)
      return error.message
    }
  }
}
