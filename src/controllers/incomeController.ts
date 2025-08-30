import { Response } from 'express';
import { ApiResponse, AuthRequest } from '@/types';
import { prisma } from '@/config/prisma';
import { PrismaService } from '@/services/prismaService';

export const list = async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.user!.id;
  const { page, limit } = PrismaService.getPaginationParams(req.query as any);
  const orderBy = PrismaService.getSortParams((req.query as any).sort || 'date', (req.query as any).order as any);

  const where: any = { userId, isActive: true };

  const { categoryId, startDate, endDate, minAmount, maxAmount, search } = req.query as any;
  if (categoryId) where.categoryId = categoryId;
  if (minAmount || maxAmount) {
    where.amount = {};
    if (minAmount) where.amount.gte = Number(minAmount);
    if (maxAmount) where.amount.lte = Number(maxAmount);
  }
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }
  if (search) {
    where.OR = [
      { title: { contains: String(search), mode: 'insensitive' } },
      { description: { contains: String(search), mode: 'insensitive' } },
      { tags: { has: String(search).toLowerCase() } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.income.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
    prisma.income.count({ where }),
  ]);

  res.json({
    success: true,
    message: 'OK',
    data: items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
};

export const getById = async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.user!.id;
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ success: false, message: 'Income id is required' });
    return;
  }
  const item = await prisma.income.findFirst({ where: { id, userId, isActive: true } });
  if (!item) {
    res.status(404).json({ success: false, message: 'Income not found' });
    return;
  }
  res.json({ success: true, message: 'OK', data: item });
};

export const create = async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.user!.id;
  const { isRecurring, recurrence, ...rest } = req.body as any;
  const data: any = { ...rest, userId, isActive: true, isRecurring: Boolean(isRecurring) };
  if (data.date) data.date = new Date(data.date);
  if (isRecurring && recurrence) data.recurrence = { create: recurrence };

  const created = await prisma.income.create({ data });
  res.status(201).json({ success: true, message: 'Income created', data: created });
};

export const update = async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.user!.id;
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ success: false, message: 'Income id is required' });
    return;
  }
  const exists = await prisma.income.findFirst({ where: { id, userId, isActive: true } });
  if (!exists) {
    res.status(404).json({ success: false, message: 'Income not found' });
    return;
  }
  const { isRecurring, recurrence, ...rest } = req.body as any;
  const data: any = { ...rest };
  if (data.date) data.date = new Date(data.date);
  if (typeof isRecurring === 'boolean') data.isRecurring = isRecurring;
  if (recurrence) {
    data.recurrence = {
      upsert: {
        create: recurrence,
        update: recurrence,
      },
    };
  }
  const updated = await prisma.income.update({ where: { id }, data });
  res.json({ success: true, message: 'Income updated', data: updated });
};

export const remove = async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.user!.id;
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ success: false, message: 'Income id is required' });
    return;
  }
  const exists = await prisma.income.findFirst({ where: { id, userId, isActive: true } });
  if (!exists) {
    res.status(404).json({ success: false, message: 'Income not found' });
    return;
  }
  await prisma.income.delete({ where: { id } });
  res.json({ success: true, message: 'Income deleted' });
};
