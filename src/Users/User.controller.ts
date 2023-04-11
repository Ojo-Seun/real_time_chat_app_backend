import { UserTypes, OnlineUser } from "../types"
import UserModel from "./User.schema"
class User {
  private static onlineUsers: OnlineUser[] = []

  static addOnlineUser(userIfo: OnlineUser): OnlineUser[] {
    const user = this.onlineUsers.find((x) => x.userId === userIfo.userId)
    if (!user) {
      this.onlineUsers.push(userIfo)
    }

    return this.onlineUsers
  }
  static async getUserById(userId: string) {
    const user = await UserModel.findOne({ userId: userId }, { password: 0 })
    return user
  }

  static async getAllUsers(): Promise<Pick<UserTypes, "email" | "image" | "userId" | "username">[]> {
    const allUsers: Pick<UserTypes, "email" | "userId" | "username" | "image">[] = await UserModel.find({}, { email: 1, image: 1, username: 1, userId: 1 })
    return allUsers || []
  }

  static removeUser(userId: string) {
    const user: OnlineUser = this.onlineUsers.find((x) => x.userId === userId)
    const onlineUsers = this.onlineUsers.filter((x) => x.userId === userId)
    return { user, onlineUsers }
  }
}

export default User
