import { Request, Response } from 'express'
import { sendResponse } from '../../../utils/helpers'
import logger from '../../../utils/logger'
import { initDataSource } from '../../../config/database.config'
import { alertEmitter } from '../../../events/alert.event'

export async function terminateInvestment(req: Request, res: Response) {
  const { id } = req.params
  if (!id) {
    sendResponse(res, 400, 'No investment ID provided')
    return
  }

  const { terminationReason, terminationFeeApplied } = req.body as {
    terminationReason: string
    terminationFeeApplied: boolean
  }

  if (!terminationReason) {
    sendResponse(res, 400, 'No termination reason provided')
  }

  try {
    const { dataSource } = await initDataSource()
    await dataSource.transaction(async (manager) => {
      const investmentRepo = manager.getRepository('Investment')
      const accountRepo = manager.getRepository('Account')

      const investment = await investmentRepo.findOne({
        where: { id },
        relations: { user: true }
      })

      if (!investment) {
        throw new Error('Investment not found')
      }

      if (
        investment.status === 'terminated' ||
        investment.status === 'closed'
      ) {
        throw new Error(
          'Investment is already resolved and cannot be terminated'
        )
      }

      const account = await accountRepo.findOne({
        where: { userId: investment.userId }
      })

      if (!account) {
        throw new Error('User account not found')
      }

      const terminationFee: number = terminationFeeApplied
        ? (investment.terminationFee ?? 0)
        : 0

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
      investment.terminator = 'admin'
      investment.terminatedAt = new Date()
      investment.closedAt = new Date()
      investment.terminationFeeApplied = terminationFeeApplied
      investment.terminationReason = terminationReason

      await investmentRepo.save(investment)
      await accountRepo.save(account)

      alertEmitter.emit('terminate-investment', investment)

      sendResponse(res, 200, { data: investment })
    })
  } catch (error) {
    const e = error as Error
    logger.error(`Error terminating investment: ${e.message}`, e)
    sendResponse(res, 500, e.message)
  }
}
