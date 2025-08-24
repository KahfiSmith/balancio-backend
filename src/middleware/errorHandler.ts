import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { ApiResponse } from '@/types';

interface CustomError extends Error {
  statusCode?: number;
  code?: number;
  path?: string;
  value?: string;
  errors?: any;
}

export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  let message = error.message || 'Internal Server Error';
  let statusCode = error.statusCode || 500;

  // Mongoose bad ObjectId
  if (error.name === 'CastError') {
    message = 'Resource not found';
    statusCode = 404;
  }

  // Mongoose duplicate key
  if (error.code === 11000) {
    const field = Object.keys(error.errors || {})[0];
    message = `${field} already exists`;
    statusCode = 400;
  }

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors || {}).map((val: any) => val.message);
    message = errors.join(', ');
    statusCode = 400;
  }

  // JWT error
  if (error.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    statusCode = 401;
  }

  // JWT expired error
  if (error.name === 'TokenExpiredError') {
    message = 'Token expired';
    statusCode = 401;
  }

  logger.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    statusCode,
  });

  // Create response object and only include error in development mode
  const response: ApiResponse = {
    success: false,
    message
  };
  
  // Only add error property if we're in development mode
  if (process.env.NODE_ENV === 'development' && error.stack) {
    response.error = error.stack;
  }

  res.status(statusCode).json(response);
};