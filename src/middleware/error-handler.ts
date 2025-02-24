import { NextFunction, Request, Response } from 'express'
import { IS_PRODUCTION_ENV } from '../utils/constants'

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
export default function (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const message = IS_PRODUCTION_ENV ? 'Something went wrong' : err.message
  res.status(500).json({ success: false, message })
  return
}
