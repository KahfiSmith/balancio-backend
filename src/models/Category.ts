import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
  isDefault: boolean;
  userId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters'],
  },
  icon: {
    type: String,
    required: [true, 'Category icon is required'],
    trim: true,
  },
  color: {
    type: String,
    required: [true, 'Category color is required'],
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color'],
  },
  type: {
    type: String,
    enum: ['expense', 'income'],
    required: [true, 'Category type is required'],
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

CategorySchema.index({ userId: 1, type: 1, isActive: 1 });
CategorySchema.index({ name: 1, userId: 1, type: 1 }, { unique: true });
CategorySchema.index({ isDefault: 1, type: 1 });

export const Category = mongoose.model<ICategory>('Category', CategorySchema);