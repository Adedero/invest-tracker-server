import { CronJob } from 'cron'
import { distributeProfit } from '../domains/user/services/profit.service'
import logger from '../utils/logger'

export const job = new CronJob(
  '0 0 * * *', // Runs at 12:00 AM (midnight) every day
  async function () {
    await distributeProfit();
    logger.info('Profit Distributed');
  },
  null, // onComplete
  true, // start automatically
  'America/Los_Angeles' // Timezone
);