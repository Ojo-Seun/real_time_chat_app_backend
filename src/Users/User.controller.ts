import { UserTypes } from "../types"
import UserModel from "./User.schema"
class User {
  username: string
  userId: string = ""
  email: string
  sessionId: string
  generalRoomId: string

  constructor(username: string, email: string, sessionId: string, generalRoomId: string) {
    this.email = email
    this.username = username
    this.sessionId = sessionId
    this.generalRoomId = generalRoomId
  }

  async addUser(): Promise<boolean> {
    const isExist = await UserModel.findOne({ email: this.email })

    if (isExist?.email) {
      throw new Error(`${this.email} already exist`)
    }

    const user: UserTypes = {
      username: this.username,
      email: this.email,
      sessionId: this.sessionId,
      userRoomsId: [this.generalRoomId],
    }

    UserModel.create(user)
      .then((res) => {
        return true
      })
      .catch((err) => {
        if (err) throw new Error(err.message)
        return ""
      })

    return true
  }

  static async getUserById(userId: string) {
    const user = await UserModel.findById({ userId: userId })
    return user ?? null
  }

  static async getAllUsers() {
    const allUsers = await UserModel.find({})
    return allUsers || null
  }
}

export default User
