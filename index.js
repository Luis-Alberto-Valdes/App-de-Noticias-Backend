import express, { json } from 'express'
import rateLimit from 'express-rate-limit'
import { noticesRouter } from './src/routes/noticias.js'
import cors from 'cors'

const app = express()
app.disable('x-powered-by')
app.use(json())
app.set('view engine', 'ejs')
app.set('views', './src/views')

// CORS solo para POST y DELETE
app.use(cors({
  methods: ['POST', 'DELETE', 'GET']
}))

const PORT = process.env.PORT

app.use('/noticias', noticesRouter)

app.listen(PORT, () => {
  console.log(`Puerto en ${PORT}`)
})
