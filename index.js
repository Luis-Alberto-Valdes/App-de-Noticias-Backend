import express, { json } from 'express'
import { noticesRouter } from './src/routes/notices.js'
import cors from 'cors'
import { usersRouter } from './src/routes/user.js'

const app = express()
app.disable('x-powered-by')
app.use(json())
app.set('view engine', 'ejs')
app.set('views', './src/views')

app.use(cors({
  methods: ['POST', 'DELETE', 'GET']
}))

const PORT = process.env.PORT

app.use('/user', usersRouter)
app.use('/notices', noticesRouter)

app.listen(PORT, () => {
  console.log(`Puerto en ${PORT}`)
})
