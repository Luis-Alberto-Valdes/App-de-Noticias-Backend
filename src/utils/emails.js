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
    console.log('Iniciando obtención de accessToken...')
    const { token: accessToken } = await oAuth2Client.getAccessToken()
    console.log('AccessToken obtenido exitosamente')

    console.log('Creando transporter con configuración SMTP...')
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 80,
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken
      },
      connectionTimeout: 10000,  // 10 segundos
      socketTimeout: 10000,      // 10 segundos
      tls: {
        rejectUnauthorized: false
      }
    })

    console.log('Enviando email a:', mailOptions.to)
    await transporter.sendMail(mailOptions)
    console.log('Email enviado exitosamente')
  } catch (error) {
    console.error('Error sending emails:', error.message)
    console.error('Error code:', error.code)
    console.error('Error command:', error.command)
    console.error('Stack:', error.stack)
  }
}

export async function sendMultipleEmail (mailOptions) {
  try {
    console.log('Iniciando obtención de accessToken...')
    const { token: accessToken } = await oAuth2Client.getAccessToken()
    console.log('AccessToken obtenido exitosamente')

    console.log('Creando transporter para envío múltiple...')
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 80,
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken
      },
      connectionTimeout: 10000,  // 10 segundos
      socketTimeout: 10000,      // 10 segundos
      maxConnections: 5,
      maxMessages: 100,
    })

    console.log('Preparando emails para', mailOptions.length, 'destinatarios')
    const emailPromises = mailOptions.map(async recipient => {
      const html = await ejs.renderFile('./src/views/notices-email.ejs', { notice: recipient.value.notices })

      return transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: recipient.value.emails,
        subject: 'Notices of the day',
        html
      })
    })

    console.log('Enviando', emailPromises.length, 'emails...')
    await Promise.all(emailPromises)
    console.log('Todos los emails enviados exitosamente')
  } catch (error) {
    console.error('Error sending emails:', error.message)
    console.error('Error code:', error.code)
    console.error('Error command:', error.command)
    console.error('Stack:', error.stack)
  }
}
