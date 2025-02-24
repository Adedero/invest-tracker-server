import { Request, Response } from 'express'
import { initDataSource } from '../../../config/database.config'
import { sendResponse } from '../../../utils/helpers'

export async function getDashboardData(req: Request, res: Response) {
  const { dataSource } = await initDataSource()

  const userRepo = dataSource.getRepository('User')
  const ivnRepo = dataSource.getRepository('Investment')
  const txnRepo = dataSource.getRepository('Transaction')
  const curRepo = dataSource.getRepository('Currency')
  const ivnPlanRepo = dataSource.getRepository('InvestmentPlan')

  const [
    usersCount,
    adminsCount,
    openInvestmentsCount,
    currenciesCount,
    investmentPlansCount,
    recentTransactions,
    recentInvestments
  ] = await Promise.all([
    userRepo.count({ where: { role: 'user' } }),
    userRepo.count({ where: { role: 'admin' } }),
    ivnRepo.count({ where: { status: 'open' } }),
    curRepo.count(),
    ivnPlanRepo.count(),
    txnRepo.find({
      relations: { user: true },
      take: 3,
      order: { createdAt: 'DESC' }
    }),
    ivnRepo.find({
      relations: { user: true },
      where: { status: 'open' },
      take: 3,
      order: { createdAt: 'DESC' }
    })
  ])

  const data = {
    usersCount,
    adminsCount,
    openInvestmentsCount,
    currenciesCount,
    investmentPlansCount,
    recentTransactions,
    recentInvestments
  }
  sendResponse(res, 200, data)
}
