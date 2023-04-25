import mongoose, { Schema, model } from "mongoose"

const UserSchema = new Schema({
  name: { type: String, required: true, unique: true },
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  image: { type: String, required: true },
  imageName: { type: String, required: true, unique: true },
  password: { type: String, required: true },
})

const UserModel = model("UserModel", UserSchema)

export default UserModel
