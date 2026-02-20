import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Инициализация базы данных (проверка соединения)
let isConnected = false

export async function ensureDbInitialized() {
  if (isConnected) return

  try {
    await db.$connect()
    isConnected = true
    console.log('✅ Database connected')
  } catch (error) {
    console.error('❌ Database connection error:', error)
  }
}
