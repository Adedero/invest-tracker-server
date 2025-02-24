import { type Request, type Response } from 'express'
import getRepository from '../../../utils/repository'
import { sendResponse } from '../../../utils/helpers'
import * as argon from 'argon2'
import * as jwt from 'jsonwebtoken'
import env from '../../../utils/env'

export default async function login(req: Request, res: Response) {
  const { email, password } = req.body

  const users = await getRepository('User')

  const [error, user] = await users.findOne({
    where: { email },
    select: [
      'id',
      'name',
      'email',
      'password',
      'role',
      'isEmailVerified',
      'image'
    ]
  })

  if (error) {
    sendResponse(res, 500, error.message)
    return
  }

  if (!user) {
    sendResponse(res, 400, 'Incorrect email or password')
    return
  }

  const isPasswordCorrect = await argon.verify(user.password, password)

  if (!isPasswordCorrect) {
    sendResponse(res, 400, 'Incorrect email or password')
    return
  }

  const jwtPayload = { id: user.id, role: user.role }
  const token = jwt.sign(jwtPayload, env.get('JWT_SECRET'), { expiresIn: '1h' })

  const responsePayload = {
    success: true,
    message: 'Log in successful',
    user: { ...user, password: undefined, token }
  }

  sendResponse(res, 200, responsePayload)
}
