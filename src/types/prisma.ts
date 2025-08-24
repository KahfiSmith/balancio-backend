import { 
  User, 
  UserPreferences, 
  Category, 
  Expense, 
  Income, 
  Budget, 
  Goal, 
  Notification 
} from '@prisma/client';

// Extended types with relations
export type UserWithPreferences = User & {
  preferences?: UserPreferences & {
    notifications?: any;
    privacy?: any;
  } | null;
};

export type ExpenseWithRelations = Expense & {
  user: User;
  category: Category;
  budget?: Budget | null;
  recurrence?: any | null;
};

export type IncomeWithRelations = Income & {
  user: User;
  category: Category;
  recurrence?: any | null;
};

export type BudgetWithRelations = Budget & {
  user: User;
  category?: Category | null;
  expenses: Expense[];
  notifications?: any | null;
};

export type GoalWithRelations = Goal & {
  user: User;
  milestones: any[];
  contributions: any[];
};

export type CategoryWithCounts = Category & {
  _count?: {
    expenses: number;
    incomes: number;
    budgets: number;
  };
};

// Input types for creation/updates
export type CreateUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type UpdateUserInput = {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
};

export type CreateExpenseInput = {
  categoryId: string;
  title: string;
  description?: string;
  amount: number;
  date?: Date;
  receipts?: string[];
  tags?: string[];
  location?: string;
  paymentMethod?: string;
  isRecurring?: boolean;
  recurrence?: {
    type: string;
    interval: number;
    endDate?: Date;
  };
  budgetId?: string;
};

export type CreateIncomeInput = {
  categoryId: string;
  title: string;
  description?: string;
  amount: number;
  date?: Date;
  source?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurrence?: {
    type: string;
    interval: number;
    endDate?: Date;
  };
};

export type CreateBudgetInput = {
  categoryId?: string;
  name: string;
  description?: string;
  amount: number;
  period: string;
  startDate: Date;
  endDate: Date;
  alertThreshold?: number;
  notifications?: {
    enabled?: boolean;
    thresholds?: number[];
  };
};

export type CreateGoalInput = {
  name: string;
  description?: string;
  targetAmount: number;
  targetDate: Date;
  category?: string;
  milestones?: {
    amount: number;
    note?: string;
  }[];
};

export type CreateCategoryInput = {
  name: string;
  description?: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
};

// Filter types
export type ExpenseFilters = {
  categoryId?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  paymentMethod?: string;
  tags?: string[];
  search?: string;
};

export type IncomeFilters = {
  categoryId?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  source?: string;
  tags?: string[];
  search?: string;
};

export type BudgetFilters = {
  categoryId?: string;
  period?: string;
  status?: 'active' | 'inactive' | 'exceeded';
  search?: string;
};

export type GoalFilters = {
  status?: string;
  category?: string;
  search?: string;
};

// Analytics types
export type SpendingTrend = {
  date: string;
  amount: number;
  count: number;
};

export type CategoryBreakdown = {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  count: number;
};

export type MonthlySummary = {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  budgetUsage: number;
};

export type FinancialHealth = {
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  savingsRate: number;
  budgetAdherence: number;
  goalProgress: number;
  score: number;
};