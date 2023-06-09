import mongoose, { Schema } from "mongoose"
import { RoomTypes, UserTypes, MessageTypes } from "../types"
import User from "../Users/User.controller"
import RoomModel from "./Room.schema"
import UserModel from "../Users/User.schema"
import { generateUniqueId } from "../utills"

class Room implements RoomTypes {
  name: string
  userId: string
  users: UserTypes[] = []
  messages: MessageTypes[] = []
  roomId: string = ""
  constructor(name: string, userId: string) {
    this.name = name.toLowerCase()
    this.userId = userId
  }

  private static checkIfAuserExistInAroom(room: RoomTypes, userId: string): boolean {
    const isExist = room.users.find((user) => user.userId === userId)
    return isExist ? true : false
  }

  private static async findRoomByName(roomName: string): Promise<RoomTypes> {
    const room = await RoomModel.findOne({ name: roomName })
    let result = { name: "", roomId: "", messages: [] as RoomTypes["messages"], users: [] as RoomTypes["users"], logo: "", userId: "" }
    if (room?.name) {
      const { name, roomId, messages, users, logo, userId } = room
      result = { name, roomId, messages, users, logo: logo ? logo : "", userId }
    }
    return result
  }

  private static async addAuserToAroom(room: RoomTypes, user: Pick<UserTypes, "username" | "userId" | "imageName">): Promise<RoomTypes> {
    const { userId, username, imageName } = user
    room.users = [...room.users, { username, userId, imageName }]
    await RoomModel.findOneAndReplace({ roomId: room.roomId }, room)
    return room
  }

  private static async removeAuserFromAroom(room: RoomTypes, userId: string): Promise<RoomTypes> {
    let upDatedRoom = {} as RoomTypes
    const upDatedRoomUsers = room.users.filter((user) => user.userId !== userId)
    // update the room with upDated users list
    room.users = upDatedRoomUsers
    // Update the database
    await RoomModel.findOneAndUpdate({ roomId: room.roomId }, { users: upDatedRoomUsers })
    // Chect if user is still in a room
    if (upDatedRoomUsers.length > 0) {
      upDatedRoom = room
    }

    return upDatedRoom
  }

  async createAroom(): Promise<{ name: string; roomId: string; numOfMessages: number } | null> {
    if (!this.name || !this.userId) return null
    let result = { name: "", roomId: "", numOfMessages: 0 }
    let room = await Room.findRoomByName(this.name) // Check if room is already exist
    if (room.roomId) {
      result = { name: room.name, roomId: room.roomId, numOfMessages: room.messages.length }
    } else {
      const room = new RoomModel({
        name: this.name,
        userId: this.userId,
        users: [],
        messages: [],
        roomId: generateUniqueId(),
      })
      const response = await room.save()
      if (response?.roomId) {
        const { name, roomId, messages } = response
        result = { name, roomId, numOfMessages: messages.length }
      } else {
        throw new Error("Room can not be created")
      }
    }

    return result
  }

  static async joinAroom(roomName: string, userId: string): Promise<{ room: Pick<RoomTypes, "messages" | "roomId" | "users" | "name">; username: string }> {
    let result = { room: { name: "", roomId: "", messages: [] as RoomTypes["messages"], users: [] as RoomTypes["users"] }, username: "" }
    const user = await User.getUserById(userId)
    const room = await this.findRoomByName(roomName)
    if (user.userId && room.roomId) {
      let upDatedRoom = {} as RoomTypes
      // check if a user is already in a room
      if (!this.checkIfAuserExistInAroom(room, userId)) {
        upDatedRoom = await this.addAuserToAroom(room, user)
      }
      const { name, roomId, messages, users } = room
      result = { room: { name, roomId: roomId ? roomId : "", messages, users: upDatedRoom ? upDatedRoom.users : users }, username: user.username }
    }

    return result
  }

  static async leaveAroom(roomName: string, userId: string): Promise<string> {
    let result = ""
    const room = await this.findRoomByName(roomName)
    const user = await User.getUserById(userId)
    if (room.roomId && user.userId) {
      await this.removeAuserFromAroom(room, userId)
      result = user.username
    }

    return result
  }

  static async getAllRooms(): Promise<RoomTypes[]> {
    const allRooms = await RoomModel.find({}, { _id: 0, _v: 0 })
    return allRooms
  }

  static async getConnectedRooms(userId: string) {
    const rooms = await RoomModel.find({}, { messages: 1, roomId: 1, name: 1, users: 1, userId: 1, _id: 0 })
    const roomsConnected = rooms.filter((room) => {
      for (let i = 0; i < room.users.length; i++) {
        const element = room.users[i]
        if (element.userId === userId) {
          return room
        }
      }
    })
    return roomsConnected
  }

  static async getConnectedRoomsName(userId: string) {
    const roomsConnected = await this.getConnectedRooms(userId)
    const roomsConnectedName = roomsConnected.map((room) => room.name)
    return roomsConnectedName
  }
  static async getRoomMessages(roomName: string): Promise<MessageTypes[] | any[]> {
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
