import { Schema, model } from "mongoose"
import { UserSchema } from "../Users/User.schema"

const MessageSchema = new Schema(
  {
    sender: { type: /^[A-Za-z0-9]{3,}/$, required: true },
    userId: { type: Schema.Types.ObjectId, ref: UserSchema },
    to: { type: /^[A-Za-z0-9]{3,}/$, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
)

const RoomSchema = new Schema({
  roomId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: "" },
  userId: { type: Schema.Types.ObjectId, required: true },
  users: { type: UserSchema, required: true },
  messages: { type: MessageSchema, required: true },
})

const RoomModel = model("RoomModel", RoomSchema)

export default RoomModel
