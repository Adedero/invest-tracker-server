// admin.routes.ts
import { Router } from 'express'
//import AdminController from './admin.controller'
import {
  countHandler,
  emailHandler,
  deleteHandler,
  getHandler,
  postHandler,
  putHandler
} from '../../utils/handlers'

import { hash } from 'argon2'
import { updateTransaction } from './services/transaction.service'
import { terminateInvestment } from './services/investment.service'
import { getDashboardData } from './services/dashboard.service'

const router = Router()

router.get('/dashboard', getDashboardData)

//Utitlites
router.post('/email', emailHandler)

//Users
router.get('/users/:id?', getHandler('User'))
router.post('/users', postHandler('User'))
router.put(
  '/users/:id',
  putHandler('User', {
    onBeforeUpdate: async (ctx, data) => {
      const password = (data as Record<string, unknown>).password as string
      if (password) {
        const h = await hash(password)
        ;(data as Record<string, unknown>).password = h
        return data
      }
      return data
    }
  })
)
router.delete('/users/:id', deleteHandler('User'))

router.get('/count/users', countHandler('User'))

//Accounts
router.get('/accounts/:id?', getHandler('Account'))
router.post('/accounts', postHandler('Account'))
router.put('/accounts/:id', putHandler('Account'))
//router.delete('/accounts/:id', deleteHandler('Account'))

//Investments
router.get('/investments/:id?', getHandler('Investment'))
router.patch('/investments/:id', terminateInvestment)
router.put('/investments/:id', putHandler('Investment'))

//Transactions
router.get('/transactions/:id?', getHandler('Transaction'))
router.put('/transactions/:id', putHandler('Transaction'))
router.put('/transaction-status/:id', updateTransaction)

//Investment Plans
router.get('/investment-plans/:id?', getHandler('InvestmentPlan'))
router.post('/investment-plans', postHandler('InvestmentPlan'))
router.put('/investment-plans/:id', putHandler('InvestmentPlan'))
router.delete('/investment-plans/:id', deleteHandler('InvestmentPlan'))

//Currencies
router.get('/currencies/:id?', getHandler('Currency'))
router.post('/currencies', postHandler('Currency'))
router.put('/currencies/:id', putHandler('Currency'))
router.delete('/currencies/:id', deleteHandler('Currency'))

//FAQs
router.get('/faqs/:id?', getHandler('Faq'))
router.post('/faqs', postHandler('Faq'))
router.put('/faqs/:id', putHandler('Faq'))
router.delete('/faqs/:id', deleteHandler('Faq'))

//Notifications
router.get('/notifications/:id?', getHandler('Notification'))
router.post('/notifications', postHandler('Notification'))
router.put('/notifications', putHandler('Notification'))
router.delete('/notifications/:id?', deleteHandler('Notification'))

export default router
