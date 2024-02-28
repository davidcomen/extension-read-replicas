import { Prisma } from '@prisma/client/extension.js'

import { PrismaClient } from '@prisma/client'

const readOperations = [
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'findUnique',
  'findUniqueOrThrow',
  'groupBy',
  'aggregate',
  'count',
  'findRaw',
  'aggregateRaw',
]

export const readReplicas = (replica: PrismaClient) =>
  Prisma.defineExtension((client) => {
    return client.$extends({
      client: {
        $primary<T extends object>(this: T): Omit<T, '$primary' | '$replica'> {
          const context = Prisma.getExtensionContext(this)
          // If we're in a transaction, the current client is connected to the
          // primary.
          if (!('$transaction' in context && typeof context.$transaction === 'function')) {
            return context
          }

          return client as unknown as Omit<T, '$primary' | '$replica'>
        },

        $replica<T extends object>(this: T): Omit<T, '$primary' | '$replica'> {
          const context = Prisma.getExtensionContext(this)
          // If we're in a transaction, the current client is connected to the
          // primary.
          if (!('$transaction' in context && typeof context.$transaction === 'function')) {
            throw new Error(`Cannot use $replica inside of a transaction`)
          }

          return replica as unknown as Omit<T, '$primary' | '$replica'>
        },
      },

      query: {
        $allOperations({
          args,
          model,
          operation,
          query,
          // @ts-expect-error
          __internalParams: { transaction },
        }) {
          if (transaction) {
            return query(args)
          }
          if (readOperations.includes(operation)) {
            if (model) {
              return replica[model][operation](args)
            }
            return replica[operation](args)
          }

          return query(args)
        },
      },
    })
  })
