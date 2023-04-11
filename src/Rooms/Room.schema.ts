import mongoose, { Schema, model } from "mongoose"

const MessageSchema = new Schema({
  sender: { type: String, required: true },
  userId: { type: String },
  to: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Number, required: true, default: Date.now() },
  image: { type: String, required: true },
})

const UserSchema = new Schema({
  userId: { type: String, required: true, default: new mongoose.Types.ObjectId(), unique: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  userRoomNames: { type: [String], required: true },
  image: { type: String, required: true },
})

const RoomSchema = new Schema({
  name: { type: String, required: true, unique: true },
  roomId: { type: String, unique: true, default: new mongoose.Types.ObjectId() },
  description: { type: String },
  userId: { type: String, required: true, unique: true },
  users: { type: [UserSchema], required: true },
  messages: { type: [MessageSchema], required: true },
})

const RoomModel = model("RoomModel", RoomSchema)

export default RoomModel
