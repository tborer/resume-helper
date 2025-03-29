import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

// DATABASE UPDATE REQUIRED: When migrating to AWS
// 1. Ensure DATABASE_URL environment variable is set in AWS environment
// 2. Consider adding connection pooling for production environments
// 3. Add error handling for database connection failures
// 4. Consider adding logging for database operations in production

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  // Uncomment for database operation logging in development
  // log: ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;