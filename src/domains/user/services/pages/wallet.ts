import { Request, Response } from 'express'
import { ExpressUser } from '../../../../definitions'
import getRepository from '../../../../utils/repository'
import { sendResponse } from '../../../../utils/helpers'

export const walletPage = async (req: Request, res: Response) => {
  const userId = (req.user as ExpressUser).id

  const [users, profits, transactions] = await Promise.all([
    getRepository('User'),
    getRepository('Profit'),
    getRepository('Transaction')
  ])

  const [user, latestProfit, userTransactions] = await Promise.all([
    users.model.findOne({
      where: { id: userId },
      relations: { account: true }
    }),
    profits.model.findOne({ where: { userId }, order: { createdAt: 'DESC' } }),
    transactions.model.find({
      where: { userId },
      take: 20,
      order: { createdAt: 'DESC' }
    })
  ])

  sendResponse(res, 200, {
    walletBalance: user?.account?.walletBalance ?? 0,
    profit: latestProfit,
    transactions: userTransactions
  })
}
