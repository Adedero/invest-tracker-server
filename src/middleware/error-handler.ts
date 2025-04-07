import { NextFunction, Request, Response } from 'express'
//import { IS_PRODUCTION_ENV } from '../utils/constants'
import logger from '../utils/logger'

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars

export default function (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  const message = err.message //IS_PRODUCTION_ENV ? 'Something went wrong' : err.message
  logger.error(`Server Error: ${message}`, err)
  res.status(500).json({ success: false, message })
  return
}
