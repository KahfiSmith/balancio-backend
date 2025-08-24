import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import { config } from '@/config/config';
import { connectDatabase } from '@/config/database';
import { connectPrisma } from '@/config/prisma';
import { errorHandler } from '@/middleware/errorHandler';
import { notFound } from '@/middleware/notFound';
import { logger } from '@/utils/logger';

import authRoutes from '@/routes/authRoutes';
import userRoutes from '@/routes/userRoutes';
import expenseRoutes from '@/routes/expenseRoutes';
import incomeRoutes from '@/routes/incomeRoutes';
import budgetRoutes from '@/routes/budgetRoutes';
import goalRoutes from '@/routes/goalRoutes';
import categoryRoutes from '@/routes/categoryRoutes';
import notificationRoutes from '@/routes/notificationRoutes';
import analyticsRoutes from '@/routes/analyticsRoutes';
import uploadRoutes from '@/routes/uploadRoutes';

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true,
}));
app.use(limiter);
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to databases
connectDatabase(); // Mongoose connection (can be removed if using only Prisma)
connectPrisma();   // Prisma connection

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export default app;