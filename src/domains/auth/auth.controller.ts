import {
  sendEmailVerificationToken,
  verifyEmail
} from './services/email-verification'
import login from './services/login'
import { checkIfUserExists, resetPassword } from './services/password-reset'
import register from './services/register'

export default {
  login,
  register,
  sendEmailVerificationToken,
  verifyEmail,
  resetPassword,
  checkIfUserExists
}
