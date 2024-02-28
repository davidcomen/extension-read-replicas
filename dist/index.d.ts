import * as _prisma_client_extension_js from '@prisma/client/extension.js';
import * as _prisma_client_runtime_library from '@prisma/client/runtime/library';
import { PrismaClient } from '@prisma/client';

declare const readReplicas: (replica: PrismaClient) => (client: any) => _prisma_client_extension_js.PrismaClientExtends<_prisma_client_runtime_library.InternalArgs<{}, {}, {}, {
    $primary<T extends object>(this: T): Omit<T, "$primary" | "$replica">;
    $replica<T_1 extends object>(this: T_1): Omit<T_1, "$primary" | "$replica">;
}> & _prisma_client_runtime_library.DefaultArgs>;

export { readReplicas };
