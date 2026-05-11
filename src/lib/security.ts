import { createHash } from 'crypto'

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function generateSecureToken(): string {
  return crypto.randomUUID()
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('pt-BR').format(d)
}

export function getExpiryDate(hours: number = 24): Date {
  const now = new Date()
  now.setHours(now.getHours() + hours)
  return now
}
