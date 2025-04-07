import { CronJob } from 'cron'
import { distributeProfit } from '../domains/user/services/profit.service'

export const job = new CronJob(
  '*/30 * * * *', // Runs at the start of every hour
  async function () {
    await distributeProfit();
  },
  null, // onComplete
  true, // start automatically
);
