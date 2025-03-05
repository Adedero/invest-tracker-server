import { Investment } from "../../models/investment.model";
import { Profit } from "../../models/profit.model";
import { User } from "../../models/user.model";
import logger from "../../utils/logger";
import { emailTemplate } from '../../utils/emails'
import env from '../../utils/env'
import { createNotification } from '../../utils/handlers'
import { sendEmail } from '../../utils/mail'

interface OnDistributeProfitData {
  investment: Investment,
  profit: Profit
  user: User
}
export default async function onDistributeProfit(data: OnDistributeProfitData) {
  const { investment, profit, user } = data
  try {
    const subject = 'Daily Return on Investment'
    const message = (name?: string) => {
      if (name) {
        return `You received a daily return of $${profit.amount.toLocaleString()} on your investment ${investment.investmentName} (${investment.investmentTier} Tier).`
      } else {
        return `${user.name} received a daily return of $${profit.amount.toLocaleString()} on their investment ${investment.investmentName} (${investment.investmentTier} Tier).`
      }
    }

    const html = (name?: string) => {
      return emailTemplate({
        subject,
        name: name || 'Invest Tracker Admin',
        intro: message(name),
        details: {
          Investment: investment.investmentName,
          Tier: investment.investmentTier,
          'Today\'s Return': `$${profit.amount.toLocaleString()}`,
          'Days Completed': `${investment.daysCompleted} / ${investment.duration}`,
          'Total Returns': `$${investment.currentTotalReturns.toLocaleString()}`
        },
        footer:
          'This message was sent from Invest Tracker because a daily return was distributed.'
      })
    }

    await Promise.all([
      createNotification({
        userId: user.id,
        title: subject,
        description: message(user.name),
        user: user as User
      }),

      sendEmail({ toEmail: user.email, subject, html: html(user.name) }),
      sendEmail({ toEmail: env.get('EMAIL_USER'), subject, html: html() })
    ])
  } catch (error) {
    logger.error(
      `Error sending profit distribution alerts: ${(error as Error).message || error}`,
      error
    )
  }
}