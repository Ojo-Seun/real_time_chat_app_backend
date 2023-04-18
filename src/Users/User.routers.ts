import express, { Response, Request } from "express"
import { validateInput, generateToken, generateUniqueId } from "../utills"
import UserModel from "./User.schema"
import expressAsyncHandler from "express-async-handler"
import bcrypt from "bcrypt"

const router = express.Router()

router.post(
  "/sign_up",
  expressAsyncHandler(async (req: Request, res: Response) => {
    const { username, email, password, image, name } = await req.body

    // Validate inputs
    const userInfo: { [key: string]: string } = { username, email, password, image, name }
    for (const key in userInfo) {
      const valid = await validateInput(key, userInfo[key])
      if (!valid) throw new Error(`${key} format not match`)
    }
    const isEXist = await UserModel.findOne({ email: email })
    if (isEXist?.email) throw new Error(`${email} allready exist`)
    if (isEXist?.username === username) throw new Error("User name already taken")

    const user = new UserModel({
      username,
      name,
      userId: generateUniqueId(),
      email,
      image,
      password: bcrypt.hashSync(password, 12),
    })

    user
      .save()
      .then((newUser) => {
        const { username, email, userId, image, name } = newUser

        res.status(201).json({
          username,
          email,
          userId,
          image,
          name,
          token: generateToken({ username, userId, email }),
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
      const valid = await validateInput(key, req.body[key])
      if (!valid) throw new Error("Invalid inputs")
    }

    const user = await UserModel.findOne({ email: email })
    if (user) {
      const isAuthentic = await bcrypt.compare(password, user.password)
      if (!isAuthentic) throw new Error("Invalid password")

      const { username, email, userId, image, name } = user
      res.status(200).json({
        username,
        userId,
        email,
        image,
        name,
        token: generateToken({ username, email, userId }),
      })
    } else {
      throw new Error("Invalid email")
    }
  })
)

export default router
