import { PrismaClient } from '@prisma/client'
import { logger } from '@/lib/monitoring/logger'

/**
 * Prisma Client Singleton with Connection Pooling
 *
 * Best Practices:
 * - Single instance across the application (prevents connection exhaustion)
 * - Connection pooling configured for optimal performance
 * - Logging for slow queries and errors
 * - Graceful shutdown handling
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Create Prisma Client with optimized configuration
 */
function createPrismaClient() {
  const client = new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
    // Connection pool settings
    // Note: These are set via DATABASE_URL query params for better control
    // Example: postgresql://user:pass@host:port/db?connection_limit=10&pool_timeout=20
  })

  // Log slow queries (> 1 second)
  client.$on('query' as never, (e: unknown) => {
    const duration = e.duration || 0

    if (duration > 1000) {
      logger.warn('Slow database query detected', {
        query: e.query,
        duration: `${duration}ms`,
        params: e.params,
      })
    }

    if (process.env.NODE_ENV === 'development' && duration > 100) {
      logger.debug('Database query', {
        query: e.query,
        duration: `${duration}ms`,
      })
    }
  })

  // Log errors
  client.$on('error' as never, (e: unknown) => {
    logger.error('Database error', e)
  })

  // Log warnings
  client.$on('warn' as never, (e: unknown) => {
    logger.warn('Database warning', e)
  })

  return client
}

/**
 * Export singleton Prisma Client instance
 */
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

/**
 * Graceful shutdown - disconnect Prisma on process exit
 */
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    logger.info('Disconnecting Prisma Client...')
    await prisma.$disconnect()
  })

  process.on('SIGINT', async () => {
    logger.info('SIGINT received - disconnecting Prisma Client...')
    await prisma.$disconnect()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received - disconnecting Prisma Client...')
    await prisma.$disconnect()
    process.exit(0)
  })
}

/**
 * Database connection health check
 */
export async function checkDatabaseConnection(): Promise<{
  healthy: boolean
  latency: number
  error?: string
}> {
  const start = Date.now()

  try {
    await prisma.$queryRaw`SELECT 1`
    const latency = Date.now() - start

    return {
      healthy: true,
      latency,
    }
  } catch (error) {
    const latency = Date.now() - start

    logger.error('Database connection check failed', error)

    return {
      healthy: false,
      latency,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get database pool stats (if available)
 */
export async function getDatabaseStats() {
  try {
    // Get active connections (PostgreSQL specific)
    const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT count(*)
      FROM pg_stat_activity
      WHERE datname = current_database()
    `

    return {
      activeConnections: Number(result[0]?.count || 0),
    }
  } catch (error) {
    logger.error('Failed to get database stats', error)
    return {
      activeConnections: -1,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Transaction helper with retry logic
 */
export async function withTransaction<T>(
  fn: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>,
  options?: {
    maxRetries?: number
    timeout?: number
  }
): Promise<T> {
  const maxRetries = options?.maxRetries || 3
  const timeout = options?.timeout || 10000

  let lastError: unknown

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await prisma.$transaction(fn, {
        timeout,
        maxWait: 5000, // Maximum time to wait for a transaction to start
      })
    } catch (error: unknown) {
      lastError = error

      // Don't retry on certain errors
      if (
        error.code === 'P2002' || // Unique constraint violation
        error.code === 'P2003' || // Foreign key constraint violation
        error.code === 'P2025'    // Record not found
      ) {
        throw error
      }

      // Retry on deadlocks and timeouts
      if (attempt < maxRetries) {
        const delay = Math.min(100 * Math.pow(2, attempt - 1), 1000)
        logger.warn('Transaction failed, retrying...', {
          attempt,
          maxRetries,
          delay,
          error: error.message,
        })
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  logger.error('Transaction failed after all retries', lastError)
  throw lastError
}
