import { UserTypes, OnlineUser } from "../types"
import OnlineUserModel from "./OnlineUsers.schema"
import UserModel from "./User.schema"
class User {
  static async addOnlineUser(userIfo: OnlineUser): Promise<OnlineUser[]> {
    const user = await OnlineUserModel.findOne({ userId: userIfo.userId })
    if (!user?.userId) {
      await OnlineUserModel.create(userIfo).catch((err) => {
        throw new Error(err.message)
      })
    }
    const onlineUsers = await OnlineUserModel.find({})
    return onlineUsers
  }
  static async getUserById(userId: string): Promise<Pick<UserTypes, "sessionId" | "userId" | "image" | "username">> {
    const user = await UserModel.findOne({ userId: userId }, { sessionId: 1, userId: 1, image: 1, username: 1 })
    let result = { sessionId: "", userId: "", image: "", username: "" }
    if (user?.userId) {
      const { sessionId, userId, username, image } = user
      result = { sessionId: sessionId ? sessionId : "", username, userId, image }
    }
    return result
  }

  static async getAllUsers(): Promise<Pick<UserTypes, "email" | "image" | "userId" | "username">[]> {
    const allUsers: Pick<UserTypes, "email" | "userId" | "username" | "image">[] = await UserModel.find({}, { email: 1, image: 1, username: 1, userId: 1 })
    return allUsers || []
  }

  static async removeOnlineUser(userId: string) {
    const user: OnlineUser = await OnlineUserModel.findOne({ userId: userId })

    await OnlineUserModel.deleteOne({ userId: userId })
    const onlineUsers = await OnlineUserModel.find({})
    return { username: user.username, onlineUsers }
  }
}

export default User
