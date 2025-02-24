import { Request, Response } from 'express'
import { initDataSource, Model } from '../config/database.config'
import getRepository from './repository'
import { sendResponse } from './helpers'
import { ExpressUser } from '../definitions'
import { EntityManager, ObjectLiteral, Repository } from 'typeorm'
import * as argon from 'argon2'
import logger from './logger'
import { Notification } from '../models/notification.model'
import { User } from '../models/user.model'
import { sendEmail } from './mail'
import { z } from 'zod'
import { Account } from '../models/account.model'
import { emailTemplate } from './emails'

interface NotificationData {
  userId: string
  title: string
  description: string
  isRead?: boolean
  icon?: string
  user?: User
}

export const createNotification = async (
  data: NotificationData,
  manager?: EntityManager
): Promise<null | Error> => {
  try {
    const notifications = await getRepository('Notification')
    let repo: Repository<ObjectLiteral>
    if (manager) {
      repo = manager.withRepository(notifications.model)
    } else {
      repo = notifications.model
    }
    const notification = new Notification()
    notification.userId = data.userId
    notification.title = data.title
    notification.description = data.description
    notification.isRead = data.isRead ?? false
    if (data.icon) notification.icon = data.icon
    if (data.user) notification.user = data.user

    await repo.save(notification)
    return null
  } catch (error) {
    const err = error as Error
    return err
  }
}

interface HandlerHookParams {
  onBeforeEnd?: (req: Request, res: Response) => Promise<void> | void
  onBeforeUpdate?: (
    ctx: { req: Request; res: Response },
    data: unknown
  ) => Promise<unknown> | unknown
}

export const getHandler = (model: keyof Model, hooks?: HandlerHookParams) => {
  return async (req: Request, res: Response) => {
    const repository = await getRepository(model)

    const { key, limit, skip, relation, field, sort, where } = req.query

    // Determine the correct ID field
    const idField = key ? key.toString() : 'id'
    const id = req.params[idField] ?? req.params.id

    // Initialize the query object
    let query: Record<string, unknown> | undefined = id
      ? { [idField]: id }
      : undefined

    // Process the `where` parameter if it exists
    if (where) {
      const whereParams = Array.isArray(where) ? where : [where] // Ensure `where` is always an array
      whereParams.forEach((w) => {
        const [key, rawValue] = w.toString().split(',')
        if (key && rawValue) {
          let value: unknown = rawValue.trim()

          // Attempt to convert the value to the appropriate type
          if (value === 'true' || value === 'false') {
            value = value === 'true' // Convert to boolean
          } else if (!isNaN(Number(value))) {
            value = Number(value) // Convert to number if it's numeric
          }

          // Merge the parsed condition into the query object
          const condition = { [key.trim()]: value }
          query = query ? { ...query, ...condition } : condition
        }
      })
    }

    // Parse relations
    const parsedRelation = relation ? relation.toString().split(',') : []
    const selectedRelations = parsedRelation.length
      ? Object.fromEntries(parsedRelation.map((rel) => [rel, true]))
      : undefined

    // Parse selected fields
    const selectedFields = field ? field.toString().split(',') : undefined

    // Handle sorting
    const sortOrder: Record<string, 'ASC' | 'DESC'> = {}
    if (sort) {
      const sortParams = Array.isArray(sort) ? sort : [sort]
      sortParams.forEach((s) => {
        const [sortField, order] = s.toString().split(',')
        if (
          sortField &&
          (order?.toUpperCase() === 'ASC' || order?.toUpperCase() === 'DESC')
        ) {
          sortOrder[sortField] = order.toUpperCase() as 'ASC' | 'DESC'
        }
      })
    }

    // Fetch data from the repository
    const [error, result] = await repository[id ? 'findOne' : 'findAll']({
      where: query,
      take: id ? 1 : limit ? parseInt(limit.toString(), 10) : undefined,
      skip: skip ? parseInt(skip.toString(), 10) : undefined,
      relations: selectedRelations,
      select: selectedFields,
      order: Object.keys(sortOrder).length ? sortOrder : undefined
    })

    if (error) {
      sendResponse(res, 500, error.message)
      return
    }

    if (!result) {
      sendResponse(res, 404, 'Data not found')
      return
    }

    if (hooks?.onBeforeEnd) {
      await hooks.onBeforeEnd(req, res)
    }

    sendResponse(res, 200, { data: result })
    return
  }
}

export const postHandler = (model: keyof Model, hooks?: HandlerHookParams) => {
  return async (req: Request, res: Response) => {
    const { data, addUserRelation } = req.body

    if (!data || Object.keys(data).length === 0) {
      sendResponse(res, 400, 'No data provided')
      return
    }

    const { dataSource } = await initDataSource()

    try {
      await dataSource.manager.transaction(async (manager) => {
        // Fetch the repository dynamically using your utility
        const repository = await getRepository(model)
        const repositoryInstance = manager.withRepository(repository.model)

        // Create and save the record
        const created = repositoryInstance.create(data) as ObjectLiteral

        if (model === 'User') {
          const account = new Account()
          created['account'] = account
          created.password = await argon.hash(data.password ?? '')
        }

        await manager.save(created)

        if (addUserRelation) {
          // Fetch the User repository dynamically
          const userRepository = await getRepository('User')
          const userInstance = manager.withRepository(userRepository.model)

          // Find the related user
          const user = await userInstance.findOne({
            where: { id: (req.user as ExpressUser)?.id }
          })

          if (!user) {
            throw new Error('User not found')
          }

          // Add the user relation
          created['user'] = user

          // Save the record with the new relation
          await manager.save(created)
        }
        if (hooks?.onBeforeEnd) {
          await hooks.onBeforeEnd(req, res)
        }
        // Send a successful response with the created data
        sendResponse(res, 201, { data: created })
      })
    } catch (error) {
      logger.error('Transaction failed:', error)
      sendResponse(
        res,
        500,
        `Failed to create ${model}: ${(error as Error).message}`
      )
    }
  }
}

export const putHandler = (model: keyof Model, hooks?: HandlerHookParams) => {
  return async (req: Request, res: Response) => {
    const ctx = { req, res }
    const { data } = req.body

    if (!data || Object.keys(data).length === 0) {
      sendResponse(res, 400, 'No data provided')
      return
    }

    const { id } = req.params

    const { where } = req.query

    if (!id && !where) {
      sendResponse(res, 400, 'Invalid request query')
      return
    }

    let query: Record<string, unknown> = id ? { id: id } : {}

    // Process the `where` parameter if it exists
    if (where) {
      const whereParams = Array.isArray(where) ? where : [where] // Ensure `where` is always an array
      whereParams.forEach((w) => {
        const [key, rawValue] = w.toString().split(',')
        if (key && rawValue) {
          let value: unknown = rawValue.trim()

          // Attempt to convert the value to the appropriate type
          if (value === 'true' || value === 'false') {
            value = value === 'true' // Convert to boolean
          } else if (!isNaN(Number(value))) {
            value = Number(value) // Convert to number if it's numeric
          }

          // Merge the parsed condition into the query object
          const condition = { [key.trim()]: value }
          query = query ? { ...query, ...condition } : condition
        }
      })
    }

    const { dataSource } = await initDataSource()

    try {
      await dataSource.manager.transaction(async (manager) => {
        // Fetch the repository dynamically using your utility
        const repository = await getRepository(model)
        const repositoryInstance = manager.withRepository(repository.model)

        let updatedData = data
        if (hooks?.onBeforeUpdate) {
          const result = await hooks.onBeforeUpdate(ctx, data)
          if (result) {
            updatedData = result
          }
        }
        // Create and save the record
        const updated = await repositoryInstance.update(query, updatedData)
        // Send a successful response with the updated data
        if (hooks?.onBeforeEnd) {
          await hooks.onBeforeEnd(req, res)
        }
        sendResponse(res, 201, { data: updated })
      })
    } catch (error) {
      logger.error('Transaction failed:', error)
      sendResponse(
        res,
        500,
        `Failed to create ${model}: ${(error as Error).message}`
      )
    }
  }
}

export const deleteHandler = (
  model: keyof Model,
  hooks?: HandlerHookParams
) => {
  return async (req: Request, res: Response) => {
    const { id } = req.params

    const { where } = req.query

    if (!id && !where) {
      sendResponse(res, 400, 'Invalid request query')
      return
    }

    let query: Record<string, unknown> = id ? { id: id } : {}

    // Process the `where` parameter if it exists
    if (where) {
      const whereParams = Array.isArray(where) ? where : [where] // Ensure `where` is always an array
      whereParams.forEach((w) => {
        const [key, rawValue] = w.toString().split(',')
        if (key && rawValue) {
          let value: unknown = rawValue.trim()

          // Attempt to convert the value to the appropriate type
          if (value === 'true' || value === 'false') {
            value = value === 'true' // Convert to boolean
          } else if (!isNaN(Number(value))) {
            value = Number(value) // Convert to number if it's numeric
          }

          // Merge the parsed condition into the query object
          const condition = { [key.trim()]: value }
          query = query ? { ...query, ...condition } : condition
        }
      })
    }

    const repository = await getRepository(model)

    try {
      const result = await repository.model.delete(query)
      const msg = result.affected === 1 ? 'Item' : 'Items'

      if (hooks?.onBeforeEnd) {
        await hooks.onBeforeEnd(req, res)
      }

      sendResponse(res, 200, `${result.affected} ${msg} deleted.`)
    } catch (error) {
      logger.error('Failed to delete item', error)
      sendResponse(
        res,
        500,
        `Failed to create ${model}: ${(error as Error).message}`
      )
    }
  }
}

export const countHandler = (model: keyof Model) => {
  return async (req: Request, res: Response) => {
    const { where } = req.query

    // Initialize the query object
    let query: Record<string, unknown> = {}

    // Process the `where` parameter if it exists
    if (where) {
      const whereParams = Array.isArray(where) ? where : [where] // Ensure `where` is always an array
      whereParams.forEach((w) => {
        const [key, rawValue] = w.toString().split(',')
        if (key && rawValue) {
          let value: unknown = rawValue.trim()

          // Attempt to convert the value to the appropriate type
          if (value === 'true' || value === 'false') {
            value = value === 'true' // Convert to boolean
          } else if (!isNaN(Number(value))) {
            value = Number(value) // Convert to number if it's numeric
          }

          // Merge the parsed condition into the query object
          const condition = { [key.trim()]: value }
          query = query ? { ...query, ...condition } : condition
        }
      })
    }

    const repository = await getRepository(model)

    try {
      const result = await repository.model.count({
        where: query
      })
      sendResponse(res, 200, { count: result })
    } catch (error) {
      logger.error('Failed to count items', error)
      sendResponse(
        res,
        500,
        `Failed to count items: ${(error as Error).message}`
      )
    }
  }
}

export const changePasswordHandler = async (req: Request, res: Response) => {
  const { data } = req.body

  if (!data || Object.keys(data).length === 0) {
    sendResponse(res, 400, 'No data provided')
    return
  }

  const { id } = req.params

  if (!id) {
    sendResponse(res, 400, 'No id provided')
    return
  }

  try {
    const users = await getRepository('User')

    const user = await users.model.findOne({
      where: { id },
      select: ['id', 'password']
    })
    if (!user) {
      sendResponse(res, 404, 'User not found')
      return
    }
    const { p1, p2, p3 } = data

    if (p2 === p1) {
      sendResponse(
        res,
        400,
        'Your new password cannot be the same with your current password.'
      )
      return
    }

    const isMatch = await argon.verify(user.password, p1)

    if (!isMatch) {
      sendResponse(
        res,
        400,
        'Incorrect old password. Enter the correct password and try again'
      )
      return
    }
    if (p2.length < 8) {
      sendResponse(
        res,
        400,
        'Your new password must contain at least 8 characters'
      )
      return
    }
    if (p3 !== p2) {
      sendResponse(
        res,
        400,
        'Passwords do not match. Please, confirm your new password and try again.'
      )
      return
    }
    const hash = await argon.hash(p2)

    user.password = hash

    await users.model.save(user)

    await createNotification({
      userId: user.id,
      title: 'Change of password',
      description:
        'Your password was changed successfully. If you did not do this or you suspect your account has been compromised, please contact support immediately.',
      user: user as User
    })

    sendResponse(res, 200, 'Password changed successfully.')
  } catch (error) {
    sendResponse(
      res,
      500,
      `Failed to change password: ${(error as Error).message}`
    )
  }
}

export const emailHandler = async (req: Request, res: Response) => {
  const { email, text, data } = req.body

  if (!email || (!text && !data)) {
    sendResponse(res, 400, 'Email, subject, and content are required')
    return
  }

  const { subject, name, info, intro, outro, footer } = data

  if (data) {
    const Schema = z.object({
      email: z
        .string({ message: 'Email is required' })
        .email({ message: 'Invalid email provided' }),
      subject: z.string({ message: 'Email Subject is required' }),
      name: z.string({ message: "User's name is required" }),
      intro: z.string({ message: 'Email content is required' })
    })

    const result = Schema.safeParse({ email, subject, name, intro, outro })

    if (!result.success) {
      sendResponse(res, 400, result.error.errors[0].message)
      return
    }
  }

  const error = await sendEmail({
    toEmail: email,
    subject,
    text,
    html: emailTemplate({ subject, name, intro, info, outro, footer })
  })

  if (error) {
    sendResponse(res, 400, error.message)
    return
  }

  sendResponse(res, 200, 'Email sent successfully')
}
