import passport from 'passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import env from '../utils/env'
import getRepository from '../utils/repository'

const JWT_SECRET = env.get('JWT_SECRET')

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET
}

passport.use(
  new Strategy(jwtOptions, async (payload, done) => {
    try {
      const User = await getRepository('User')
      const [error, user] = await User.findOne({
        where: { id: payload.id }
      })
      if (error) throw error
      if (!user) return done(null, false)
      //Add more fields as needed
      const authenticatedUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
      return done(null, authenticatedUser)
    } catch (err) {
      return done(err, false)
    }
  })
)

export default passport
