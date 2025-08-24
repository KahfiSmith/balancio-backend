import mongoose, { Document, Schema } from 'mongoose';

export interface IIncome extends Document {
  userId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  amount: number;
  date: Date;
  source: 'salary' | 'freelance' | 'investment' | 'business' | 'gift' | 'other';
  isRecurring: boolean;
  recurrence?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
    nextDate?: Date;
  };
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const IncomeSchema = new Schema<IIncome>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category ID is required'],
  },
  title: {
    type: String,
    required: [true, 'Income title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0'],
    validate: {
      validator: function(v: number) {
        return Number.isFinite(v) && v > 0;
      },
      message: 'Amount must be a valid positive number',
    },
  },
  date: {
    type: Date,
    required: [true, 'Income date is required'],
    default: Date.now,
  },
  source: {
    type: String,
    enum: ['salary', 'freelance', 'investment', 'business', 'gift', 'other'],
    default: 'other',
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurrence: {
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
    },
    interval: {
      type: Number,
      min: [1, 'Interval must be at least 1'],
    },
    endDate: Date,
    nextDate: Date,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

IncomeSchema.index({ userId: 1, date: -1 });
IncomeSchema.index({ userId: 1, categoryId: 1 });
IncomeSchema.index({ userId: 1, isActive: 1 });
IncomeSchema.index({ date: -1 });
IncomeSchema.index({ 'recurrence.nextDate': 1, isRecurring: 1 });

export const Income = mongoose.model<IIncome>('Income', IncomeSchema);