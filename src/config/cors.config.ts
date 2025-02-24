import cors from 'cors'
import env from '../utils/env'

const corsConfig = cors({
  origin: [env.get('CLIENT_URL') as string],
  methods: ['GET', 'PATCH', 'POST', 'PUT', 'DELETE']
  //allowedHeaders: ['Content-Type', 'Authorization']
})

export default corsConfig
