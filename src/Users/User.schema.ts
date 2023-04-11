import mongoose, { Schema, model } from "mongoose"

const UserSchema = new Schema({
  userId: { type: String, required: true, default: new mongoose.Types.ObjectId(), unique: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  userRoomNames: { type: [String], required: true },
  image: { type: String, required: true },
  password: { type: String, required: true },
})

const UserModel = model("UserModel", UserSchema)

export default UserModel
