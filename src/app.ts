import express, { NextFunction, Response, Request } from "express"
import type { ServerToClient, ClientToServer, UserTypes, OnlineUser, RoomTypes } from "./types"
import http from "http"
import { Server } from "socket.io"
import dotenv from "dotenv"
import UserRouter from "./Users/User.routers"
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

let timer: any
io.on("connection", async (socket) => {
  const { userId, username } = socket.handshake.auth

  const handleDisconnection = async () => {
    if (!userId) throw new Error("No userId")
    const { username, onlineUsers } = await User.removeOnlineUser(userId)
    const roomNames = await Room.getConnectedRoomsName(userId)
    socket.to(roomNames).emit("alert", { message: `${username} left` })
    socket.to(roomNames).emit("online_users", onlineUsers)
    console.log(`${username} disconnect`)

    // Remove a user from all the rooms after user disconnect
    roomNames.forEach((name) => {
      socket.leave(name)
    })
  }
  /////////////////////////////
  if (userId) {
    console.log(`${username} connected`)
    // Names of rooms the user is connected to before re-connection
    const roomNames = await Room.getConnectedRoomsName(userId)
    // Add user is the is connected to before disconnection
    if (roomNames.length > 0) {
      socket.join(roomNames)
    }
  }
  /////////////////////////////

  socket.on("join_server", async ({ username, userId, imageName }, cb) => {
    console.log(`${username} joined server`)
    const userInfo: { [key: string]: string } = { username, userId, imageName }
    for (let key in userInfo) {
      if (!userInfo[key]) {
        throw new Error(`No ${userInfo[key]} provided`)
      }
    }
    // Create general room if it does not exist
    const room = new Room("general", userId)
    const _room = await room.createAroom()
    // List of all rooms
    const allRooms = await Room.getAllRooms()
    // List of  rooms a user is in
    const roomsConnected = await Room.getConnectedRooms(userId)
    // List of online users
    const onlineUsers = await User.addOnlineUser({ username, userId, imageName })
    // List of all users
    const allUsers = await User.getAllUsers()
    // Image of the last joined user
    const newUserImage = await User.getUserImage(userId)
    // Images of all the users
    const allUsersImages = await User.getAllUsersImages(userId)

    // emit only to the sockect user
    cb(roomsConnected, allUsersImages)
    //emit to all the clients
    io.emit("all_rooms", allRooms)
    io.emit("all_users", allUsers)
    io.emit("online_users", onlineUsers)
    socket.broadcast.emit("newUserImage", newUserImage)
  })

  socket.on("join_room", async ({ roomName, userId }, cb) => {
    if (!userId || !roomName) throw new Error("No userId or room name")
    const { room, username } = await Room.joinAroom(roomName, userId)
    const roomsConnected = await Room.getConnectedRooms(userId)
    const allRooms = await Room.getAllRooms()
    if (room.roomId && username) {
      socket.join(roomName)
      // Emit only to sender
      cb(room, roomsConnected)
      // Emit to all users in a room except the sender
      socket.to(roomName).emit("alert", { message: `${username} Is Online` })
      // Emit to all users in a room including the sender
      io.in(roomName).emit("all_rooms", allRooms)
    }
  })

  socket.on("leave_room", async ({ roomName, userId }, cb) => {
    if (!userId || !roomName) throw new Error("No userId or room name")
    // Remove user from room database
    const username = await Room.leaveAroom(roomName, userId)
    if (username) {
      const allRooms = await Room.getAllRooms()
      const roomsConnected = await Room.getConnectedRooms(userId)
      socket.to(roomName).emit("alert", { message: `${username} has left this room` })
      io.in(roomName).emit("all_rooms", allRooms)
      cb(roomsConnected)
      // Remove user from room in socket.io
      socket.leave(roomName)
    }
  })

  socket.on("message", (message) => {
    Room.addMessageToARoom(message.to, message)
    socket.to(message.to).emit("message", message)
  })

  socket.on("room_messages", async (roomName) => {
    if (!roomName) throw new Error("No room name")
    const messages = await Room.getRoomMessages(roomName)
    socket.emit("initial_room_messages", messages)
  })

  socket.on("disconnect", () => {
    timer = setTimeout(handleDisconnection, 1000)
  })

  clearTimeout(timer)
})

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const status = err.name && err.name === "validationError" ? 400 : 500
  res.status(status).send({ message: err.message })
})

export default httpServer
