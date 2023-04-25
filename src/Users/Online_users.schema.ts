import mongoose, { Schema, model } from "mongoose"

const Online_userSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  imageName: { type: String, required: true },
})

const Online_userModel = model("Online_userModel", Online_userSchema)

export default Online_userModel
