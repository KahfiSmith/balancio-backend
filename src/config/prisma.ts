import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Get NODE_ENV directly from process.env to avoid circular import
const NODE_ENV = process.env.NODE_ENV || 'development';

// Check for DATABASE_URL
if (!process.env.DATABASE_URL) {
  logger.error('DATABASE_URL is not defined in environment variables');
  process.exit(1);
}

// Prevent multiple instances of Prisma Client in development
const prisma = globalThis.__prisma || new PrismaClient({
  log: NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'pretty',
  datasources: {
    db: {
      url: process.env.DATABASE_URL as string,
    },
  },
});

if (NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Connection management is handled by connect/disconnect functions
// We don't use $on events as they may not be compatible with MongoDB connector

// Test connection
export const connectPrisma = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('🗄️  Prisma connected to MongoDB successfully');
  } catch (error) {
    logger.error('Failed to connect to MongoDB via Prisma:', error);
    process.exit(1);
  }
};

export const disconnectPrisma = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('Prisma client disconnected from MongoDB');
  } catch (error) {
    logger.error('Error disconnecting Prisma client:', error);
  }
};

export { prisma };
export default prisma;