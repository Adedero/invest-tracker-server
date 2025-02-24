import type { NextFunction, Request, Response } from 'express'
import { sendResponse } from '../../../utils/helpers'

export default async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { userId, otp, token } = req.query

  if (!userId || (!otp && !token)) {
    sendResponse(res, 400, 'Failed to verify email. Try again later.')
    return
  }
  next()
}
