import { Transaction } from "../../models/transaction.model"
import { User } from "../../models/user.model"
import { emailTemplate } from "../../utils/emails"
import env from "../../utils/env"
import { createNotification } from "../../utils/handlers"
import { sendEmail } from "../../utils/mail"

interface onWithdrawalData extends Transaction {
  user: User
}

export default async function onWithdrawal(txn: onWithdrawalData) {
  const subject = 'New Withdrawal Request'
  const message = (name?: string) => {
    if (name) {
      return `You initiated a withdrawal request of $${txn.amountInUSD.toLocaleString()} into your wallet.`
    } else {
      return `A new withdrawal request of $${txn.amountInUSD.toLocaleString()} was initiated by ${txn.user.name}.`
    }
  }

  const html = (name?: string) => {
    return emailTemplate({
      subject,
      name: name || 'Invest Tracker Admin',
      intro: message(name),
      details: {
        'Amount': `$${txn.amountInUSD.toLocaleString()}`,
        'Charge': `$${txn.charge.toLocaleString()}`,
        'Actual amount to be withdrawn': `$${txn.actualAmountInUSD.toLocaleString()}`,
        'Selected currency': txn.currency,
        'Rate': `$${txn.rate}`,
        'Amount in the selected currency': `${txn.amountInCurrency} ${txn.currency}`,
        'Deposited To Wallet Address': txn.depositWalletAddress,
        'Provided Wallet Address': txn.withdrawalWalletAddress,
        'Network': txn.withdrawalWalletNetwork,
        'Status': txn.status
      },
      info: `The withdrawal request will be processed within 24 hours. ${name? `Please contact us if the amount is not credited to your wallet after then.`: ''}`,
      footer: 'This email was sent because a withdrawal request was initiated.'
    })
  }

  await Promise.all([
    createNotification({ userId: txn.userId, title: subject, description: message(txn.user.name), user: txn.user as User }),
    sendEmail({ toEmail: txn.user.email, subject, html: html(txn.user.name) }),
    sendEmail({ toEmail: env.get('EMAIL_USER'), subject, html: html() })
  ])
}