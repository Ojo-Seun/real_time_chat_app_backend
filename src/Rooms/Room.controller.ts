import { RomeTypes, UserTypes, MessageTypes } from "../types"
import User from "../Users/User.controller"
import crypto from "crypto"

class Rome {
  name: RomeTypes["name"]
  description: RomeTypes["description"]
  userId: RomeTypes["userId"]
  static users: RomeTypes["users"] = []
  static messages: RomeTypes["messages"] = []
  rooms: RomeTypes[] = []

  constructor(name: string, description = "", userId: string) {
    this.name = name
    this.description = description
    this.userId = userId
  }

  getRoom() {
    const room = this.rooms.find((x) => x.name === this.name)
    if (room?.name) {
      return room
    }

    const newRoom = {
      name: this.name,
      description: this.description,
      userId: this.userId,
      id: crypto.randomUUID(),
      messages: [],
    }
  }

  static setUser(user: UserTypes): void {
    this.users.push(user)
  }

  static getUser(userId: string): UserTypes | null {
    const user = this.users.find((x) => x.userId === userId)

    return user || null
  }

  static setMessage(message: MessageTypes): void {
    this.messages.push(message)
  }
}
