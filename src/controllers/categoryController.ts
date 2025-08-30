import { Request, Response } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/config/prisma';
import { ApiResponse, AuthRequest } from '@/types';

export const listAll = async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.user!.id;
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
      OR: [
        { userId: null },
        { userId },
      ],
    },
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
  });
  res.json({ success: true, message: 'OK', data: categories });
};

export const listDefault = async (_req: AuthRequest, res: Response<ApiResponse>) => {
  const categories = await prisma.category.findMany({
    where: { isActive: true, userId: null },
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
  });
  res.json({ success: true, message: 'OK', data: categories });
};

export const getById = async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.user!.id;
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ success: false, message: 'Category id is required' });
    return;
  }
  const category = await prisma.category.findFirst({
    where: {
      id,
      isActive: true,
      OR: [ { userId: null }, { userId } ],
    },
  });
  if (!category) {
    res.status(404).json({ success: false, message: 'Category not found' });
    return;
  }
  res.json({ success: true, message: 'OK', data: category });
};

export const create = async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.user!.id;
  const { name, description, icon, color, type } = req.body as {
    name: string; description?: string; icon: string; color: string; type: 'expense'|'income'
  };
  try {
    const created = await prisma.category.create({
      data: { name, description: description ?? null, icon, color, type, isDefault: false, userId },
    });
    res.status(201).json({ success: true, message: 'Category created', data: created });
  } catch (e: any) {
    if (e.code === 'P2002') {
      res.status(400).json({ success: false, message: 'Category with same name and type already exists' });
      return;
    }
    throw e;
  }
};

export const update = async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.user!.id;
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ success: false, message: 'Category id is required' });
    return;
  }
  // Only allow updating user's own non-default categories
  const exists = await prisma.category.findFirst({ where: { id, userId, isDefault: false } });
  if (!exists) {
    res.status(404).json({ success: false, message: 'Category not found or not editable' });
    return;
  }
  const updated = await prisma.category.update({
    // Cast to satisfy strict CategoryWhereUniqueInput with exactOptionalPropertyTypes
    where: ({ id } as unknown) as Prisma.CategoryWhereUniqueInput,
    data: req.body,
  });
  res.json({ success: true, message: 'Category updated', data: updated });
};

export const remove = async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.user!.id;
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ success: false, message: 'Category id is required' });
    return;
  }
  const exists = await prisma.category.findFirst({ where: { id, userId, isDefault: false } });
  if (!exists) {
    res.status(404).json({ success: false, message: 'Category not found or not deletable' });
    return;
  }
  await prisma.category.delete({ where: ({ id } as unknown) as Prisma.CategoryWhereUniqueInput });
  res.json({ success: true, message: 'Category deleted' });
};
