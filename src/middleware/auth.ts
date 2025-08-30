import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '@/models/User';
import { config } from '@/config/config';
import { AuthRequest, JWTPayload, ApiResponse } from '@/types';

export const authenticate = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
      return;
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as JWTPayload;
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Access denied. User not found or inactive.',
      });
      return;
    }

    req.user = {
      id: String(user._id),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isEmailVerified: user.isEmailVerified,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.',
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Access denied. Please authenticate.',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
      return;
    }

    next();
  };
};
