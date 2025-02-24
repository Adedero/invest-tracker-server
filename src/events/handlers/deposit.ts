import { Transaction } from '../../models/transaction.model'
import { User } from '../../models/user.model'
import { emailTemplate } from '../../utils/emails'
import env from '../../utils/env'
import { createNotification } from '../../utils/handlers'
import { sendEmail } from '../../utils/mail'

interface OnDepositData extends Transaction {
  user: User
}

export default async function onDeposit(txn: OnDepositData) {
  const subject = 'New Deposit Request'
  const message = (name?: string) => {
    if (name) {
      return `You initiated a deposit request of $${txn.amountInUSD.toLocaleString()} into your wallet.`
    } else {
      return `A new deposit request of $${txn.amountInUSD.toLocaleString()} was initiated by ${txn.user.name}.`
    }
  }

  const html = (name?: string) => {
    return emailTemplate({
      subject,
      name: name || 'Invest Tracker Admin',
      intro: message(name),
      details: {
        Amount: `$${txn.amountInUSD.toLocaleString()}`,
        Medium: txn.isWireTransfer ? 'Wire Transfer' : txn.currency,
        ...(!txn.isWireTransfer && {
          Rate: `$${txn.rate}`,
          'Amount In Selected Currency': `${txn.amountInCurrency} ${txn.currency}`,
          'Deposited To Wallet Address': txn.depositWalletAddress
        }),
        Status: txn.status
      },
      info: txn.isWireTransfer
        ? 'The deposit request has been submitted and the details of the wire transfer will emailed shortly.'
        : 'The deposit request will be processed within 24 hours.',
      footer: 'This email was sent because a deposit request was initiated.'
    })
  }

  await Promise.all([
    createNotification({
      userId: txn.userId,
      title: subject,
      description: message(txn.user.name),
      user: txn.user as User
    }),
    sendEmail({ toEmail: txn.user.email, subject, html: html(txn.user.name) }),
    sendEmail({ toEmail: env.get('EMAIL_USER'), subject, html: html() })
  ])
}
