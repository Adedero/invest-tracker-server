import { EventEmitter } from 'node:events'
import logger from '../utils/logger'
import onTerminateInvestment from './handlers/terminate-investment'
import onCreateInvestment from './handlers/create-investment'
import onUpdateTransactionStatus from './handlers/update-transaction-status'
import onDeposit from './handlers/deposit'
import onWithdrawal from './handlers/withdrawal'

export default class AlertEmitter extends EventEmitter {}

export const alertEmitter = new AlertEmitter()

alertEmitter.on('error', (err) => {
  logger.error(`Mail Emitter Error: ${err.message ?? err}`, err)
})

alertEmitter.on('update-transaction-status', onUpdateTransactionStatus)

alertEmitter.on('terminate-investment', onTerminateInvestment)

alertEmitter.on('create-investment', onCreateInvestment)

alertEmitter.on('deposit', onDeposit)

alertEmitter.on('withdrawal', onWithdrawal)