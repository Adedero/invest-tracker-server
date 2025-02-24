import { Router } from 'express'

//Import routes
import authRoutes from '../domains/auth/auth.routes'
import adminRoutes from '../domains/admin/admin.routes'
import userRoutes from '../domains/user/user.routes'

import authenticate from '../middleware/authenticate'

const router = Router()

//Register all routes here
export default function routes() {
  router.use('/auth', authRoutes)
  router.use('/admin', authenticate('admin'), adminRoutes)
  router.use('/user', authenticate('user'), userRoutes)
  return router
}
