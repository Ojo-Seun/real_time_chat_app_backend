import mongoose, { Schema, model } from "mongoose"

const OnlineUserSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  image: { type: String, required: true },
  sessionId: String,
})

OnlineUserSchema.path("userId").validate(async (userId) => {
  const userCount = await mongoose.models.OnlineUserModel.count({ userId })
  console.log(userCount)
  return !userCount
}, "{userId} already exist")

const OnlineUserModel = model("OnlineUserModel", OnlineUserSchema)

export default OnlineUserModel
