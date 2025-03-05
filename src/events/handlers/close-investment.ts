import { Investment } from '../../models/investment.model'
import { User } from '../../models/user.model'
import { emailTemplate } from '../../utils/emails'
import env from '../../utils/env'
import { createNotification } from '../../utils/handlers'
import logger from '../../utils/logger'
import { sendEmail } from '../../utils/mail'

interface OnCloseInvestmentData extends Investment {
  user: User
}
export default async function onCloseInvestment(
  investment: OnCloseInvestmentData
) {
  const subject = 'Investment Closure'
  const message = (name?: string) =>
    `${name ? 'Your' : `${investment.user.name}'s`} investment on ${investment.investmentName} plan, ${investment.investmentTier} tier has completed its duration and is now closed.`

  const html = (name?: string) => {
    return emailTemplate({
      subject,
      name: name || 'Invest Tracker Admin',
      intro: message(name),
      details: {
        'Investment Name': investment.investmentName,
        Tier: investment.investmentTier,
        Deposit: `$${investment.initialDeposit.toLocaleString()}`,
        Duration: `${investment.duration} days`,
        'Total Returns': `$${investment.currentTotalReturns.toLocaleString()}`
      },
      info: investment.autocompounded
        ? `This investment was autocompounded. The returns from this investment have been added to ${name ? 'your' : "the client's"} account balance.`
        : `This investment was not autocompounded. The returns from this investment were added daily to ${name ? 'your' : "the client's"} account balance.`,
      footer:
        'This message was sent from Invest Tracker because an investment was closed.'
    })
  }

  try {
    await Promise.all([
      createNotification({
        userId: investment.user.id,
        title: subject,
        description: message(investment.user.name),
        user: investment.user as User
      }),
      sendEmail({
        toEmail: investment.user.email,
        subject,
        html: html(investment.user.name)
      }),
      sendEmail({ toEmail: env.get('EMAIL_USER'), subject, html: html() })
    ])
  } catch (error) {
    logger.error(
      `Error sending investment closure alerts: ${(error as Error).message}`,
      error
    )
  }
}
