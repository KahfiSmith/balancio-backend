import { Response } from 'express';
import { ApiResponse, AuthRequest } from '@/types';
import { prisma } from '@/config/prisma';
import { PrismaService } from '@/services/prismaService';

export const list = async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.user!.id;
  const { page, limit } = PrismaService.getPaginationParams(req.query as any);
  const orderBy = PrismaService.getSortParams((req.query as any).sort || 'startDate', (req.query as any).order as any);
  const where: any = { userId };

  const { period, active } = req.query as any;
  if (period) where.period = period;
  if (typeof active !== 'undefined') where.isActive = active === 'true' || active === true;

  const [items, total] = await Promise.all([
    prisma.budget.findMany({
      where,
      include: { notifications: true, category: true },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.budget.count({ where }),
  ]);

  res.json({ success: true, message: 'OK', data: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
};

export const getById = async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.user!.id;
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ success: false, message: 'Budget id is required' });
    return;
  }
  const budget = await prisma.budget.findFirst({ where: { id, userId }, include: { notifications: true, category: true } });
  if (!budget) {
    res.status(404).json({ success: false, message: 'Budget not found' });
    return;
  }
  res.json({ success: true, message: 'OK', data: budget });
};

export const create = async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.user!.id;
  const { notifications, ...rest } = req.body as any;
  const data: any = { ...rest, userId, isActive: true };
  if (notifications) data.notifications = { create: notifications };
  const created = await prisma.budget.create({ data, include: { notifications: true, category: true } });
  res.status(201).json({ success: true, message: 'Budget created', data: created });
};

export const update = async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.user!.id;
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ success: false, message: 'Budget id is required' });
    return;
  }
  const exists = await prisma.budget.findFirst({ where: { id, userId } });
  if (!exists) {
    res.status(404).json({ success: false, message: 'Budget not found' });
    return;
  }
  const { notifications, ...rest } = req.body as any;
  const data: any = { ...rest };
  if (notifications) {
    data.notifications = {
      upsert: {
        create: notifications,
        update: notifications,
      },
    };
  }
  const updated = await prisma.budget.update({ where: { id }, data, include: { notifications: true, category: true } });
  res.json({ success: true, message: 'Budget updated', data: updated });
};

export const remove = async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.user!.id;
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ success: false, message: 'Budget id is required' });
    return;
  }
  const exists = await prisma.budget.findFirst({ where: { id, userId } });
  if (!exists) {
    res.status(404).json({ success: false, message: 'Budget not found' });
    return;
  }
  await prisma.budget.delete({ where: { id } });
  res.json({ success: true, message: 'Budget deleted' });
};

export const performance = async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.user!.id;
  const budgets = await prisma.budget.findMany({ where: { userId }, include: { category: true } });
  const result = await Promise.all(budgets.map(async b => {
    const where: any = { userId, date: { gte: b.startDate, lte: b.endDate }, isActive: true };
    if (b.categoryId) where.categoryId = b.categoryId;
    const agg = await prisma.expense.aggregate({ _sum: { amount: true }, where });
    const spent = agg._sum.amount || 0;
    const percent = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
    return { id: b.id, name: b.name, period: b.period, amount: b.amount, spent, percent, startDate: b.startDate, endDate: b.endDate, category: b.category };
  }));
  res.json({ success: true, message: 'OK', data: result });
};
