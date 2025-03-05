import winston from 'winston'
import path from 'node:path'
import 'winston-daily-rotate-file'
import { IS_PRODUCTION_ENV } from '../utils/constants'

const logDirectory = path.resolve('logs')

// Custom colors for log levels
const customColors = {
  error: 'red',
  warn: 'yellow',
  info: 'blue',
  debug: 'green'
}

winston.addColors(customColors)
// Create a logger instance
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level.toUpperCase()}]: ${message}`
        }),
        winston.format.colorize({ all: true }),
      )
    }),
    IS_PRODUCTION_ENV ?
    new winston.transports.DailyRotateFile({
      filename: path.join(logDirectory, 'site-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info'
    }) :
    false
  ].filter(Boolean) as winston.transport[]
})


// Custom error handler
const originalError = logger.error
logger.error = (msg, error?) => {
  if (msg instanceof Error) {
    return originalError.call(logger, {
      error: `${msg.message}\nStack: ${msg.stack}`
    })
  } else {
    return originalError.call(logger, { error: `${msg}: ${error.message || error}` })
  }
}

export default logger
