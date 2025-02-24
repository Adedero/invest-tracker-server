import type { Response } from 'express'
import { IS_PRODUCTION_ENV } from './constants'

export const sendResponse = (
  res: Response,
  status: number,
  data?: string | Record<string, unknown>
) => {
  const success = status < 400
  const payload = data
    ? typeof data === 'string'
      ? { message: data }
      : data
    : {}
  if (status >= 500 && IS_PRODUCTION_ENV) {
    payload.message =
      "Something went wrong and we're wroking to fix it. Please, try again later"
  }
  res.status(status).json({ success, ...payload })
  return
}

export function isWithinOneHour(date: string | Date) {
  const parsedDate = new Date(date)
  const now = new Date()
  const oneHourAgo = now.getTime() - 60 * 60 * 1000
  return (
    parsedDate.getTime() >= oneHourAgo && parsedDate.getTime() <= now.getTime()
  )
}

export const toTitleCase = (text: string | undefined) => {
  if (!text) {
    return ''
  }
  const parts = text.split(' ')
  return parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export const btoa = (str: string) =>
  Buffer.from(str, 'binary').toString('base64')
export const atob = (b64Encoded: string) =>
  Buffer.from(b64Encoded, 'base64').toString('binary')
