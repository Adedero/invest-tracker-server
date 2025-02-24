import path from 'node:path'
import env from './env'
import swaggerAutogen from 'swagger-autogen'

const doc = {
  info: {
    version: '1.0.0',
    title: 'Invest Tracker REST API'
  },
  host: env.get('BASE_URL', 'localhost:5000'),
  basePath: '/',
  schemes: ['http', 'https']
}

const outputFile = path.resolve('docs/swagger-doc.json')
const routes = ['../app.js']

swaggerAutogen(outputFile, routes, doc)
//.then(() => require('../server'))
