import { prisma } from '@/config/prisma';
import { PaginationQuery } from '@/types';

export class PrismaService {
  // Generic pagination helper
  static getPaginationParams(query: PaginationQuery) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    return {
      skip,
      take: limit,
      page,
      limit,
    };
  }

  // Generic sorting helper
  static getSortParams(sort?: string, order: 'asc' | 'desc' = 'desc') {
    if (!sort) return { createdAt: order };
    
    return {
      [sort]: order,
    };
  }

  // Generic search helper for text fields
  static getTextSearchFilter(searchTerm?: string, fields: string[] = []) {
    if (!searchTerm || fields.length === 0) return {};

    const searchFilter = fields.map(field => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive' as const,
      },
    }));

    return {
      OR: searchFilter,
    };
  }

  // Date range filter helper
  static getDateRangeFilter(startDate?: Date, endDate?: Date, dateField = 'createdAt') {
    const filter: any = {};

    if (startDate || endDate) {
      filter[dateField] = {};
      if (startDate) {
        filter[dateField].gte = startDate;
      }
      if (endDate) {
        filter[dateField].lte = endDate;
      }
    }

    return filter;
  }

  // Transaction helper
  static async executeTransaction<T>(
    operations: (prisma: typeof import('@prisma/client').PrismaClient) => Promise<T>
  ): Promise<T> {
    return await prisma.$transaction(async (tx) => {
      return await operations(tx);
    });
  }

  // Health check
  static async healthCheck(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export prisma instance for direct use
export { prisma };
export default PrismaService;