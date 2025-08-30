import { Response } from 'express';
import { ApiResponse, AuthRequest } from '@/types';
import { prisma } from '@/config/prisma';

const monthKey = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`;
const yearKey = (d: Date) => `${d.getUTCFullYear()}`;

const getDefaultRange = (months = 6) => {
  const end = new Date();
  const start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
  start.setUTCMonth(start.getUTCMonth() - (months - 1));
  return { start, end };
};

export const spendingTrends = async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.user!.id;
  const months = (req.query.months ? Number(req.query.months) : undefined) || 6;
  const { start, end } = (req.query.startDate || req.query.endDate)
    ? { start: new Date(String(req.query.startDate)), end: new Date(String(req.query.endDate || new Date())) }
    : getDefaultRange(months);

  const [expenses, incomes] = await Promise.all([
    prisma.expense.findMany({ where: { userId, isActive: true, date: { gte: start, lte: end } }, select: { amount: true, date: true } }),
    prisma.income.findMany({ where: { userId, isActive: true, date: { gte: start, lte: end } }, select: { amount: true, date: true } }),
  ]);

  const buckets: Record<string, { expense: number; income: number }> = {};
  const fill = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
  while (fill <= last) {
    buckets[monthKey(fill)] = { expense: 0, income: 0 };
    fill.setUTCMonth(fill.getUTCMonth() + 1);
  }

  for (const e of expenses) {
    const k = monthKey(new Date(e.date));
    if (!buckets[k]) buckets[k] = { expense: 0, income: 0 };
    buckets[k].expense += e.amount;
  }
  for (const i of incomes) {
    const k = monthKey(new Date(i.date));
    if (!buckets[k]) buckets[k] = { expense: 0, income: 0 };
    buckets[k].income += i.amount;
  }

  const timeline = Object.keys(buckets)
    .sort()
    .map(k => {
      const b = buckets[k]!;
      return {
        month: k,
        expense: Number(b.expense.toFixed(2)),
        income: Number(b.income.toFixed(2)),
        net: Number((b.income - b.expense).toFixed(2)),
      };
    });
  res.json({ success: true, message: 'OK', data: { start, end, months: timeline.length, timeline } });
};

export const categoryBreakdown = async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.user!.id;
  const { start, end } = (req.query.startDate || req.query.endDate)
    ? { start: new Date(String(req.query.startDate)), end: new Date(String(req.query.endDate || new Date())) }
    : getDefaultRange(1);

  const expenses = await prisma.expense.findMany({ where: { userId, isActive: true, date: { gte: start, lte: end } }, select: { amount: true, categoryId: true } });
  const totals: Record<string, number> = {};
  for (const e of expenses) {
    totals[e.categoryId] = (totals[e.categoryId] || 0) + e.amount;
  }
  const categoryIds = Object.keys(totals);
  const categories = await prisma.category.findMany({ where: { id: { in: categoryIds } } });
  const totalAmount = Object.values(totals).reduce((a, b) => a + b, 0);
  const data = categoryIds.map(id => {
    const cat = categories.find(c => c.id === id);
    const amount = totals[id] ?? 0;
    const percent = totalAmount > 0 ? Number(((amount / totalAmount) * 100).toFixed(2)) : 0;
    return { categoryId: id, name: cat?.name || 'Unknown', type: cat?.type, amount: Number(amount.toFixed(2)), percent };
  }).sort((a,b) => b.amount - a.amount);
  res.json({ success: true, message: 'OK', data: { start, end, total: Number(totalAmount.toFixed(2)), breakdown: data } });
};

export const monthlySummary = async (req: AuthRequest, res: Response<ApiResponse>) => {
  const months = (req.query.months ? Number(req.query.months) : undefined) || 12;
  (req as any).query.months = String(months);
  await spendingTrends(req, res);
};

export const yearlySummary = async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.user!.id;
  const years = (req.query.years ? Number(req.query.years) : undefined) || 3;
  const end = new Date();
  const start = new Date(Date.UTC(end.getUTCFullYear() - (years - 1), 0, 1));

  const [expenses, incomes] = await Promise.all([
    prisma.expense.findMany({ where: { userId, isActive: true, date: { gte: start, lte: end } }, select: { amount: true, date: true } }),
    prisma.income.findMany({ where: { userId, isActive: true, date: { gte: start, lte: end } }, select: { amount: true, date: true } }),
  ]);

  const buckets: Record<string, { expense: number; income: number }> = {};
  for (let y = start.getUTCFullYear(); y <= end.getUTCFullYear(); y++) buckets[String(y)] = { expense: 0, income: 0 };
  for (const e of expenses) {
    const k = yearKey(new Date(e.date));
    const b = buckets[k]!;
    b.expense += e.amount;
  }
  for (const i of incomes) {
    const k = yearKey(new Date(i.date));
    const b = buckets[k]!;
    b.income += i.amount;
  }
  const series = Object.keys(buckets)
    .sort()
    .map(y => {
      const b = buckets[y]!;
      return {
        year: y,
        expense: Number(b.expense.toFixed(2)),
        income: Number(b.income.toFixed(2)),
        net: Number((b.income - b.expense).toFixed(2)),
      };
    });
  res.json({ success: true, message: 'OK', data: series });
};

export const financialHealth = async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.user!.id;
  const end = new Date();
  const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [expenses, incomes] = await Promise.all([
    prisma.expense.findMany({ where: { userId, isActive: true, date: { gte: start, lte: end } }, select: { amount: true, categoryId: true } }),
    prisma.income.findMany({ where: { userId, isActive: true, date: { gte: start, lte: end } }, select: { amount: true } }),
  ]);

  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const net = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Number(((net / totalIncome) * 100).toFixed(2)) : 0;
  const avgDailyExpense = Number((totalExpense / 30).toFixed(2));

  const byCat: Record<string, number> = {};
  for (const e of expenses) byCat[e.categoryId] = (byCat[e.categoryId] || 0) + e.amount;
  const topCatId = Object.keys(byCat).sort((a,b) => (byCat[b] ?? 0) - (byCat[a] ?? 0))[0];
  let topCategory: any = null;
  if (topCatId) {
    const cat = await prisma.category.findUnique({ where: { id: topCatId } });
    if (cat) topCategory = { id: cat.id, name: cat.name, amount: Number((byCat[topCatId] ?? 0).toFixed(2)) };
  }

  res.json({ success: true, message: 'OK', data: { periodDays: 30, income: Number(totalIncome.toFixed(2)), expense: Number(totalExpense.toFixed(2)), net: Number(net.toFixed(2)), savingsRate, avgDailyExpense, topCategory } });
};

export const budgetPerformance = async (req: AuthRequest, res: Response<ApiResponse>) => {
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
