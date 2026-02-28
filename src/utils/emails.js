// Import the Nodemailer library
import nodemailer from 'nodemailer'
import ejs from 'ejs'
import { google } from 'googleapis'

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET
)

oAuth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN
})
export async function sendEmail (mailOptions) {
  try {
    const { token: accessToken } = await oAuth2Client.getAccessToken()
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken
      },
      tls: {
        rejectUnauthorized: false
      }
    })

    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error('Error sending emails:', error)
  }
}

export async function sendMultipleEmail (mailOptions) {
  try {
    const { token: accessToken } = await oAuth2Client.getAccessToken()

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken
      },
      maxConnections: 5,
      maxMessages: 100,
    })

    const emailPromises = mailOptions.map(async recipient => {
      const html = await ejs.renderFile('./src/views/notices-email.ejs', { notice: recipient.value.notices })

      return transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: recipient.value.emails,
        subject: 'Notices of the day',
        html
      })
    })

    await Promise.all(emailPromises)
  } catch (error) {
    console.error('Error sending emails:', error)
  }
}
