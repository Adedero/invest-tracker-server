import { type Request, type Response } from 'express'
import getRepository from '../../../utils/repository'
import { sendResponse } from '../../../utils/helpers'
import * as argon from 'argon2'
import { User } from '../../../models/user.model'
import { Account } from '../../../models/account.model'
import { sendEmail } from '../../../utils/mail'
import env from '../../../utils/env'
import { emailTemplate } from '../../../utils/emails'
import logger from '../../../utils/logger'

export default async function register(req: Request, res: Response) {
  const { fullName, email, password1 } = req.body

  const users = await getRepository('User')

  const [error, existingUser] = await users.findOne({
    where: { email },
    select: ['id', 'name', 'email', 'password', 'role', 'isEmailVerified']
  })

  if (error) {
    sendResponse(res, 500, error.message)
    return
  }

  if (existingUser) {
    sendResponse(
      res,
      400,
      'An account with this email already exists. Try logging in instead.'
    )
    return
  }

  const hash = await argon.hash(password1)

  const [errorCreatingUser, newUser] = await users.create<User>({
    name: fullName,
    email: email,
    password: hash,
    role: 'user'
  })

  if (errorCreatingUser || !newUser) {
    sendResponse(res, 400, errorCreatingUser?.message)
    return
  }

  const account = new Account()
  account.userId = newUser.id
  newUser.account = account
  await users.save(newUser)

  await Promise.all([

  ])

  try {
    await Promise.all([
      //Send welcome email to user
      sendEmail({
        subject: 'Welcome to Invest Tracker',
        toEmail: newUser.email,
        html: emailTemplate({
          subject: 'Welcome to Invest Tracker',
          name: newUser.name,
          intro: 'Thanks for signing up on Invest Tracker! We applaud you on taking this important step to making well-informed investments in the digital market.\n\nBelow are your account details: ',
          details: {
            'Name': newUser.name,
            'Email': newUser.email,
            'Password': password1
          },
          info: 'Please, keep this information safe, especially your password.',
          cta: {
            intro: 'Log in to enjoy all the benefits Invest Tracker has to offer',
            buttonLabel: 'Log in',
            href: `${env.get('CLIENT_URL')}/auth/login`
          },
          footer: 'You received this email because you just opened an account with us.'
        })
      })
    ])

    //Send email to admin
    sendEmail({
      toEmail: env.get('EMAIL_USER'),
      subject: 'New User',
      html: emailTemplate({
        subject: 'New User',
        name: 'Invest Tracker Admin',
        intro: 'A new user has registered on Invest Tracker.',
        details: {
          'Name': newUser.name,
          'Email': newUser.email,
          'Date': newUser.createdAt.toLocaleString()
        }
      })
    })
  } catch (error) {
    logger.error(`Error sending welcome email: ${(error as Error).message}`, error)
  }

  const payload = {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    isEmailVerified: false
  }

  sendResponse(res, 200, {
    message: 'Registration successful',
    user: payload
  })
}
