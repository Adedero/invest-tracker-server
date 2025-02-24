import { Router } from 'express'
import UserController from './user.controller'
import {
  changePasswordHandler,
  deleteHandler,
  getHandler,
  postHandler,
  putHandler
} from '../../utils/handlers'
import { createDeposit, createWithdrawal } from './services/transaction.service'
import {
  createInvestment,
  terminateInvestment
} from './services/investment.service'

const router = Router()

router.get('/pages/dashboard', UserController.dashboardPage)
router.get('/pages/wallet', UserController.walletPage)

//User
router.get('/users/:id?', getHandler('User'))
router.put('/users/:id', putHandler('User'))
router.put('/change-password/:id', changePasswordHandler)
router.put('/reset-password')
router.post('/contact', UserController.contact)

//Account
router.get('/accounts/:id', getHandler('Account'))
router.put('/accounts/:id', putHandler('Account'))

//Transactions
router.get('/transactions/:id?', getHandler('Transaction')) //Get all transactions or one
router.post(
  '/transactions',
  createWithdrawal,
  createDeposit,
  postHandler('Transaction')
)

//Currency
router.get('/currencies', getHandler('Currency')) //Get currencies
router.get('/currency-rate/:symbol', UserController.currencyRate)

//Investments
router.get('/investments/:id?', getHandler('Investment'))
router.post('/investments', createInvestment)
router.get('/investment-plans/:id?', getHandler('InvestmentPlan'))

router.put('/terminate-investment/:id', terminateInvestment)

//Notifications
router.get('/notifications', getHandler('Notification'))
router.put('/notifications', putHandler('Notification'))
router.delete('/notifications/:id?', deleteHandler('Notification'))

//FAQs
router.get('/faqs/:id?', getHandler('Faq'))

export default router
