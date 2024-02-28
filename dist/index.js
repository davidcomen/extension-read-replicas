"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  readReplicas: () => readReplicas
});
module.exports = __toCommonJS(src_exports);

// src/extension.ts
var import_extension = require("@prisma/client/extension.js");
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
var readReplicas = (replica) => import_extension.Prisma.defineExtension((client) => {
  return client.$extends({
    client: {
      $primary() {
        const context = import_extension.Prisma.getExtensionContext(this);
        if (!("$transaction" in context && typeof context.$transaction === "function")) {
          return context;
        }
        return client;
      },
      $replica() {
        const context = import_extension.Prisma.getExtensionContext(this);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  readReplicas
});
