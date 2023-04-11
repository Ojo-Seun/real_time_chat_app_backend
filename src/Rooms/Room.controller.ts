import mongoose, { Schema } from "mongoose"
import { RoomTypes, UserTypes, MessageTypes } from "../types"
import User from "../Users/User.controller"
import RoomModel from "./Room.schema"
import UserModel from "../Users/User.schema"

class Room implements RoomTypes {
  name: string
  description: string
  userId: string
  users: any[] = []
  messages: MessageTypes[] = []
  roomId: string = ""
  activeRooms: RoomTypes[] = [] // List of rooms with online users

  constructor(name: string, description: string, userId: string) {
    this.name = name
    this.description = description
    this.userId = userId
  }

  private checkIfAuserExistInAroom(room: RoomTypes, userId: string): boolean {
    const isExist = room.users.find((user) => user.userId === userId)
    return isExist?.userId ? true : false
  }

  async addRoom() {
    // Check if room already exist in the database
    let room: RoomTypes | null = await RoomModel.findOne({ name: this.name }, { name: 1, description: 1, userId: 1, users: 1, messages: 1, roomId: 1 })
    if (room?.name) {
      // Check if room is already added to list of activeRooms
      const isExist = this.activeRooms.find((room) => room.name === this.name)
      if (!isExist) {
        if (!this.checkIfAuserExistInAroom(room, this.userId)) {
          const user = await User.getUserById(this.userId)
          room.users.push(user!)
        }
        this.activeRooms.push(room)
      }

      return this.activeRooms
    } else {
      const user = await User.getUserById(this.userId)
      this.users.push(user)
      const newRoom = {
        name: this.name,
        description: this.description,
        userId: this.userId,
        users: this.users,
        messages: [],
      }
      this.activeRooms.push(newRoom)
      await RoomModel.create(newRoom)
        .then((res) => {})
        .catch((err) => {
          throw new Error(err.message)
        })
      const allRooms = await RoomModel.find({})

      return allRooms
    }
  }

  // Get list of rooms the user is connect to
  getConnectedRooms(userId: string) {
    const roomsConnected = this.activeRooms.filter((room) => {
      for (let i = 0; i < room.users.length; i++) {
        const element = room.users[i]
        if (element.userId === userId) {
          return room
        }
      }
    })
    return roomsConnected
  }

  async getAllMessagesInAroom(roomName: string): Promise<MessageTypes[] | any[]> {
    const room = await RoomModel.findOne({ name: roomName })
    const messages = room ? room.messages : []
    return messages
  }

  static addMessageToARoom(roomName: string, message: MessageTypes): void {
    RoomModel.findOne({ name: roomName })
      .then((room) => {
        RoomModel.findOneAndUpdate({ roomId: room?.roomId }, { messages: [...room?.messages!, message] }).catch((err) => console.log(err))
      })
      .catch((err) => {
        console.log(err)
      })
  }
}

export default Room
