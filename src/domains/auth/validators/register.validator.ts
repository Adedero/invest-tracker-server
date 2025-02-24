import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { sendResponse } from '../../../utils/helpers'

export default async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const Schema = z.object({
    fullName: z
      .string({ message: 'Full name is required' })
      .min(2, { message: 'Enter a valid name' })
      .trim(),
    email: z.string().email({ message: 'Enter a valid email address' }).trim(),
    password1: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' })
      .trim(),
    password2: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' })
      .trim()
  })

  const result = await Schema.safeParseAsync(req.body)

  if (result.success) {
    const { password1, password2 } = result.data

    if (password2 !== password1) {
      sendResponse(
        res,
        400,
        'Passwords do not match. Please, confirm your password.'
      )
    }

    next()
    return
  }
  res.status(400).json({
    success: false,
    message: result.error.errors[0].message
  })
}
