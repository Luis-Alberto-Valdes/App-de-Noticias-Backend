import { Router } from 'express'
import { UsersController } from '../controllers/user.js'
export const usersRouter = Router()

usersRouter.post('/', UsersController.register)

usersRouter.delete('/', UsersController.deleteUser)

usersRouter.get('/verify', UsersController.verifyUser)
