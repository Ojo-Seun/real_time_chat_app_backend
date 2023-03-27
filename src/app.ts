import express, { NextFunction, Response, Request } from "express"
import type { ServerToClient, ClientToServer } from "./types"
import http from "http"
import { Server } from "socket.io"
import path from "path"
import dotenv from "dotenv"
import UserRouter from "./Users/User.routers"
import cors from "cors"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"
dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())
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

io.use((socket, next) => {
  const {
    auth: { token },
  } = socket.handshake
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
  socket.on("join_room", ({ username, roomName }) => {
    socket.join("General")
    socket.broadcast.emit("alert", { message: `${username} joined the ${roomName} room` })
  })

  socket.on("send_message", (message) => {
    socket.to(message.to).emit("recieve_message", message)
  })

  socket.on("disconnect", () => {
    console.log("User disconnet")
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
