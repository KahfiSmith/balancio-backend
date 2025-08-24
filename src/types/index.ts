import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export interface JWTPayload extends JwtPayload {
  id: string;
  email: string;
  role: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface DateRangeFilter {
  startDate?: Date;
  endDate?: Date;
}

export type TransactionType = 'expense' | 'income';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type BudgetPeriod = 'monthly' | 'quarterly' | 'yearly';
export type NotificationType = 'budget_alert' | 'goal_milestone' | 'system' | 'reminder';
export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';