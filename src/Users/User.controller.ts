import { UserTypes, OnlineUser } from "../types"
import Online_userModel from "./Online_users.schema"
import UserModel from "./User.schema"
class User {
  static async addOnlineUser(userIfo: OnlineUser): Promise<OnlineUser[]> {
    const user = await Online_userModel.findOne({ username: userIfo.username })
    if (user === null) {
      await Online_userModel.create(userIfo).catch((err) => {
        throw new Error(err.message)
      })
      return []
    }
    const onlineUsers = await Online_userModel.find({})
    console.log({ addId: onlineUsers[0].userId })
    return onlineUsers
  }
  static async getUserById(userId: string): Promise<Pick<UserTypes, "userId" | "imageName" | "username">> {
    const user = await UserModel.findOne({ userId: userId }, { userId: 1, imageName: 1, username: 1 })
    let result = { userId: "", imageName: "", username: "" }
    if (user?.userId) {
      const { userId, username, imageName } = user
      result = { username, userId, imageName }
    }
    return result
  }

  static async getAllUsers(): Promise<Pick<UserTypes, "email" | "imageName" | "userId" | "username">[]> {
    const allUsers: Pick<UserTypes, "email" | "userId" | "username" | "imageName">[] = await UserModel.find({}, { email: 1, imageName: 1, username: 1, userId: 1 })
    return allUsers || []
  }

  static async removeOnlineUser(userId: string) {
    let res = { username: "", onlineUsers: [] as OnlineUser }
    const user: OnlineUser = await Online_userModel.findOne({ userId: userId })
    if (user !== null) {
      await Online_userModel.deleteOne({ userId: userId })
      const onlineUsers = await Online_userModel.find({})
      res = { username: user.username, onlineUsers }
    }
    return res
  }

  static async getUserImage(userId: string): Promise<{ [imageName: string]: string }> {
    const user = await UserModel.findOne({ userId: userId }, { image: 1, imageName: 1 })
    let result = {}
    if (user) {
      const key = user.imageName
      const value = user.image
      result = { [key]: value }
    }
    return result
  }

  static async getAllUsersImages(userId: string) {
    const allUsers = await UserModel.find({}, { userId: 1, image: 1, imageName: 1 })
    const images: { [imageName: string]: string }[] = []

    for (let i = 0; i < allUsers.length; i++) {
      const user = allUsers[i]
      if (user.userId !== userId) {
        const key = user.imageName
        const value = user.image
        images.push({ [key]: value })
      }
    }
    return images
  }
}

export default User
