import { NoticesModel } from '../models/noticia.js'
import { validateUserRegister, validateUserUnregister } from '../schemas/loginValidation.js'

export class NoticesController {
  static async getNotices (req, res) {
    const usersData = await NoticesModel.getUsersData()
    if (usersData.error) return res.status(400).json({ message: JSON.parse(usersData.error.message) })
    const notices = await NoticesModel.getNotices(usersData.usersData)
    if (!notices.success) return res.status(notices.statusCode).json({ message: notices.message })
    await NoticesModel.SendNotices({ input: notices })

    res.status(200)
  }

  static async register (req, res) {
    const userInfo = await validateUserRegister(req.body)
    if (userInfo.error) return res.status(400).json({ message: JSON.parse(userInfo.error) })
    const result = await NoticesModel.register({ input: userInfo })
    if (!result.success) return res.status(result.statusCode).json({ message: result.message })

    res.json(result.message)
  }

  static async deleteUser (req, res) {
    const userInfo = await validateUserUnregister(req.body)
    if (userInfo.error) return res.status(400).json({ message: JSON.parse(userInfo.error.message) })

    const result = await NoticesModel.deletUser({ input: userInfo })
    if (!result.success) return res.status(result.statusCode).json({ message: result.message })
    res.json(result.message)
  }

  static async verifyUser (req, res) {
    const { token } = req.query
    const result = await NoticesModel.verifyUser(token)
    if (!result.success) return res.status(result.statusCode).render('verification-page', { success: false, message: result.message })
    res.render('verification-page', { success: true, message: result.message })
  }
}
