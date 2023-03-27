import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

const isAuth = (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers

  if (authorization) {
    const Token = authorization.split(" ")[1]
    jwt.verify(Token, process.env.JWT_SECRET!, (err, decode) => {
      if (err) {
        throw new Error("Invalid Token")
      }

      req.body.user = decode
      next()
    })
  } else {
    res.status(401).json({ message: "Unauthorised" })
  }
}

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.body.user && req.body.user.isAdmin) {
    next()
  } else {
    res.status(401).json({ message: "Unauthorised" })
  }
}

export { isAdmin, isAuth }
