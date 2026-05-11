import { Prisma } from '@prisma/client'

export default function withAudit<T extends Record<string, any>>(
  action: string,
  entity: string,
  callback: () => Promise<T>,
  userId?: string
): Promise<T> {
  return callback().then(async (result) => {
    // Log de auditoria aqui se necessário
    return result
  })
}