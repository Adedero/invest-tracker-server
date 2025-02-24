import http from 'node:http'
import logger from './utils/logger'
import { IS_PRODUCTION_ENV } from './utils/constants'
import env from './utils/env'
import app from './app'

const PORT = env.get('PORT', '5000')

const server = http.createServer(app)

server.listen(PORT, () => {
  if (!IS_PRODUCTION_ENV) {
    logger.info(`Server running on http://localhost:${PORT}`)
  }
})

process.on('SIGINT', () => {
  server.close(() => {
    logger.info('Server closed.')
    process.exit(0)
  })
})
