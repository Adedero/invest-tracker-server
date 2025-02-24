import { Request, Response } from 'express'
import { sendResponse } from '../../../utils/helpers'
import getRepository from '../../../utils/repository'
import { isTokenExpired } from '../../../utils/token'
import * as jwt from 'jsonwebtoken'
import env from '../../../utils/env'
import * as argon from 'argon2'
import { sendEmail } from '../../../utils/mail'
import { createNotification } from '../../../utils/handlers'
import { User } from '../../../models/user.model'
import { emailTemplate } from '../../../utils/emails'

export const checkIfUserExists = async (req: Request, res: Response) => {
  const { field, value } = req.query

  if (!field || !value) {
    sendResponse(res, 400, 'Bad request')
    return
  }

  const users = await getRepository('User')

  const parsedField = field.toString()
  const parsedValue = value.toString()

  const [error, user] = await users.findOne({
    where: {
      [parsedField]: parsedValue
    },
    select: ['id']
  })

  if (error) {
    sendResponse(res, 500, error.message)
    return
  }
  const userExists = !!user

  sendResponse(res, 200, { userExists, userId: user?.id || null })
}

export const resetPassword = async (req: Request, res: Response) => {
  const { userId, otp, token } = req.query
  const { password }: { password: string } = req.body

  if (!password) {
    sendResponse(res, 400, 'No password provided')
    return
  }

  if (password.length < 8) {
    sendResponse(res, 400, 'Password must be at least 8 characters long')
    return
  }

  const [users, tokens] = await Promise.all([
    getRepository('User'),
    getRepository('Token')
  ])

  const [error, user] = await users.findOne({
    where: { id: userId },
    relations: { verificationToken: true },
    select: ['id', 'password', 'name', 'email']
  })

  if (error) {
    sendResponse(res, 500, error.message)
    return
  }

  if (!user) {
    sendResponse(
      res,
      400,
      'Your account does not exist or may have been deleted. You may need to register a new account.'
    )
    return
  }

  const isOldPassword = await argon.verify(user.password, password)
  if (isOldPassword) {
    sendResponse(
      res,
      400,
      'New password cannot be the same as the old password'
    )
    return
  }

  let providedToken: string | undefined = otp?.toString()

  if (!providedToken && token) {
    try {
      const payload = jwt.verify(token.toString(), env.get('JWT_SECRET')) as {
        token: string
      }
      if (!payload || !payload.token) {
        sendResponse(res, 400, 'Invalid or expired OTP. Try again later')
        return
      }
      providedToken = payload.token
    } catch (err) {
      if ((err as Error).message === 'jwt expired') {
        await tokens.delete(user.verificationToken?.id)
        user.verificationToken = null
        await users.save(user)
      }
      sendResponse(res, 400, 'Invalid or expired OTP. Try again later.')
      return
    }
  }

  if (!user.verificationToken) {
    sendResponse(res, 400, 'Invalid or expired OTP. Try again later.')
    return
  }

  if (isTokenExpired(user.verificationToken.expiresIn)) {
    sendResponse(res, 400, 'Invalid or expired OTP. Try again later.')
    return
  }

  if (providedToken !== user.verificationToken.value) {
    sendResponse(
      res,
      400,
      'Invalid or expired OTP. Check your email and try again, or use the verification link sent to your email.'
    )
    return
  }

  const hash = await argon.hash(password)

  user.password = hash
  await tokens.delete(user.verificationToken?.id)
  user.verificationToken = null
  await users.save(user)

  await Promise.all([
    createNotification({
      userId: user.id,
      title: 'Password Reset',
      description:
        'Your password has been reset successfully. If you did not initiate this action, contact us immediately.',
      user: user as User
    }),
    sendEmail({
      toEmail: user.email,
      fromEmail: env.get('EMAIL_USER'),
      subject: 'Password Reset',
      html: emailTemplate({
        subject: 'Password Reset',
        name: user.name,
        intro: 'Your password has been successfully reset.',
        cta: {
          intro: 'Please, log in to continue on Invest Tracker',
          buttonLabel: 'Log in',
          href: `${env.get('CLIENT_URL')}/auth/login`
        },
        outro:
          '<span style="color: red">If you did not initiate a password reset, please contact us immediately by replying to this email.</span>',
        footer:
          'You received this email because you completed a password reset.'
      })
    })
  ])
  sendResponse(res, 200, { message: 'Password reset complete' })
  return
}
