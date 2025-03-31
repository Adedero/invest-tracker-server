import { CronJob } from 'cron'
import { distributeProfit } from '../domains/user/services/profit.service'
import logger from '../utils/logger'

export const job = new CronJob(
  '0 * * * *', // Runs at the start of every hour
  async function () {
    await distributeProfit();
    logger.info('Profit Distributed');
  },
  null, // onComplete
  true, // start automatically
);
