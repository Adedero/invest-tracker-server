import { User } from "../../models/user.model";
import { emailTemplate } from "../../utils/emails";
import env from "../../utils/env";
import { createNotification } from "../../utils/handlers";
import { toTitleCase } from "../../utils/helpers";
import logger from "../../utils/logger";
import { sendEmail } from "../../utils/mail";
import { Transaction } from './../../models/transaction.model';

interface OnUpdateTransactionStatusData extends Transaction {
  user: User
}

export default async function onUpdateTransactionStatus(txn: OnUpdateTransactionStatusData) {
  const subject = 'Transaction Status Updated'

  const message = (name?: string) => txn.status === 'failed' ?
  `The ${txn.transactionType} request with transaction ID ${txn.id} failed ${txn.failureReason ? `with reason: ${txn.failureReason}` : 'without reason'}.\n${(txn.transactionType === 'withdrawal' && name) ? `$${txn.actualAmountInUSD.toLocaleString()} has been refunded to your wallet.`: ''}` :
  `The ${txn.transactionType} request with transaction ID ${txn.id} has been approved.\n${(txn.transactionType === 'withdrawal' && name)  ? `Your wallet has been credited with $${txn.amountInUSD.toLocaleString()}.`: ''}`

  const html = (name?: string) => {
    const CLIENT_URL = env.get('CLIENT_URL')

    return emailTemplate({
      subject,
      name: name ?? 'Invest Tracker Admin',
      intro: message(name),
      details: {
        'Amount': `$${txn.amountInUSD.toLocaleString()}`,
        'Type': toTitleCase(txn.transactionType),
        'Status': toTitleCase(txn.status),
        ...((txn.status === 'failed') && { 'Reason For Failure': txn.failureReason })
      },
      cta: {
        intro: 'Click the button to view the details of the transaction.',
        buttonLabel: 'View Transaction',
        href: name ? `${CLIENT_URL}/user/wallet/transaction/${txn.id}` : `${CLIENT_URL}/admin/transactions/${txn.id}` 
      },
      outro: `This message was sent from Invest Tracker because of an update was made to a transaction with ID ${txn.id}`
    })
  }

  try {
    await Promise.all([
      createNotification({ userId: txn.user.id, title: subject, description: message(txn.user.name), user: txn.user as User }),
      sendEmail({ toEmail: env.get('EMAIL_USER'), subject, html: html() }),
      sendEmail({ toEmail: txn.user.email, subject, html: html(txn.user.name) })
    ])
  } catch (error) {
    logger.error(`Error sending investment termination alerts: ${(error as Error).message}`, error)
  }
}