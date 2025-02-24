import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

export default async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const Schema = z.object({
    email: z
      .string({ message: 'Email is required' })
      .email({ message: 'Please enter a valid email address' }),
    password: z
      .string({ message: 'Password is required' })
      .min(8, { message: 'Password must be at least 8 characters long' })
  })

  const result = await Schema.safeParseAsync(req.body)

  if (result.success) {
    next()
    return
  }
  res.status(400).json({
    success: false,
    message: result.error.errors[0].message
  })
}
