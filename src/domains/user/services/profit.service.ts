import { LessThan, IsNull } from 'typeorm'; // Assuming TypeORM operators
import Decimal from 'decimal.js'; // Import Decimal library
import { initDataSource } from '../../../config/database.config';
import { Investment, InvestmentStatus } from '../../../models/investment.model';
import { Profit, ProfitStatus } from '../../../models/profit.model';
import { User } from '../../../models/user.model';
import { createNotification } from '../../../utils/handlers';
import logger from '../../../utils/logger';
import getRepository from '../../../utils/repository';
import {
  Transaction,
  TransactionStatus,
  TransactionType
} from './../../../models/transaction.model';

// Configure Decimal precision (adjust as needed for your requirements)
Decimal.set({ precision: 10, rounding: Decimal.ROUND_HALF_UP });

// Helper function to get the start of the current day in UTC
const getStartOfTodayUTC = (): Date => {
  const now = new Date();
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  return startOfDay;
};

export const distributeProfit = async () => {
  logger.info('Starting profit distribution cycle.');
  const investmentRepo = await getRepository('Investment')

  try {
    const { dataSource } = await initDataSource();
    const startOfToday = getStartOfTodayUTC();

    // Fetch only investments that are OPEN and haven't had profit distributed today yet.
    // Also ensures the investment was created *before* today to avoid day 0 distribution.
    const eligibleInvestments = await investmentRepo.model.find({
      where: [
        // Status OPEN, created before today, never distributed
        {
          status: InvestmentStatus.OPEN,
          createdAt: LessThan(startOfToday), // Ensure it wasn't created today
          lastProfitDistributedAt: IsNull()
        },
        // Status OPEN, created before today, last distributed before today
        {
          status: InvestmentStatus.OPEN,
          createdAt: LessThan(startOfToday), // Ensure it wasn't created today
          lastProfitDistributedAt: LessThan(startOfToday)
        }
      ],
      relations: { user: { account: true } } // Load user and account directly
    });

    if (!eligibleInvestments.length) {
      logger.info('No eligible investments found for profit distribution today.');
      return;
    }

    logger.info(`Found ${eligibleInvestments.length} investments eligible for profit distribution.`);

    for (const investment of eligibleInvestments) {
      // Use a try-catch block for each investment to prevent one failure from stopping others.
      try {
        const user = investment.user; // User is already loaded via relation

        // Double check user and account existence (though relation should handle this)
        if (!user || !user.account) {
          logger.warn(`User or account not found for investment ${investment.id}. Skipping.`);
          continue;
        }

        // --- Convert relevant investment numbers to Decimal for calculation ---
        const initialDeposit = new Decimal(investment.initialDeposit);
        const currentTotalReturns = new Decimal(investment.currentTotalReturns);
        const expectedTotalReturns = new Decimal(investment.expectedTotalReturns);
        const currentCompoundedAmount = investment.currentCompoundedAmount !== null && investment.currentCompoundedAmount !== undefined
          ? new Decimal(investment.currentCompoundedAmount)
          : initialDeposit; // Fallback to initialDeposit if null/undefined
        const userWalletBalance = new Decimal(user.account.walletBalance);


        // --- Check if Investment Duration is Complete ---
        if (investment.daysCompleted >= investment.duration) {
          const shortfallDecimal = expectedTotalReturns.sub(currentTotalReturns);

          if (shortfallDecimal.greaterThan(0)) {
            logger.info(`Processing shortfall of ${shortfallDecimal.toFixed(2)} for completed investment ${investment.id}`);
            await dataSource.transaction(async (manager) => {
              const profit = new Profit();
              profit.userId = investment.userId;
              profit.accountId = user.account.id;
              profit.investmentId = investment.id;
              profit.amount = shortfallDecimal.toNumber(); // Convert back for saving
              profit.status = investment.autocompounded
                ? ProfitStatus.FROZEN // Frozen until closure if autocompounded
                : ProfitStatus.DISTRIBUTED; // Distributed directly if not
              if (!investment.autocompounded) profit.distributedAt = new Date(); // Only set if actually distributed now
              profit.investment = investment as Investment; // Type assertion

              const txn = new Transaction();
              txn.actualAmountInUSD = profit.amount;
              txn.amountInCurrency = profit.amount;
              txn.amountInUSD = profit.amount;
              txn.charge = 0;
              txn.createdAt = new Date();
              txn.currency = 'USD';
              txn.description = `Final return (shortfall) on ${investment.investmentName} (${investment.investmentTier} Tier)`;
              txn.investmentId = investment.id;
              txn.isWireTransfer = false;
              txn.rate = 1;
              txn.status = TransactionStatus.SUCCESSFUL;
              txn.transactionType = TransactionType.PROFIT;
              txn.userId = investment.userId;
              txn.user = user as User; // Type assertion

              await manager.save(profit);
              await manager.save(txn);

              // Update investment state
              investment.currentTotalReturns = expectedTotalReturns.toNumber(); // Should now match expected
              if (investment.autocompounded) {
                 // Add shortfall to the final compounded amount
                 investment.currentCompoundedAmount = currentCompoundedAmount.add(shortfallDecimal).toNumber();
              } else {
                // **FIXED**: Only add the shortfall amount to the wallet balance
                user.account.walletBalance = userWalletBalance.add(shortfallDecimal).toNumber();
                await manager.save(user.account); // Save account changes
              }

              investment.status = InvestmentStatus.CLOSED;
              investment.closedAt = new Date();
              // Don't increment daysCompleted or set lastProfitDistributedAt here, it's closed.
              await manager.save(investment);

              await createNotification(
                {
                  userId: user.id,
                  title: 'Investment Closed (Shortfall Met)',
                  description: `Your investment on ${investment.investmentName} (${investment.investmentTier}) is complete. Final returns adjusted: $${shortfallDecimal.toFixed(2)}.`,
                  user: user as User
                },
                manager
              );
            }); // End Transaction for Shortfall

          } else {
            // No shortfall, just close the investment
            logger.info(`Closing completed investment ${investment.id} (no shortfall).`);
            investment.status = InvestmentStatus.CLOSED;
            investment.closedAt = new Date();
            await investmentRepo.model.save(investment); // Save directly if no transaction needed

             await createNotification( // Send notification even if no shortfall
                {
                  userId: user.id,
                  title: 'Investment Closed',
                  description: `Your investment on ${investment.investmentName} (${investment.investmentTier}) has completed its duration and is now closed.`,
                  user: user as User
                }
                // No manager needed if outside transaction
              );
          }
          continue; // Move to the next investment
        } // End Duration Check


        // --- Calculate Daily Profit for ongoing investments ---
        const remainingDays = investment.duration - investment.daysCompleted;
        if (remainingDays <= 0) {
            logger.warn(`Investment ${investment.id} has ${remainingDays} remaining days but isn't closed. Skipping distribution.`);
            continue; // Avoid division by zero and handle unexpected state
        }
        const totalReturnsLeft = expectedTotalReturns.sub(currentTotalReturns);
        const avgDailyReturn = totalReturnsLeft.div(remainingDays);

        // Apply fluctuation factor (consider if this randomness is truly desired)
        const FLUCTUATION_MIN = 0.8;
        const FLUCTUATION_MAX = 1.2;
        const fluctuationFactor = FLUCTUATION_MIN + Math.random() * (FLUCTUATION_MAX - FLUCTUATION_MIN);

        // Calculate daily return using Decimal, ensure non-negative, round appropriately
        let dailyReturnDecimal = avgDailyReturn.mul(fluctuationFactor);
        if (dailyReturnDecimal.isNegative()) {
            dailyReturnDecimal = new Decimal(0);
        }
        // Ensure daily return doesn't exceed remaining total returns left (can happen with fluctuation)
        if (dailyReturnDecimal.greaterThan(totalReturnsLeft) && !totalReturnsLeft.isNegative()) {
           dailyReturnDecimal = totalReturnsLeft;
        }

        // Round to 2 decimal places *after* calculations
        dailyReturnDecimal = dailyReturnDecimal.toDecimalPlaces(2);

        // --- Distribute Daily Profit within a Transaction ---
         logger.info(`Processing daily return of ${dailyReturnDecimal.toFixed(2)} for investment ${investment.id}`);
        await dataSource.transaction(async (manager) => {
          const profit = new Profit();
          profit.userId = investment.userId;
          profit.accountId = user.account.id;
          profit.investmentId = investment.id;
          profit.amount = dailyReturnDecimal.toNumber(); // Convert back for saving
          profit.status = investment.autocompounded
            ? ProfitStatus.FROZEN
            : ProfitStatus.DISTRIBUTED;
          if (!investment.autocompounded) profit.distributedAt = new Date();
          profit.investment = investment as Investment;

          const txn = new Transaction();
          txn.actualAmountInUSD = profit.amount;
          txn.amountInCurrency = profit.amount;
          txn.amountInUSD = profit.amount;
          txn.charge = 0;
          txn.createdAt = new Date();
          txn.currency = 'USD';
          txn.description = `Daily return on ${investment.investmentName} (${investment.investmentTier} Tier)`;
          txn.investmentId = investment.id;
          txn.isWireTransfer = false;
          txn.rate = 1;
          txn.status = TransactionStatus.SUCCESSFUL;
          txn.transactionType = TransactionType.PROFIT;
          txn.userId = investment.userId;
          txn.user = user as User;

          await manager.save(profit);
          await manager.save(txn);

          // Update investment state
          investment.currentTotalReturns = currentTotalReturns.add(dailyReturnDecimal).toNumber();
          investment.daysCompleted += 1;
          investment.lastProfitDistributedAt = new Date(); // Mark distribution time
          investment.lastProfitAmount = profit.amount;

          if (investment.autocompounded) {
            investment.currentCompoundedAmount = currentCompoundedAmount.add(dailyReturnDecimal).toNumber();
          } else {
            user.account.walletBalance = userWalletBalance.add(dailyReturnDecimal).toNumber();
            await manager.save(user.account); // Save updated user account balance
          }

          await manager.save(investment); // Save updated investment details

          await createNotification(
            {
              userId: user.id,
              title: 'Daily Return Received',
              description: `Investment: ${investment.investmentName}\nTier: ${investment.investmentTier}\nAmount: $${profit.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // Format amount
              user: user as User
            },
            manager
          );
        }); // End Transaction for Daily Profit

      } catch (error) {
        logger.error(`Failed to process profit distribution for investment ${investment.id}:`, error);
        // Continue to the next investment
      }
    } // End For Loop

    logger.info('Profit distribution cycle finished.');

  } catch (error) {
    // Catch errors during setup (DB connection, initial find)
    logger.error('Error during profit distribution setup or initial fetch:', error);
  }
};

/* import { initDataSource } from '../../../config/database.config'
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
        //Check for shortfall if investment duration has been completed
        //If no shortfall, close investment
        //Else add the shortfall and close the investment
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
 */