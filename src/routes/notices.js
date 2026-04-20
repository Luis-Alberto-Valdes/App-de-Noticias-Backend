import { Router } from 'express'
import { NoticesController } from '../controllers/notices.js'
export const noticesRouter = Router()

noticesRouter.get('/', NoticesController.getNotices)
