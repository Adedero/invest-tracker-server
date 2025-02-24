import { Router } from 'express'
import AuthController from './auth.controller'
import loginValidator from './validators/login.validator'
import registerValidator from './validators/register.validator'
import verifyEmailValidator from './validators/verify-email.validator'
import { getHandler } from '../../utils/handlers'

const router = Router()

router.post('/login', loginValidator, AuthController.login)

router.post('/register', registerValidator, AuthController.register)

router.post(
  '/email-verification-token',
  AuthController.sendEmailVerificationToken
)

router.post('/verify-email', verifyEmailValidator, AuthController.verifyEmail)

router.get('/check-user', AuthController.checkIfUserExists)

router.post('/password-reset', AuthController.resetPassword)

//Users
router.get('/users/:id?', getHandler('User'))

export default router
