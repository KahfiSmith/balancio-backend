import { Response } from 'express';
import { ApiResponse, AuthRequest } from '@/types';
import { prisma } from '@/config/prisma';
import { PrismaService } from '@/services/prismaService';

export const list = async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.user!.id;
  const { page, limit } = PrismaService.getPaginationParams(req.query as any);
  const orderBy = PrismaService.getSortParams((req.query as any).sort || 'targetDate', (req.query as any).order as any);
  const where: any = { userId };
  const { status, category, search } = req.query as any;
  if (status) where.status = status;
  if (category) where.category = category;
  if (search) where.name = { contains: String(search), mode: 'insensitive' };

  const [items, total] = await Promise.all([
    prisma.goal.findMany({ where, include: { milestones: true, contributions: true }, orderBy, skip: (page - 1) * limit, take: limit }),
    prisma.goal.count({ where }),
  ]);

  res.json({ success: true, message: 'OK', data: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
};

export const getById = async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.user!.id;
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ success: false, message: 'Goal id is required' });
    return;
  }
  const goal = await prisma.goal.findFirst({ where: { id, userId }, include: { milestones: true, contributions: true } });
  if (!goal) {
    res.status(404).json({ success: false, message: 'Goal not found' });
    return;
  }
  res.json({ success: true, message: 'OK', data: goal });
};

export const create = async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.user!.id;
  const { milestones, contributions, ...rest } = req.body as any;
  const data: any = { ...rest, userId, isActive: true };
  if (milestones) data.milestones = { create: milestones };
  if (contributions) data.contributions = { create: contributions };
  const created = await prisma.goal.create({ data, include: { milestones: true, contributions: true } });
  res.status(201).json({ success: true, message: 'Goal created', data: created });
};

export const update = async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.user!.id;
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ success: false, message: 'Goal id is required' });
    return;
  }
  const exists = await prisma.goal.findFirst({ where: { id, userId } });
  if (!exists) {
    res.status(404).json({ success: false, message: 'Goal not found' });
    return;
  }
  // Note: This updates only base goal fields; milestones/contributions updates can be separate endpoints
  const { milestones, contributions, ...rest } = req.body as any;
  const updated = await prisma.goal.update({ where: { id }, data: rest, include: { milestones: true, contributions: true } });
  res.json({ success: true, message: 'Goal updated', data: updated });
};

export const remove = async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.user!.id;
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ success: false, message: 'Goal id is required' });
    return;
  }
  const exists = await prisma.goal.findFirst({ where: { id, userId } });
  if (!exists) {
    res.status(404).json({ success: false, message: 'Goal not found' });
    return;
  }
  await prisma.goal.delete({ where: { id } });
  res.json({ success: true, message: 'Goal deleted' });
};

export const contribute = async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.user!.id;
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ success: false, message: 'Goal id is required' });
    return;
  }
  const goal = await prisma.goal.findFirst({ where: { id, userId } });
  if (!goal) {
    res.status(404).json({ success: false, message: 'Goal not found' });
    return;
  }
  const { amount, date, note } = req.body as any;
  const data: any = { goalId: id, amount, note };
  if (date) data.date = new Date(date);
  const contribution = await prisma.goalContribution.create({ data });
  // Update currentAmount
  await prisma.goal.update({ where: { id }, data: { currentAmount: (goal.currentAmount ?? 0) + amount } });
  res.status(201).json({ success: true, message: 'Contribution added', data: contribution });
};

export const progress = async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.user!.id;
  const goals = await prisma.goal.findMany({ where: { userId } });
  const data = goals.map(g => {
    const remaining = Math.max(0, g.targetAmount - (g.currentAmount || 0));
    const percent = g.targetAmount > 0 ? Math.min(100, Math.round(((g.currentAmount || 0) / g.targetAmount) * 100)) : 0;
    const daysRemaining = Math.ceil((g.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return { id: g.id, name: g.name, status: g.status, targetAmount: g.targetAmount, currentAmount: g.currentAmount, remaining, percent, targetDate: g.targetDate, daysRemaining };
  });
  res.json({ success: true, message: 'OK', data });
};
