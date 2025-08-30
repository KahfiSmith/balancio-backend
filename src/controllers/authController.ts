import { Request, Response } from 'express';
import { prisma } from '@/config/prisma';
import bcrypt from 'bcryptjs';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/utils/jwt';
import { ApiResponse } from '@/types';
import { config } from '@/config/config';

export const register = async (req: Request, res: Response<ApiResponse>) => {
  const { firstName, lastName, email, password } = req.body as {
    firstName: string; lastName: string; email: string; password: string;
  };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(400).json({ success: false, message: 'Email already registered' });
    return;
  }

  const hashed = await bcrypt.hash(password, config.BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashed,
      preferences: { create: { notifications: { create: {} }, privacy: { create: {} } } },
    },
    select: {
      id: true, firstName: true, lastName: true, email: true, role: true, isEmailVerified: true, createdAt: true, updatedAt: true,
    },
  });

  const payload = { id: user.id, email: user.email, role: user.role } as any;
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: { user, accessToken, refreshToken },
  });
};

export const login = async (req: Request, res: Response<ApiResponse>) => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
    return;
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
    return;
  }

  const payload = { id: user.id, email: user.email, role: user.role } as any;
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

  res.json({
    success: true,
    message: 'Login successful',
    data: { accessToken, refreshToken },
  });
};

export const refresh = async (req: Request, res: Response<ApiResponse>) => {
  const { refreshToken } = req.body as { refreshToken: string };
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const newAccess = signAccessToken({ id: decoded.id, email: decoded.email, role: decoded.role } as any);
    const newRefresh = signRefreshToken({ id: decoded.id, email: decoded.email, role: decoded.role } as any);
    res.json({ success: true, message: 'Token refreshed', data: { accessToken: newAccess, refreshToken: newRefresh } });
  } catch (e) {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

export const logout = async (_req: Request, res: Response<ApiResponse>) => {
  // Stateless JWT: client should discard tokens. Implement token blacklist if needed later.
  res.json({ success: true, message: 'Logged out' });
};

