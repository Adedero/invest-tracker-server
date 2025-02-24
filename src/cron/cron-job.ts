import { CronJob } from 'cron'
import { distributeProfit } from '../domains/user/services/profit.service'
import logger from '../utils/logger'

export const job = new CronJob(
  '* * * * * ', // cronTime
  async function () {
    await distributeProfit()
    logger.info('Profit Distrubuted')
  }, // onTick
  null, // onComplete
  true, // start
  'America/Los_Angeles'
)
