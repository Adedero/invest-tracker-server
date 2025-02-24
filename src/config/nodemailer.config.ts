import nodemailer from 'nodemailer'
import env from './../utils/env'
import { IS_PRODUCTION_ENV } from '../utils/constants'

const EMAIL_USER = env.get('EMAIL_USER')
const EMAIL_HOST = env.get('EMAIL_HOST')
const EMAIL_SERVICE = env.get('EMAIL_SERVICE')
const EMAIL_PASSWORD = env.get('EMAIL_PASSWORD')

export const transporter = nodemailer.createTransport({
  ...(!IS_PRODUCTION_ENV && { service: EMAIL_SERVICE }),
  host: EMAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD
  }
})
