import { Request, Response } from 'express'
import { sendResponse } from '../../../utils/helpers'
import getRepository from '../../../utils/repository'
import {
  generateToken,
  isTokenExpired,
  setTokenExpiry
} from '../../../utils/token'
import { Token } from '../../../models/token.model'
import * as jwt from 'jsonwebtoken'
import env from '../../../utils/env'
import { sendEmail } from '../../../utils/mail'
import { createNotification } from '../../../utils/handlers'
import { User } from '../../../models/user.model'
import { Not } from 'typeorm'
import { emailTemplate } from './../../../utils/emails';

export const sendEmailVerificationToken = async (
  req: Request,
  res: Response
) => {
  const { userId, emailSubject } = req.query
  const { email }: { email: string } = req.body

  if (!userId) {
    sendResponse(
      res,
      400,
      'Failed to send OTP because the user could not be verified. Try again later'
    )
    return
  }

  const users = await getRepository('User')

  const [error, user] = await users.findOne({
    where: { id: userId },
    relations: { verificationToken: true }
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

  let token = user.verificationToken

  if (!token || isTokenExpired(token.expiresIn)) {
    token = token || new Token()
    token.value = generateToken(6, 'numeric')
    token.expiresIn = setTokenExpiry('1 hour')

    user.verificationToken = token
    const [error] = await users.save(user)
    if (error) {
      sendResponse(res, 500, error.message)
      return
    }
  }

  const encryptedToken: string = jwt.sign(
    { token: token.value },
    env.get('JWT_SECRET'),
    { expiresIn: '1hr' }
  )

  const emailToVerify = email || user.email

  const verificationLink = new URL(
    `auth/email-verification?userId=${user.id}&token=${encryptedToken}&email=${btoa(emailToVerify)}`,
    env.get('CLIENT_URL')
  ).href

  const emailError = await sendEmail({
    toEmail: emailToVerify,
    subject: emailSubject?.toString() || 'Invest Tracker',
    html: emailTemplate({
      subject: emailSubject?.toString() || 'Invest Tracker',
      name: user.name,
      intro: `Your one-time password is <div style="font-size: 1.65rem; font-weight: 600; color: #285baa">${token.value}</div>`,
      info: `You can also copy and paste the following link into your browser to complete your request: <div><strong>${verificationLink}</strong></div>`,
      cta: {
        intro: 'Or click the button below',
        href: verificationLink,
        buttonLabel: 'Verify'
      },
      outro: 'The link and OTP expires in 1 hour.',
      footer: 'If you did not recently open an account with us or request for an email change or request a password reset, please ignore this email. Your account is safe and secure.'
    })
  })

  if (emailError) {
    sendResponse(res, 400, emailError.message)
    return
  }

  const data = {
    id: user.id,
    name: user.name,
    email: emailToVerify
  }

  sendResponse(res, 200, data)
  return
}


export const verifyEmail = async (req: Request, res: Response) => {
  const { userId, otp, token } = req.query
  const { email }: { email: string } = req.body

  const [users, tokens] = await Promise.all([
    getRepository('User'),
    getRepository('Token')
  ])

  if (email) {
    const existingUser = await users.model.findOne({
      where: { id: Not(userId), email }
    })
    if (existingUser) {
      sendResponse(res, 400, 'This email address is not available')
      return
    }
  }

  const [error, user] = await users.findOne({
    where: { id: userId },
    relations: { verificationToken: true }
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

  user.isEmailVerified = true
  const verifiedEmail = email || user.email
  user.email = verifiedEmail
  await tokens.delete(user.verificationToken?.id)
  user.verificationToken = null
  await users.save(user)

  await Promise.all([
    createNotification({
      userId: user.id,
      title: 'Email Verified',
      description: `Your email ${user.email} was successfully verified.`,
      user: user as User
    }),

    sendEmail({
      toEmail: user.email,
      fromEmail: env.get('EMAIL_USER'),
      subject: 'Email Verified',
      html: emailTemplate({
        subject: 'Email Verified',
        name: user.name,
        intro: `Your email ${user.email} was successfully verified.`,
        cta: {
          intro: 'Please, log in to continue on Invest Tracker',
          buttonLabel: 'Log in',
          href: `${env.get('CLIENT_URL')}/auth/login`
        },
        footer: 'You received this email because you completed an email verification process.'
      })
    })
  ])

  sendResponse(res, 200, { message: 'Email verified' })
  return
}
