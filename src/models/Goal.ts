import mongoose, { Document, Schema } from 'mongoose';

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  category: 'emergency_fund' | 'vacation' | 'house' | 'car' | 'education' | 'retirement' | 'other';
  milestones: Array<{
    amount: number;
    note?: string;
    achievedAt?: Date;
  }>;
  contributions: Array<{
    amount: number;
    date: Date;
    note?: string;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  getProgress(): number;
  getRemainingAmount(): number;
  getDaysRemaining(): number;
  isCompleted(): boolean;
}

const GoalSchema = new Schema<IGoal>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  name: {
    type: String,
    required: [true, 'Goal name is required'],
    trim: true,
    maxlength: [100, 'Goal name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [0.01, 'Target amount must be greater than 0'],
    validate: {
      validator: function(v: number) {
        return Number.isFinite(v) && v > 0;
      },
      message: 'Target amount must be a valid positive number',
    },
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Current amount cannot be negative'],
  },
  targetDate: {
    type: Date,
    required: [true, 'Target date is required'],
    validate: {
      validator: function(v: Date) {
        return v > new Date();
      },
      message: 'Target date must be in the future',
    },
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active',
  },
  category: {
    type: String,
    enum: ['emergency_fund', 'vacation', 'house', 'car', 'education', 'retirement', 'other'],
    default: 'other',
  },
  milestones: [{
    amount: {
      type: Number,
      required: true,
      min: [0.01, 'Milestone amount must be greater than 0'],
    },
    note: {
      type: String,
      trim: true,
      maxlength: [200, 'Note cannot exceed 200 characters'],
    },
    achievedAt: Date,
  }],
  contributions: [{
    amount: {
      type: Number,
      required: true,
      min: [0.01, 'Contribution amount must be greater than 0'],
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
      maxlength: [200, 'Note cannot exceed 200 characters'],
    },
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

GoalSchema.methods.getProgress = function(): number {
  return this.targetAmount > 0 ? Math.min(100, Math.round((this.currentAmount / this.targetAmount) * 100)) : 0;
};

GoalSchema.methods.getRemainingAmount = function(): number {
  return Math.max(0, this.targetAmount - this.currentAmount);
};

GoalSchema.methods.getDaysRemaining = function(): number {
  const today = new Date();
  const targetDate = new Date(this.targetDate);
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

GoalSchema.methods.isCompleted = function(): boolean {
  return this.currentAmount >= this.targetAmount;
};

GoalSchema.index({ userId: 1, status: 1 });
GoalSchema.index({ userId: 1, isActive: 1 });
GoalSchema.index({ targetDate: 1, status: 1 });
GoalSchema.index({ userId: 1, category: 1 });

export const Goal = mongoose.model<IGoal>('Goal', GoalSchema);