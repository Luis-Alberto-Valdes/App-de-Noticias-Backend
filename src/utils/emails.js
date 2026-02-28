// Import the Nodemailer library
import nodemailer from 'nodemailer'
import ejs from 'ejs'

const KEY = process.env.GMAIL_KEY

export async function sendEmail (mailOptions) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    ipv4: true,
    auth: {
      user: 'morningdigest.news@gmail.com',
      pass: KEY,
    }
  })

  await transporter.sendMail(mailOptions)
}

export async function sendMultipleEmail (mailOptions) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'morningdigest.news@gmail.com',
      pass: KEY,
    },
    maxConnections: 5,
    maxMessages: Infinity
  })

  const emailPromises = mailOptions.map(async recipient => {
    console.log(recipient.value.notices)
    const html = await ejs.renderFile('./src/views/notices-email.ejs', { notice: recipient.value.notices })

    return transporter.sendMail({
      from: 'morningdigest.news@gmail.com',
      to: recipient.value.emails,
      subject: 'Notices of the day',
      html
    })
  })
  try {
    await Promise.all(emailPromises)
  } catch (error) {
    console.error('Error sending emails:', error)
  }
}
