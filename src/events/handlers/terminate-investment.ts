import { Investment } from "../../models/investment.model";
import { User } from "../../models/user.model";
import { emailTemplate } from "../../utils/emails";
import env from "../../utils/env";
import { createNotification } from "../../utils/handlers";
import logger from "../../utils/logger";
import { sendEmail } from "../../utils/mail";

interface OnTerminateInvestmentData extends Investment {
  user: User
}
export default async function onTerminateInvestment(investment: OnTerminateInvestmentData) {
  const message = (name?: string) => `The investment ${investment.investmentName} (${investment.investmentTier} Tier) was terminated by ${(investment.terminator === 'user' && name) ? 'you' : (investment.terminator === 'user' && !name) ? investment.user.name : 'the Invest Tracker admin'} ${!investment.terminationReason ? 'without reason.' : 'with reason: ' + investment.terminationReason}.`

  const subject = 'Termination of Investment'

  const html = (name: string) => {
    return emailTemplate({
      subject,
      name,
      intro: message(name),
      details: {
        'Investment Name': investment.investmentName,
        'Tier': investment.investmentTier,
        'Termination Fee': `$${investment.terminationFee.toLocaleString()}`,
        'Reason for Termination': investment.terminationReason,
        'Total Returns': `$${investment.currentTotalReturns.toLocaleString()}`
      },
      footer:'This message was sent from Invest Tracker because an investment was terminated.'
    })
  }

  try {
    await createNotification({ userId: investment.user.id, title: subject, description: message(investment.user.name), user: (investment.user as User) })

    //Email to be sent to admin and user
    await Promise.all([
      sendEmail({ subject, toEmail: env.get('EMAIL_USER'), html: html('Invest Tracker Admin') }),
      sendEmail({ subject, toEmail: investment.user.email, html: html(investment.user.name) })
    ])
  } catch (error) {
    logger.error(`Error sending investment termination alerts: ${(error as Error).message}`, error)
  }
}