import { Resend } from 'resend'
import ejs from 'ejs'

// Inicializar cliente de Resend con API key desde variables de entorno
const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail (mailOptions) {
  try {
    console.log('Preparando envío de correo individual vía Resend...')
    console.log('Enviando email a:', mailOptions.to)

    const response = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html
    })

    console.log('Email enviado exitosamente. ID:', response.id)
  } catch (error) {
    console.error('Error sending email via Resend:', error.message)
    console.error('Error details:', error)
  }
}

export async function sendMultipleEmail (mailOptions) {
  try {
    console.log('Preparando envío múltiple vía Resend...')
    console.log('Enviando correos a', mailOptions.length, 'destinatarios')

    const emailPromises = mailOptions.map(async recipient => {
      const html = await ejs.renderFile('./src/views/notices-email.ejs', { notice: recipient.value.notices })

      return resend.emails.send({
        from: 'onboarding@resend.dev',
        to: recipient.value.emails,
        subject: 'Notices of the day',
        html
      })
    })

    const results = await Promise.all(emailPromises)
    console.log('Todos los emails enviados exitosamente. Total:', results.length)
  } catch (error) {
    console.error('Error sending multiple emails via Resend:', error.message)
    console.error('Error details:', error)
  }
}
