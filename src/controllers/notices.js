import { NoticesModel } from '../models/notices.js'

export class NoticesController {
  static async getNotices (req, res) {
    const usersData = await NoticesModel.getUsersData()
    if (usersData.error) return res.status(400).json({ message: JSON.parse(usersData.error.message) })
    const notices = await NoticesModel.getNotices(usersData.usersData)
    if (!notices.success) return res.status(notices.statusCode).json({ message: notices.message })
    await NoticesModel.SendNotices({ input: notices })

    res.status(200)
  }
}
