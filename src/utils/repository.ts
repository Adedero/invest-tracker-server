import {
  DeepPartial,
  DeleteOptions,
  FindManyOptions,
  FindOneOptions,
  ObjectLiteral,
  RemoveOptions,
  Repository,
  SaveOptions,
  UpdateOptions
} from 'typeorm'
import { initDataSource, Model } from '../config/database.config'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity.js'
import { UpsertOptions } from 'typeorm/repository/UpsertOptions.js'

type RepositoryReturnType<T> = Promise<[Error | null, T | null]>

export default async function getRepository(modelName: keyof Model) {
  const { dataSource, model } = await initDataSource()
  const repository = model[modelName] as Repository<ObjectLiteral>
  if (!repository) {
    throw new Error(`Repository ${modelName} not found`)
  }
  return {
    DataSource: dataSource,

    model: repository,

    async findAll<T extends ObjectLiteral>(
      options: FindManyOptions
    ): RepositoryReturnType<T[] | ObjectLiteral[]> {
      try {
        const result = await repository.find(options)
        return [null, result]
      } catch (error) {
        return [error as Error, null]
      }
    },

    async findOne<T extends ObjectLiteral>(
      options: FindOneOptions
    ): RepositoryReturnType<T | ObjectLiteral> {
      try {
        const result = await repository.findOne(options)
        return [null, result]
      } catch (error) {
        return [error as Error, null]
      }
    },

    async findAndCount(
      options: FindManyOptions
    ): RepositoryReturnType<[ObjectLiteral[], number]> {
      try {
        const result = await repository.findAndCount(options)
        return [null, result]
      } catch (error) {
        return [error as Error, null]
      }
    },

    async create<T extends ObjectLiteral>(
      object: ObjectLiteral
    ): RepositoryReturnType<T | ObjectLiteral> {
      try {
        const newObject = repository.create(object)
        await repository.save(newObject)
        return [null, newObject]
      } catch (error) {
        return [error as Error, null]
      }
    },

    async save(
      entity: ObjectLiteral | DeepPartial<ObjectLiteral>[],
      options?: SaveOptions & { reload: false }
    ): RepositoryReturnType<SaveOptions & ObjectLiteral> {
      try {
        const result = await repository.save(entity, options)
        return [null, result]
      } catch (error) {
        return [error as Error, null]
      }
    },
    //remove and soft remove
    async remove(options: RemoveOptions, soft: boolean = false) {
      try {
        if (soft) {
          const result = await repository.softRemove(options)
          return [null, result]
        }
        const result = await repository.remove(options)
        return [null, result]
      } catch (error) {
        return [error as Error, null]
      }
    },

    async recover(options: RemoveOptions) {
      try {
        const result = await repository.recover(options)
        return [null, result]
      } catch (error) {
        return [error as Error, null]
      }
    },

    async insert(
      options:
        | QueryDeepPartialEntity<unknown>
        | QueryDeepPartialEntity<unknown>[]
    ) {
      try {
        const result = await repository.insert(options)
        return [null, result]
      } catch (error) {
        return [error as Error, null]
      }
    },

    async update(
      options: UpdateOptions,
      data: QueryDeepPartialEntity<unknown> | QueryDeepPartialEntity<unknown>[]
    ) {
      try {
        const result = await repository.update(options, data)
        return [null, result]
      } catch (error) {
        return [error as Error, null]
      }
    },

    async upsert(
      data: QueryDeepPartialEntity<unknown> | QueryDeepPartialEntity<unknown>[],
      options: UpsertOptions<ObjectLiteral> | string[]
    ) {
      try {
        const result = await repository.upsert(data, options)
        return [null, result]
      } catch (error) {
        return [error as Error, null]
      }
    },

    async delete(options: DeleteOptions, soft: boolean = false) {
      try {
        if (soft) {
          const result = await repository.softDelete(options)
          return [null, result]
        }
        const result = await repository.delete(options)
        return [null, result]
      } catch (error) {
        return [error as Error, null]
      }
    },

    async restore(options: DeleteOptions) {
      try {
        const result = await repository.restore(options)
        return [null, result]
      } catch (error) {
        return [error as Error, null]
      }
    }
  }
}

export type RepositoryMethod =
  | 'find'
  | 'findBy'
  | 'findOne'
  | 'increment'
  | 'hasId'
  | 'getId'
  | 'create'
  | 'merge'
  | 'preload'
  | 'save'
  | 'remove'
  | 'insert'
  | 'update'
  | 'upsert'
  | 'delete'
  | 'softDelete'
  | 'restore'
  | 'softRemove'
  | 'increment'
  | 'decrement'
  | 'exists'
  | 'existsBy'
  | 'count'
  | 'countBy'
