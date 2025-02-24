import { Investment } from "../../models/investment.model";
import { User } from "../../models/user.model";
import { emailTemplate } from "../../utils/emails";
import env from "../../utils/env";
import { createNotification } from "../../utils/handlers";
import logger from "../../utils/logger";
import { sendEmail } from "../../utils/mail";

interface OnCreateInvestmentData extends Investment {
  user: User
}
export default async function onCreateInvestment(investment: OnCreateInvestmentData) {
  const subject = 'New Investment'
  const message = (name?: string) => `A new ${investment.investmentName} (${investment.investmentTier} Tier) was started by ${name ? 'you' : investment.user.name} with an initial deposit of $${investment.initialDeposit.toLocaleString()}`
  
  const html = (name?: string) => {
    return emailTemplate({
      subject,
      name: name || 'Invest Tracker Admin',
      intro: message(name),
      details: {
        'Investment Name': investment.investmentName,
        'Tier': investment.investmentTier,
        'Deposit': `$${investment.initialDeposit.toLocaleString()}`,
        'Duration': `${investment.duration} days`
      },
      info: investment.autocompounded
        ? `This investment is autocompounded. The returns from this investment will only be added to ${name ? 'your' : 'the client\'s'} account balance upon completion or termination of the investment`
        : `This investment is not autocompounded. The daily returns from this investment will be added to ${name ? 'your' : 'the client\'s'} account balance daily.`,
      footer: 'This message was sent from Invest Tracker because a new investment was started.'
    })
  }

  try {
    await Promise.all([
      createNotification({ userId: investment.user.id, title: subject, description: message(investment.user.name), user: investment.user as User }),
      sendEmail({ toEmail: investment.user.email, subject, html: html(investment.user.name) }),
      sendEmail({ toEmail: env.get('EMAIL_USER'), subject, html: html() })
    ])
  } catch (error) {
    logger.error(`Error sending investment creation alerts: ${(error as Error).message}`, error)
  }
}