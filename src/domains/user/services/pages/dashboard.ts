import type { Request, Response } from 'express'
import { ExpressUser } from '../../../../definitions'
import getRepository from '../../../../utils/repository'
import { sendResponse } from '../../../../utils/helpers'
import { Account } from '../../../../models/account.model'

export default async function dashboardPage(req: Request, res: Response) {
  const userId = (req.user as ExpressUser).id

  const [users, investments] = await Promise.all([
    getRepository('User'),
    getRepository('Investment')
  ])

  const [error, user] = await users.findOne({
    where: { id: userId },
    relations: {
      account: true,
      investments: true
    }
  })

  if (error || !user) {
    sendResponse(res, error ? 500 : 403, error?.message ?? 'Not authorized')
    return
  }

  if (!user.account) {
    user.account = new Account()
    user.account.userId = user.id
    await users.save(user)
  }

  const activeInvestments = await investments.model.find({
    where: {
      userId: user.id,
      status: 'open'
    }
  })

  let totalInvestmentDeposit: number = 0
  let totalReturns: number = 0
  let nonWithdrawableReturns: number = 0

  activeInvestments.forEach((investment) => {
    totalInvestmentDeposit += investment.initialDeposit
    //totalReturns += investment.expectedTotalReturns
    totalReturns += investment.currentTotalReturns
    if (investment.autocompounded) {
      //nonWithdrawableReturns += investment.expectedTotalReturns
      nonWithdrawableReturns += investment.currentTotalReturns
    }
  })

  const data = {
    walletBalance: user.account.walletBalance,
    activeInvestments: activeInvestments.length,
    totalInvestmentDeposit,
    totalReturns,
    nonWithdrawableReturns
  }

  sendResponse(res, 200, data)
  return
}
