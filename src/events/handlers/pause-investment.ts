import { Investment } from '../../models/investment.model'
import { User } from '../../models/user.model'
import { emailTemplate } from '../../utils/emails'
import env from '../../utils/env'
import { createNotification } from '../../utils/handlers'
import logger from '../../utils/logger'
import { sendEmail } from '../../utils/mail'

interface OnToggleInvestmentPause extends Investment {
  user: User
}
export default async function onToggleInvestmentPause(
  investment: OnToggleInvestmentPause
) {
  const message = `The investment ${investment.investmentName} (${investment.investmentTier} Tier) ${investment.status === 'paused' ? 'has been resumed.' : 'was paused by the Invest Tracker admin ' + (investment.pausedReason ? ` with reason: ${investment.pausedReason}` : '')}`

  const subject = investment.status === 'paused' ? 'Resumption of Investment' : 'Pause of Investment'

  const html = (name: string) => {
    return emailTemplate({
      subject,
      name,
      intro: message,
      details: {
        'Investment Name': investment.investmentName,
        Tier: investment.investmentTier,
        'Status': investment.status === 'paused' ? 'Open' : 'Paused',
        ...(investment.status === 'open' && !!investment.pausedReason && {
          'Reason for Pause': investment.pausedReason
        }),
        'Total Returns': `$${investment.currentTotalReturns.toLocaleString()}`
      },
      footer:
        `This message was sent from Invest Tracker because an investment was ${investment.status === 'paused' ? 'resumed' : 'paused'}.`
    })
  }

  try {
    await createNotification({
      userId: investment.user.id,
      title: subject,
      description: message,
      user: investment.user as User
    })

    //Email to be sent to admin and user
    await Promise.all([
      sendEmail({
        subject,
        toEmail: env.get('EMAIL_USER'),
        html: html('Invest Tracker Admin')
      }),
      sendEmail({
        subject,
        toEmail: investment.user.email,
        html: html(investment.user.name)
      })
    ])
  } catch (error) {
    logger.error(
      `Error sending investment pause toggle alerts: ${(error as Error).message}`,
      error
    )
  }
}
