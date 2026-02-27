import { Router } from 'express'
import { NoticesController } from '../controllers/noticias.js'
export const noticesRouter = Router()

noticesRouter.get('/', NoticesController.getNotices)

noticesRouter.post('/', NoticesController.register)

noticesRouter.delete('/', NoticesController.deleteUser)

noticesRouter.get('/verify', NoticesController.verifyUser)
