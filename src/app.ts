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
  socket.on("join_server", async ({ username, userId, image }) => {
    if (!userId) return
    // Create general room if it does not exist
    const room = new Room("general", userId)
    const _room = await room.createAroom()
    // List of all rooms
    const allRooms = await room.getAllRooms()
    // List of  rooms a user is in
    const roomsConnected = await Room.getConnectedRooms(userId)
    // List of online users
    const onlineUsers = await User.addOnlineUser({ username, userId, image, sessionId: socket.id })
    // List of all users
    const allUsers = await User.getAllUsers()
    // Names of rooms the user is connected to before re-connection
    const roomNames = await Room.getConnectedRoomsName(userId)
    // Add rooms the user is already connected to socket
    if (roomNames.length > 0) {
      console.log("Disconnect")
      socket.join(roomNames)
    }

    // emit to all the users including the sender
    io.emit("all_users", allUsers)
    io.emit("online_users", onlineUsers)
    io.emit("all_rooms", allRooms)
    // emit only to the sockect user
    socket.emit("rooms_connected", roomsConnected)
  })

  socket.on("join_room", async ({ roomName, userId }) => {
    const { room, username } = await Room.joinAroom(roomName, userId)
    const roomsConnected = await Room.getConnectedRooms(userId)
    if (room.roomId && username) {
      socket.join(roomName)
      // Emit to all users in a room except the sender
      socket.to(roomName).emit("alert", { message: `${username} Is Online` })
      socket.emit("room_info", room)
      // Emit to all users in a room including the sender
      io.in(roomName).emit("rooms_connected", roomsConnected)
    }
  })

  socket.on("send_message", (message) => {
    Room.addMessageToARoom(message.to, message)
    socket.to(message.to).emit("recieve_message", message)
  })

  socket.on("disconnect", async () => {
    const { userId } = socket.handshake.auth
    console.log("User disconnet")
    const { username, onlineUsers } = await User.removeOnlineUser(userId)
    const roomNames = await Room.getConnectedRoomsName(userId)
    socket.broadcast.emit("alert", { message: `${username} left` })
    socket.to(roomNames).emit("online_users", onlineUsers)
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
