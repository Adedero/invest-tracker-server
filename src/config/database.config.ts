import { DataSource, Repository } from 'typeorm'
import { User } from '../models/user.model'
import { Token } from '../models/token.model'
import env from '../utils/env'
import logger from '../utils/logger'
import { IS_PRODUCTION_ENV } from '../utils/constants'
import { InvestmentPlan } from '../models/investment-plan.model'
import { Investment } from '../models/investment.model'
import { Account } from '../models/account.model'
import { Profit } from '../models/profit.model'
import { Notification } from '../models/notification.model'
import { Transaction } from './../models/transaction.model'
import { Currency } from '../models/currency.model'
import { Faq } from '../models/faq.model'

declare global {
  // eslint-disable-next-line no-var
  var _dataSource: DataSource | undefined
}

export const AppDataSource = new DataSource({
  type: env.get('DB_TYPE', 'postgres') as 'postgres',
  host: env.get('DB_HOST', 'localhost'),
  port: parseInt(env.get('DB_PORT', '5432')),
  username: env.get('DB_USER', 'test'),
  password: env.get('DB_PASSWORD', 'test'),
  database: env.get('DB_NAME', 'invest_tracker'),
  synchronize: true,
  logging: false,
  entities: [
    User,
    Account,
    Token,
    Investment,
    InvestmentPlan,
    Profit,
    Transaction,
    Notification,
    Currency,
    Faq
  ],
  subscribers: [],
  migrations: []
})

if (!IS_PRODUCTION_ENV) {
  global._dataSource = AppDataSource
}

export interface Model {
  User: Repository<User>
  Account: Repository<Account>
  Token: Repository<Token>
  Investment: Repository<Investment>
  InvestmentPlan: Repository<InvestmentPlan>
  Profit: Repository<Profit>
  Transaction: Repository<Transaction>
  Notification: Repository<Notification>
  Currency: Repository<Currency>
  Faq: Repository<Faq>
}

export const initDataSource = async () => {
  if (!AppDataSource.isInitialized) {
    try {
      await AppDataSource.initialize()
    } catch (error) {
      logger.error(`Database connection error: ${error}`)
    }
  }
  const model: Model = {
    User: AppDataSource.getRepository(User),
    Account: AppDataSource.getRepository(Account),
    Token: AppDataSource.getRepository(Token),
    Investment: AppDataSource.getRepository(Investment),
    InvestmentPlan: AppDataSource.getRepository(InvestmentPlan),
    Profit: AppDataSource.getRepository(Profit),
    Transaction: AppDataSource.getRepository(Transaction),
    Notification: AppDataSource.getRepository(Notification),
    Currency: AppDataSource.getRepository(Currency),
    Faq: AppDataSource.getRepository(Faq)
  }
  return { dataSource: AppDataSource, model }
}
