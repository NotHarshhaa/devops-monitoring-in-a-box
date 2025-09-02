// Client-safe Prisma client
// This file should only be used in server-side code or API routes

import { PrismaClient } from '@prisma/client'

// Only create Prisma client on server side
let prisma: PrismaClient

if (typeof window === 'undefined') {
  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
  }

  prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
} else {
  // This should never happen in client-side code
  throw new Error('Prisma client should not be used on the client side')
}

export { prisma }
