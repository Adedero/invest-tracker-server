import { NextFunction, Request, Response } from 'express'
import getRepository from '../../../utils/repository'
import { sendResponse } from '../../../utils/helpers'
import { initDataSource } from '../../../config/database.config'
import { ExpressUser } from '../../../definitions'
import { Transaction } from '../../../models/transaction.model'
import { alertEmitter } from '../../../events/alert.event'
import { MoreThan } from 'typeorm'

export const createWithdrawal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { data } = req.body

  if (!data || Object.keys(data).length === 0) {
    sendResponse(res, 400, 'No data provided')
    return
  }

  if (data.transactionType !== 'withdrawal') {
    next()
    return
  }

  try {
    const users = await getRepository('User')
    const transactions = await getRepository('Transaction')

    const user = await users.model.findOne({
      where: { id: (req.user as ExpressUser).id },
      relations: { account: true }
    })

    if (!user) {
      sendResponse(res, 404, 'User not found')
      return
    }

    //Check the last withdrawal request
    //If pending and made less that 2 minutes ago, send message for duplicate request
    const lastWithdrawalRequest = await transactions.model.findOne({
      where: {
        transactionType: 'withdrawal',
        status: 'pending',
        userId: user.id,
        amountInUSD: data.amountInUSD,
        createdAt: MoreThan(new Date(Date.now() - 3 * 60 * 1000))
      }
    })

    if (lastWithdrawalRequest) {
      sendResponse(res, 400, 'Possible duplicate withdrawal request detected. Please, wait a little before proceeding.')
      return
    }

    // Check if the user has enough balance
    if (user.account.walletBalance < data.amountInUSD) {
      sendResponse(res, 400, 'Insufficient balance')
      return
    }

    // Deduct the amount from the wallet balance
    user.account.walletBalance -= data.amountInUSD

    const { dataSource } = await initDataSource()

    await dataSource.manager.transaction(async (manager) => {
      // Create and save the transaction
      const transaction = manager.create(Transaction, {
        ...data,
        userId: user.id,
        transactionType: 'withdrawal',
        status: 'pending'
      })
      await manager.save(transaction)

      await manager.save(user.account)

      alertEmitter.emit('withdrawal', { ...transaction, user })

      sendResponse(res, 200, 'Withdrawal successful')
    })
  } catch (error) {
    console.error(error)
    sendResponse(res, 500, (error as Error).message)
  }
}

export const createDeposit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { data } = req.body

  if (!data || Object.keys(data).length === 0) {
    sendResponse(res, 400, 'No data provided')
    return
  }

  if (data.transactionType !== 'deposit') {
    next()
    return
  }

  try {
    const [users, transactions] = await Promise.all([
      getRepository('User'),
      getRepository('Transaction')
    ])

    const user = await users.model.findOne({
      where: { id: (req.user as ExpressUser).id },
      relations: { account: true }
    })

    if (!user) {
      sendResponse(res, 404, 'User not found')
      return
    }

    const lastDepositRequest = await transactions.model.findOne({
      where: {
        transactionType: 'deposit',
        status: 'pending',
        userId: user.id,
        amountInUSD: data.amountInUSD,
        createdAt: MoreThan(new Date(Date.now() - 3 * 60 * 1000))
      }
    })

    if (lastDepositRequest) {
      sendResponse(res, 400, 'Possible duplicate deposit request detected. Please, wait a little before proceeding.')
      return
    }

    const transaction = transactions.model.create(data)
    await transactions.model.save(transaction)

    alertEmitter.emit('deposit', { ...transaction, user })

    sendResponse(res, 200, 'Deposit request successful')
  } catch (error) {
    sendResponse(res, 500, (error as Error).message)
  }
}
