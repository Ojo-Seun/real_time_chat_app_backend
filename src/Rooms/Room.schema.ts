import mongoose, { Schema, model } from "mongoose"

const MessageSchema = new Schema({
  sender: { type: String, required: true },
  userId: { type: String, required: true },
  to: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Number, required: true, default: Date.now() },
  imageName: { type: String, required: true },
})

const UserSchema = new Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  imageName: { type: String, required: true },
})

const RoomSchema = new Schema({
  name: { type: String, required: true, unique: true },
  logo: String,
  roomId: { type: String, unique: true, required: true },
  userId: { type: String, required: true },
  users: { type: [UserSchema], required: true },
  messages: { type: [MessageSchema], required: true },
})

RoomSchema.path("name").validate((name) => {
  const isExist = mongoose.modelNames().includes(name)
  return !isExist
}, "{name} already exist")

const RoomModel = model("RoomModel", RoomSchema)

export default RoomModel
