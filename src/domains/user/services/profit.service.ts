import { initDataSource } from '../../../config/database.config'
import { Investment, InvestmentStatus } from '../../../models/investment.model'
import { Profit, ProfitStatus } from '../../../models/profit.model'
import { User } from '../../../models/user.model'
import { createNotification } from '../../../utils/handlers'
import logger from '../../../utils/logger'
import getRepository from '../../../utils/repository'
import {
  Transaction,
  TransactionStatus,
  TransactionType
} from './../../../models/transaction.model'

export const distributeProfit = async () => {
  logger.info('Distributing profit')

  const [investmentRepo, userRepo] = await Promise.all([
    getRepository('Investment'),
    getRepository('User')
  ])

  try {
    const { dataSource } = await initDataSource()

    const openInvestments = await investmentRepo.model.find({
      where: { status: InvestmentStatus.OPEN },
      relations: { user: true }
    })

    if (!openInvestments.length) {
      logger.info('No open investments found')
      return
    }

    for (const investment of openInvestments) {
      const user = await userRepo.model.findOne({
        where: { id: investment.userId },
        relations: { account: true }
      })

      if (!user || !user.account) {
        logger.warn(`User or account not found for investment ${investment.id}`)
        continue
      }

      if (investment.daysCompleted >= investment.duration) {
        const shortfall =
          investment.expectedTotalReturns - investment.currentTotalReturns
        if (shortfall > 0) {
          await dataSource.transaction(async (manager) => {
            const profit = new Profit()
            profit.userId = investment.userId
            profit.accountId = user.account.id
            profit.investmentId = investment.id
            profit.amount = shortfall
            profit.status = investment.autocompounded
              ? ProfitStatus.FROZEN
              : ProfitStatus.DISTRIBUTED
            if (!investment.autocompounded) profit.distributedAt = new Date()
            profit.investment = investment as Investment

            const txn = new Transaction()
            txn.actualAmountInUSD = profit.amount
            txn.amountInCurrency = profit.amount
            txn.amountInUSD = profit.amount
            txn.charge = 0
            txn.createdAt = new Date()
            txn.currency = 'USD'
            txn.description = `Daily return on ${investment.investmentName} (${investment.investmentTier} Tier)`
            txn.investmentId = investment.id
            txn.isWireTransfer = false
            txn.rate = 1
            txn.status = TransactionStatus.SUCCESSFUL
            txn.transactionType = TransactionType.PROFIT
            txn.userId = investment.userId
            txn.user = user as User

            await manager.save(profit)
            await manager.save(txn)

            if (investment.autocompounded) {
              investment.currentCompoundedAmount =
                (investment.currentCompoundedAmount ||
                  investment.initialDeposit) + shortfall
            }
            investment.currentTotalReturns += shortfall

            user.account.walletBalance += investment.currentTotalReturns
            await manager.save(user)

            investment.status = InvestmentStatus.CLOSED
            investment.closedAt = new Date()

            await manager.save(investment)
            await createNotification(
              {
                userId: user.id,
                title: 'Close of Investment',
                description: `Your investment on ${investment.investmentName} plan, ${investment.investmentTier} tier has completed its duration and is now closed.`,
                user: user as User
              },
              manager
            )
          })
        } else {
          investment.status = InvestmentStatus.CLOSED
          investment.closedAt = new Date()
          await investmentRepo.model.save(investment)
        }
        continue
      }

      const remainingDays = investment.duration - investment.daysCompleted
      const totalReturnsLeft =
        investment.expectedTotalReturns - investment.currentTotalReturns
      const avgDailyReturn = totalReturnsLeft / remainingDays

      const FLUCTUATION_MIN = 0.8
      const FLUCTUATION_MAX = 1.2
      const fluctuationFactor =
        FLUCTUATION_MIN + Math.random() * (FLUCTUATION_MAX - FLUCTUATION_MIN)
      const dailyReturn = Math.max(
        0,
        parseFloat((avgDailyReturn * fluctuationFactor).toFixed(2))
      )

      await dataSource.transaction(async (manager) => {
        const profit = new Profit()
        profit.userId = investment.userId
        profit.accountId = user.account.id
        profit.investmentId = investment.id
        profit.amount = dailyReturn
        profit.status = investment.autocompounded
          ? ProfitStatus.FROZEN
          : ProfitStatus.DISTRIBUTED
        if (!investment.autocompounded) profit.distributedAt = new Date()
        profit.investment = investment as Investment

        const txn = new Transaction()
        txn.actualAmountInUSD = profit.amount
        txn.amountInCurrency = profit.amount
        txn.amountInUSD = profit.amount
        txn.charge = 0
        txn.createdAt = new Date()
        txn.currency = 'USD'
        txn.description = `Daily return on ${investment.investmentName} (${investment.investmentTier} Tier)`
        txn.investmentId = investment.id
        txn.isWireTransfer = false
        txn.rate = 1
        txn.status = TransactionStatus.SUCCESSFUL
        txn.transactionType = TransactionType.PROFIT
        txn.userId = investment.userId
        txn.user = user as User

        await manager.save(profit)

        if (investment.autocompounded) {
          investment.currentCompoundedAmount = parseFloat(
            (
              (investment.currentCompoundedAmount ||
                investment.initialDeposit) + dailyReturn
            ).toFixed(2)
          )
        } else {
          user.account.walletBalance = parseFloat(
            (user.account.walletBalance + dailyReturn).toFixed(2)
          )
          await manager.save(user)
        }

        investment.currentTotalReturns = parseFloat(
          (investment.currentTotalReturns + dailyReturn).toFixed(2)
        )
        investment.daysCompleted += 1
        investment.lastProfitDistributedAt = new Date()
        investment.lastProfitAmount = dailyReturn
        await manager.save(investment)

        await createNotification(
          {
            userId: user.id,
            title: 'Daily Return',
            description: `Investment: ${investment.investmentName}\nTier: ${investment.investmentTier}\nAmount: $${profit.amount.toLocaleString()}`,
            user: user as User
          },
          manager
        )
      })
    }
  } catch (error) {
    logger.error('Error during profit distribution:', error)
  }
}
