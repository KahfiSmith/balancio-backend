import { prisma } from '@/config/prisma';
import { PaginationQuery } from '@/types';
import { PrismaService } from '@/services/prismaService';
import bcrypt from 'bcryptjs';
import { config } from '@/config/config';

export class UserService {
  // Create new user
  static async createUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    const hashedPassword = await bcrypt.hash(userData.password, config.BCRYPT_ROUNDS);

    return await prisma.user.create({
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: hashedPassword,
        preferences: {
          create: {
            notifications: {
              create: {},
            },
            privacy: {
              create: {},
            },
          },
        },
      },
      include: {
        preferences: {
          include: {
            notifications: true,
            privacy: true,
          },
        },
      },
    });
  }

  // Get user by ID
  static async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        preferences: {
          include: {
            notifications: true,
            privacy: true,
          },
        },
      },
    });
  }

  // Get user by email
  static async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        preferences: {
          include: {
            notifications: true,
            privacy: true,
          },
        },
      },
    });
  }

  // Update user profile
  static async updateUser(id: string, updateData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string;
  }) {
    return await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        preferences: {
          include: {
            notifications: true,
            privacy: true,
          },
        },
      },
    });
  }

  // Update user password
  static async updatePassword(id: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, config.BCRYPT_ROUNDS);
    
    return await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  // Update user preferences
  static async updatePreferences(userId: string, preferences: {
    currency?: string;
    timezone?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
      budgetAlerts?: boolean;
      goalMilestones?: boolean;
    };
    privacy?: {
      profileVisible?: boolean;
      dataSharing?: boolean;
    };
  }) {
    return await PrismaService.executeTransaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { preferences: true },
      });

      if (!user) throw new Error('User not found');

      let userPreferences = user.preferences;

      if (!userPreferences) {
        userPreferences = await tx.userPreferences.create({
          data: {
            userId,
            currency: preferences.currency || 'USD',
            timezone: preferences.timezone || 'UTC',
          },
        });
      } else {
        const prefUpdate: { currency?: string; timezone?: string } = {};
        if (preferences.currency !== undefined) prefUpdate.currency = preferences.currency;
        if (preferences.timezone !== undefined) prefUpdate.timezone = preferences.timezone;
        userPreferences = await tx.userPreferences.update({
          where: { id: userPreferences.id },
          data: prefUpdate,
        });
      }

      // Update notifications if provided
      if (preferences.notifications) {
        await tx.userNotificationPreferences.upsert({
          where: { preferencesId: userPreferences.id },
          create: {
            preferencesId: userPreferences.id,
            ...preferences.notifications,
          },
          update: preferences.notifications,
        });
      }

      // Update privacy if provided
      if (preferences.privacy) {
        await tx.userPrivacyPreferences.upsert({
          where: { preferencesId: userPreferences.id },
          create: {
            preferencesId: userPreferences.id,
            ...preferences.privacy,
          },
          update: preferences.privacy,
        });
      }

      return await tx.user.findUnique({
        where: { id: userId },
        include: {
          preferences: {
            include: {
              notifications: true,
              privacy: true,
            },
          },
        },
      });
    });
  }

  // Soft delete user (deactivate)
  static async deactivateUser(id: string) {
    return await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Hard delete user and all related data
  static async deleteUser(id: string) {
    return await PrismaService.executeTransaction(async (tx) => {
      // Delete all related data first due to cascade rules
      await tx.notification.deleteMany({ where: { userId: id } });
      await tx.goalContribution.deleteMany({ 
        where: { goal: { userId: id } } 
      });
      await tx.goalMilestone.deleteMany({ 
        where: { goal: { userId: id } } 
      });
      await tx.goal.deleteMany({ where: { userId: id } });
      await tx.budgetNotifications.deleteMany({ 
        where: { budget: { userId: id } } 
      });
      await tx.budget.deleteMany({ where: { userId: id } });
      await tx.incomeRecurrence.deleteMany({ 
        where: { income: { userId: id } } 
      });
      await tx.income.deleteMany({ where: { userId: id } });
      await tx.expenseRecurrence.deleteMany({ 
        where: { expense: { userId: id } } 
      });
      await tx.expense.deleteMany({ where: { userId: id } });
      await tx.category.deleteMany({ where: { userId: id } });
      
      // Delete user (this will cascade delete preferences)
      return await tx.user.delete({ where: { id } });
    });
  }

  // Update last login
  static async updateLastLogin(id: string) {
    return await prisma.user.update({
      where: { id },
      data: { lastLogin: new Date() },
    });
  }

  // Verify password
  static async verifyPassword(user: { password: string }, candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, user.password);
  }

  // Get users with pagination (admin only)
  static async getUsers(query: PaginationQuery & { search?: string }) {
    const { skip, take, page, limit } = PrismaService.getPaginationParams(query);
    const orderBy = PrismaService.getSortParams(query.sort, query.order);
    const searchFilter = PrismaService.getTextSearchFilter(query.search, ['firstName', 'lastName', 'email']);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          isActive: true,
          ...searchFilter,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
          isEmailVerified: true,
          role: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take,
        orderBy,
      }),
      prisma.user.count({
        where: {
          isActive: true,
          ...searchFilter,
        },
      }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export default UserService;
