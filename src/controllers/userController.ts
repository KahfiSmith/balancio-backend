import { Request, Response } from 'express';
import { ApiResponse, AuthRequest } from '@/types';
import { UserService } from '@/services/userService';
import { prisma } from '@/config/prisma';
import bcrypt from 'bcryptjs';

export const getProfile = async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.user!.id;
  const user = await UserService.getUserById(userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  res.json({ success: true, message: 'OK', data: user });
};

export const updateProfile = async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.user!.id;
  const { firstName, lastName, email, avatar } = req.body as {
    firstName?: string; lastName?: string; email?: string; avatar?: string;
  };
  const data: { firstName?: string; lastName?: string; email?: string; avatar?: string } = {};
  if (firstName !== undefined) data.firstName = firstName;
  if (lastName !== undefined) data.lastName = lastName;
  if (email !== undefined) data.email = email;
  if (avatar !== undefined) data.avatar = avatar;

  const updated = await UserService.updateUser(userId, data);
  res.json({ success: true, message: 'Profile updated', data: updated });
};

export const updatePassword = async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.user!.id;
  const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };

  // Get user with password
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    res.status(400).json({ success: false, message: 'Current password is incorrect' });
    return;
  }

  await UserService.updatePassword(userId, newPassword);
  res.json({ success: true, message: 'Password updated' });
};

export const updatePreferences = async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.user!.id;
  const updated = await UserService.updatePreferences(userId, req.body);
  res.json({ success: true, message: 'Preferences updated', data: updated });
};

export const deleteAccount = async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.user!.id;
  await UserService.deleteUser(userId);
  res.json({ success: true, message: 'Account deleted' });
};
