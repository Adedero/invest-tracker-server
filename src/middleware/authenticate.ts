import { NextFunction, Request, Response } from 'express'
import passport from '../config/passport.config'
import { User } from '../models/user.model'

const authenticate = (role?: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('jwt', (err: Error, user: User) => {
      if (err) {
        res.status(401).json({
          success: false,
          message: `Authentication failed: ${err.message}`
        })
        return
      }
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User not authorized'
        })
        return
      }
      if (role) {
        if (user.role?.toLowerCase() !== role.toLowerCase()) {
          res.status(403).json({ success: false, message: 'Not allowed' })
          return
        }
      }
      req.user = { ...user }
      next()
    })(req, res, next)
  }
}

export default authenticate
