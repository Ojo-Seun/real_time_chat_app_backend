import { UserTypes } from "../src/types"
import jwt from "jsonwebtoken"

const generateToken = (user: Pick<UserTypes, "username" | "email" | "userId" | "image">) => {
  return jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: "2d" })
}

var psw = new RegExp("(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[$#&@_!^=]).{8,9}")

const RegExP = new Map([
  ["username", /^[A-Za-z0-9]{3,20}$/],
  ["email", /^[a-zA-Z0-9_]+@[a-z]+\.[a-z]{2,3}(\.[a-z]{2,3})?$/],
  ["password", psw],
  ["image", /data:([-\w]+\/[-+\w.]+)?(;?\w+=[-\w]+)*(;base64)?,.*/gu],
])

const validateInput = (name: string, value: string) => {
  const valid = RegExP.get(name)?.test(value)
  return valid
}

export { generateToken, validateInput }
