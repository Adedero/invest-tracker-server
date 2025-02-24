import type { Request, Response } from 'express'
import { sendResponse } from '../../../utils/helpers'
import { initDataSource } from '../../../config/database.config'
import { User } from '../../../models/user.model'
import { Investment } from '../../../models/investment.model'
import { ObjectLiteral } from 'typeorm'
import { ExpressUser } from '../../../definitions'
import {
  Transaction,
  TransactionStatus,
  TransactionType
} from '../../../models/transaction.model'
import getRepository from '../../../utils/repository'
import logger from '../../../utils/logger'
import { alertEmitter } from '../../../events/alert.event'

export const createInvestment = async (req: Request, res: Response) => {
  const { data } = req.body

  if (!data || Object.keys(data).length === 0) {
    sendResponse(res, 400, 'No data provided')
    return
  }

  const t = new Transaction()
  t.amountInUSD = data.initialDeposit
  t.charge = 0.0
  t.actualAmountInUSD = data.initialDeposit
  t.rate = 1.0
  t.transactionType = TransactionType.INVESTMENT
  t.status = TransactionStatus.SUCCESSFUL
  t.currency = 'Dollar'
  t.amountInCurrency = data.initialDeposit
  t.isWireTransfer = false
  t.description = `Investment on ${data.investmentName} plan, ${data.investmentTier} tier`

  const { dataSource } = await initDataSource()

  try {
    await dataSource.manager.transaction(async (manager) => {
      const users = manager.getRepository(User)
      const investments = manager.getRepository(Investment)

      const newInvestment = investments.create(data) as ObjectLiteral

      const user = await users.findOne({
        where: { id: (req.user as ExpressUser).id },
        relations: { account: true }
      })

      if (!user) {
        sendResponse(res, 404, 'User not found')
        return
      }

      newInvestment.user = user

      if (user.account.walletBalance < newInvestment.initialDeposit) {
        sendResponse(res, 400, 'Insufficient balance')
        return
      }

      user.account.walletBalance = parseFloat(
        (user.account.walletBalance - newInvestment.initialDeposit).toFixed(2)
      )

      const savedInvestment = await manager.save(newInvestment)

      t.userId = user.id
      t.user = user
      t.investmentId = savedInvestment.id

      await manager.save(user)

      await manager.save(t)

      alertEmitter.emit('create-investment', newInvestment)

      // Send a successful response with the created data
      sendResponse(res, 201, { data: newInvestment })
    })
  } catch (error) {
    sendResponse(
      res,
      500,
      `Failed to create investment: ${(error as Error).message}`
    )
  }
}

export const terminateInvestment = async (req: Request, res: Response) => {
  const userId = (req.user as ExpressUser).id

  const { id } = req.params

  const { terminationReason } = req.body

  if (!id) {
    sendResponse(res, 400, 'No investment selected')
    return
  }

  try {
    const { dataSource } = await initDataSource()

    await dataSource.manager.transaction(async (manager) => {
      const [investments, accounts] = await Promise.all([
        getRepository('Investment'),
        getRepository('Account')
      ])

      const investmentRepo = manager.withRepository(investments.model)
      const accountRepo = manager.withRepository(accounts.model)

      const investment = await investmentRepo.findOne({
        where: { id },
        relations: { user: true }
      })
      const account = await accountRepo.findOne({ where: { userId } })

      if (!investment) {
        throw new Error('Investment not found')
      }

      if (investment.status === 'terminated' || investment.status === 'closed') {
        throw new Error('Investment is already resolved and cannot be terminated')
      }

      if (!account) {
        throw new Error('User account not found')
      }

      const terminationFee: number = investment.terminationFee ?? 0

      if (investment.autocompounded) {
        if (investment.currentTotalReturns >= investment.initialDeposit) {
          account.walletBalance +=
            investment.currentTotalReturns - terminationFee
        } else {
          const balance: number =
            investment.initialDeposit -
            investment.currentTotalReturns -
            terminationFee
          account.walletBalance += investment.currentTotalReturns + balance
        }
        investment.hasTransferedProfitToWallet = true
      }

      if (!investment.autocompounded) {
        if (investment.currentTotalReturns >= investment.initialDeposit) {
          if (account.walletBalance - terminationFee < 0) {
            throw new Error(
              'Insufficient balance to pay for the termination fee'
            )
          }
          account.walletBalance -= terminationFee
        } else {
          const balance: number =
            investment.initialDeposit -
            investment.currentTotalReturns -
            terminationFee
          if (account.walletBalance + balance < 0) {
            throw new Error(
              'Insufficient balance to pay for the termination fee'
            )
          }
          account.walletBalance += balance
        }
      }

      investment.status = 'terminated'
      investment.terminator = 'user'
      investment.terminatedAt = new Date()
      investment.closedAt = new Date()
      investment.terminationFeeApplied = true
      if (terminationReason) {
        investment.terminationReason = terminationReason
      }

      await investmentRepo.save(investment)
      await accountRepo.save(account)

      alertEmitter.emit('terminate-investment', investment)

      sendResponse(res, 200, 'Investment terminated')
    })
  } catch (error) {
    logger.error(`Failed to terminate investment with id: ${id}`, error)
    sendResponse(res, 400, (error as Error).message)
  }
}
