import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
  avatar: z.string().url().optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(6).max(100),
  newPassword: z.string().min(6).max(100),
});

export const updatePreferencesSchema = z.object({
  currency: z.string().optional(),
  timezone: z.string().optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    budgetAlerts: z.boolean().optional(),
    goalMilestones: z.boolean().optional(),
  }).optional(),
  privacy: z.object({
    profileVisible: z.boolean().optional(),
    dataSharing: z.boolean().optional(),
  }).optional(),
});

