import 'reflect-metadata'
import 'express-async-errors'
import errorHandler from './middleware/error-handler'
import corsConfig from './config/cors.config'
import express from 'express'
import routes from './routes'
//import { job } from './cron/cron-job'

const app = express()

//job.start()

//Middleware
app.use(corsConfig)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: false }))
app.use(express.static('public'))

app.use(routes())

//Error handling middleware must be the last
app.use(errorHandler)

export default app
