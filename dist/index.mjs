// src/extension.ts
import { Prisma } from "@prisma/client/extension.js";
var readOperations = [
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "findUnique",
  "findUniqueOrThrow",
  "groupBy",
  "aggregate",
  "count",
  "findRaw",
  "aggregateRaw"
];
var readReplicas = (replica) => Prisma.defineExtension((client) => {
  return client.$extends({
    client: {
      $primary() {
        const context = Prisma.getExtensionContext(this);
        if (!("$transaction" in context && typeof context.$transaction === "function")) {
          return context;
        }
        return client;
      },
      $replica() {
        const context = Prisma.getExtensionContext(this);
        if (!("$transaction" in context && typeof context.$transaction === "function")) {
          throw new Error(`Cannot use $replica inside of a transaction`);
        }
        return replica;
      }
    },
    query: {
      $allOperations({
        args,
        model,
        operation,
        query,
        // @ts-expect-error
        __internalParams: { transaction }
      }) {
        if (transaction) {
          return query(args);
        }
        if (readOperations.includes(operation)) {
          if (model) {
            return replica[model][operation](args);
          }
          return replica[operation](args);
        }
        return query(args);
      }
    }
  });
});
export {
  readReplicas
};
