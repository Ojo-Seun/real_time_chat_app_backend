import express, { Response, Request } from "express"
import { validateInput, generateToken } from "../utills"
import UserModel from "./User.schema"
import expressAsyncHandler from "express-async-handler"
import bcrypt from "bcrypt"

const router = express.Router()

router.post(
  "/sign_up",
  expressAsyncHandler(async (req: Request, res: Response) => {
    const { userInfo } = await req.body

    const { username, email, password, image } = userInfo
    if (!username || !email || !password || !image) throw new Error("Invalid Inputs")
    for (const key in userInfo) {
      const valid = validateInput(key, userInfo[key])
      if (!valid) throw new Error(`${key} format not match`)
    }

    const isEXist = await UserModel.findOne({ email: email })
    if (isEXist?.email) throw new Error(`${email} allready exist`)

    const user = new UserModel({
      username,
      email,
      userRoomsId: [],
      image,
      password: bcrypt.hashSync(password, 12),
    })

    user
      .save()
      .then((newUser) => {
        const { username, email, userId, image } = newUser

        res.status(201).json({
          username,
          email,
          userId,
          image,
          token: generateToken({ username, userId: userId.toString("hex"), email, image }),
        })
      })
      .catch((err) => {
        throw new Error(err.message)
      })
  })
)

router.post(
  "/sign_in",
  expressAsyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body
    if (!email || !password) throw new Error("No email or password")
    for (const key in req.body) {
      const valid = validateInput(key, req.body[key])
      if (!valid) throw new Error("Invalid inputs")
    }

    const user = await UserModel.findOne({ email: email })
    if (user) {
      const isAuthentic = await bcrypt.compare(password, user.password)
      if (!isAuthentic) throw new Error("Invalid password")

      const { username, email, userId, image } = user
      res.status(200).json({
        username,
        userId,
        email,
        image,
        token: generateToken({ username, email, image, userId: userId.toString("hex") }),
      })
    } else {
      throw new Error("Invalid email")
    }
  })
)

export default router
