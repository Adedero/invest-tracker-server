import type { Request, Response } from 'express'
import getRepository from '../../../utils/repository'
import { sendResponse } from '../../../utils/helpers'
import axios from 'axios'
import env from '../../../utils/env'

const COINLAYER_API = env.get('COINLAYER_API')
const COINLAYER_API_KEY = env.get('COINLAYER_API_KEY')

export const currencyRate = async (req: Request, res: Response) => {
  const { symbol } = req.params
  const { amount } = req.query

  const parsedAmount = Number(amount)

  if (!amount || isNaN(parsedAmount)) {
    sendResponse(res, 400, 'Invalid or missing amount')
    return
  }

  const currencies = await getRepository('Currency')
  const [error, currency] = await currencies.findOne({
    where: { abbr: symbol.toUpperCase() }
  })

  if (error) {
    sendResponse(res, 500, error.message)
    return
  }

  if (!currency) {
    sendResponse(res, 404, 'Currency not found')
    return
  }

  const result = parsedAmount / (currency.rate || 1)

  const payload = {
    amount: Number(amount),
    currency,
    result
  }

  const oneDayAgo = new Date().getTime() - 24 * 60 * 60 * 1000
  const updatedAt = currency.rateUpdatedAt ? new Date(currency.rateUpdatedAt).getTime() : null

  if (updatedAt && updatedAt >= oneDayAgo) {
    sendResponse(res, 200, payload)
    return
  }

  let data: Record<string, unknown> = {}

  const uri = `${COINLAYER_API}/live?access_key=${COINLAYER_API_KEY}&target=USD&symbols=${currency.abbr.toUpperCase()}`

  try {
    const response = await axios.get(uri)

    data = response.data

    if (data.error) {
      sendResponse(res, 200, payload)
      return
    }

    const rate = (data.rates as Record<string, number>)[
      currency.abbr.toUpperCase()
    ]

    if (rate) {
      currency.rate = rate ?? currency.rate
      currency.rateUpdatedAt = new Date()
      await currencies.save(currency)

      payload.currency.rate = rate
      payload.result = parsedAmount / rate
    }
    
    sendResponse(res, 200, payload)
  } catch (error) {
    sendResponse(res, 500, (error as Error).message)
    return
  }
}
