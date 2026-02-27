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

// Rate limiter: 10 peticiones cada 10 minutos
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos en milisegundos
  max: 10, // máximo 10 peticiones
  message: 'Too many requests from this IP, please try again later.'
})

app.use(limiter)

const PORT = process.env.PORT

app.use('/noticias', noticesRouter)

app.listen(PORT, () => {
  console.log(`Puerto en ${PORT}`)
})
