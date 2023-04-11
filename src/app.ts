import express, { NextFunction, Response, Request } from "express"
import type { ServerToClient, ClientToServer, UserTypes, OnlineUser, RoomTypes } from "./types"
import http from "http"
import { Server } from "socket.io"
import dotenv from "dotenv"
import UserRouter from "./Users/User.routers"
import UserModel from "./Users/User.schema"
import User from "./Users/User.controller"
import cors from "cors"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import Room from "./Rooms/Room.controller"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true }))
app.use("/api", UserRouter)

mongoose.connect(process.env.LOCAL_MONGODB_URL!).then((x) => console.log("Db connected"))

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "..", "client", "build")))
//   app.use(express.static("public"))

//   app.use("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "..", "client", "build", "index.html"))
//   })
// }

const httpServer = http.createServer(app)
const io = new Server<ClientToServer, ServerToClient>(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
})

io.use(async (socket, next) => {
  const { auth } = socket.handshake
  const { token, userId } = auth
  const user = await User.getUserById(userId)
  if (!user?.userId) {
    next(new Error("Please Sign Up"))
  }
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET!, (err: jwt.VerifyErrors | null) => {
      if (err) {
        next(new Error("Invalid Token"))
      } else {
        next()
      }
    })
  } else {
    next(new Error("Please sign in"))
  }
})

io.on("connection", (socket) => {
  console.log(`A user connected`)
  socket.on("join_room", async ({ username, userId, roomName, description, image, email }) => {
    const room = new Room(roomName, description, userId)
    const onlineUsers = User.addOnlineUser({ username, userId, image, sessionId: socket.id })
    let allRooms = await room.addRoom()
    const roomsConnected = room.getConnectedRooms(userId)
    const allUsers = await User.getAllUsers()
    const initialRoomMessages = await room.getAllMessagesInAroom(roomName)

    socket.join(roomName)
    socket.broadcast.to(roomName).emit("alert", { message: `${username} Is Online` })
    io.emit("all_users", allUsers)
    io.emit("online_users", onlineUsers)
    io.emit("all_rooms", allRooms)
    socket.emit("rooms_connected", roomsConnected)
    socket.emit("initial_room_messages", initialRoomMessages)
  })

  socket.on("send_message", (message) => {
    Room.addMessageToARoom(message.to, message)
    socket.broadcast.to(message.to).emit("recieve_message", message)
  })

  socket.on("disconnect", () => {
    console.log("User disconnet")
    socket.broadcast.emit("alert", { message: "A User Left" })
  })
})
/*
  socket.on("disconnect", () => {
    const { username, room } = users[clientId]
    socket.to(room).emit("user left", { username, room })
    delete users[clientId]
    io.to(room).emit("room users", getUsersInRoom(room))
  })

  const getUsersInRoom = (room: string) => {
    const usersInRoom = []
    for (const [id, user] of Object.entries(users)) {
      if (user.room === room) {
        usersInRoom.push(user.username)
      }
    }
    return usersInRoom
  }
  */

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const status = err.name && err.name === "validationError" ? 400 : 500
  res.status(status).send({ message: err.message })
})

export default httpServer
