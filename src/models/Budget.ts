import mongoose, { Document, Schema } from 'mongoose';

export interface IBudget extends Document {
  userId: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  amount: number;
  spent: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate: Date;
  alertThreshold: number;
  isActive: boolean;
  notifications: {
    enabled: boolean;
    thresholds: number[];
  };
  createdAt: Date;
  updatedAt: Date;
  getRemainingAmount(): number;
  getSpentPercentage(): number;
  isOverBudget(): boolean;
}

const BudgetSchema = new Schema<IBudget>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  name: {
    type: String,
    required: [true, 'Budget name is required'],
    trim: true,
    maxlength: [100, 'Budget name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  amount: {
    type: Number,
    required: [true, 'Budget amount is required'],
    min: [0.01, 'Amount must be greater than 0'],
    validate: {
      validator: function(v: number) {
        return Number.isFinite(v) && v > 0;
      },
      message: 'Amount must be a valid positive number',
    },
  },
  spent: {
    type: Number,
    default: 0,
    min: [0, 'Spent amount cannot be negative'],
  },
  period: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    required: [true, 'Budget period is required'],
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
  },
  alertThreshold: {
    type: Number,
    default: 80,
    min: [0, 'Alert threshold cannot be negative'],
    max: [100, 'Alert threshold cannot exceed 100%'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  notifications: {
    enabled: {
      type: Boolean,
      default: true,
    },
    thresholds: [{
      type: Number,
      min: [0, 'Threshold cannot be negative'],
      max: [100, 'Threshold cannot exceed 100%'],
    }],
  },
}, {
  timestamps: true,
});

BudgetSchema.methods.getRemainingAmount = function(): number {
  return Math.max(0, this.amount - this.spent);
};

BudgetSchema.methods.getSpentPercentage = function(): number {
  return this.amount > 0 ? Math.round((this.spent / this.amount) * 100) : 0;
};

BudgetSchema.methods.isOverBudget = function(): boolean {
  return this.spent > this.amount;
};

BudgetSchema.index({ userId: 1, period: 1 });
BudgetSchema.index({ userId: 1, isActive: 1 });
BudgetSchema.index({ endDate: 1, isActive: 1 });
BudgetSchema.index({ userId: 1, categoryId: 1 });

export const Budget = mongoose.model<IBudget>('Budget', BudgetSchema);