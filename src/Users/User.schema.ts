import mongoose, { Schema, model } from "mongoose"

export const UserSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, default: new mongoose.Types.ObjectId() },
  username: { type: String, required: true },
  email: { type: String, required: true },
  userRoomsId: { type: [String], required: true },
  image: { type: String, required: true },
  password: { type: String, required: true },
})

const UserModel = model("UserModel", UserSchema)

export default UserModel
