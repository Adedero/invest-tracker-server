import { Request, Response } from 'express'
import { TransactionStatus } from '../../../models/transaction.model'
import { sendResponse } from '../../../utils/helpers'
import { initDataSource } from '../../../config/database.config'
import logger from '../../../utils/logger'
import { alertEmitter } from '../../../events/alert.event'

export const updateTransaction = async (req: Request, res: Response) => {
  const { id } = req.params
  const { status, reason }: { status: TransactionStatus; reason: string } =
    req.body

  if (!id) {
    sendResponse(res, 400, 'No transaction ID provided')
    return
  }
  if (!status) {
    sendResponse(res, 400, 'No transaction status provided')
    return
  }

  if (status === 'failed' && !reason) {
    sendResponse(res, 400, 'No reason for failure provided')
    return
  }

  try {
    const { dataSource } = await initDataSource()

    await dataSource.transaction(async (manager) => {
      const txnRepo = manager.getRepository('Transaction')
      const userRepo = manager.getRepository('User')

      const txn = await txnRepo.findOne({ where: { id } })

      if (!txn) {
        throw new Error('Transaction not found')
      }

      if (txn.status === status) {
        throw new Error(
          'Transaction has already been resolved with the status: ' + status
        )
      }

      const user = await userRepo.findOne({
        where: { id: txn.userId },
        relations: { account: true }
      })

      if (!user) {
        throw new Error('User not found')
      }

      if (!user.account) {
        throw new Error('User account not found')
      }

      if (status === 'failed') {
        //If transaction is a failed withdrawal, credit the user their money back
        if (txn.transactionType === 'withdrawal') {
          user.account.walletBalance = (
            parseFloat(user.account.walletBalance) + txn.amountInUSD
          ).toFixed(2)
        }
        //Send notification
        //Send email
      }

      if (status === 'successful') {
        //If transaction is a successful deposit, credit the user's wallet balance
        if (txn.transactionType === 'deposit') {
          user.account.walletBalance = (
            parseFloat(user.account.walletBalance) + txn.amountInUSD
          ).toFixed(2)
        }
      }

      txn.status = status
      txn.approvalDate = status === 'failed' ? null : new Date()
      txn.failureReason = status === 'failed' && reason ? reason : null

      await txnRepo.save(txn)
      await userRepo.save(user)

      alertEmitter.emit('update-transaction-status', {
        ...txn,
        user: { ...user }
      })

      sendResponse(res, 200, { data: txn })
    })
  } catch (e) {
    const err = e as Error
    logger.error(`Error updating transaction status: ${err.message}`, err)
    sendResponse(res, 500, err.message)
  }
}
