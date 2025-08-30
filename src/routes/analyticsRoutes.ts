import { Router, type Router as ExpressRouter } from 'express';
import { authenticate } from '@/middleware/auth';
import * as Analytics from '@/controllers/analyticsController';
import { validate } from '@/middleware/validate';
import { monthlySummarySchema, rangeSchema, trendsSchema, yearlySummarySchema } from '@/validators/analyticsSchemas';

const router: ExpressRouter = Router();

router.get('/spending-trends', authenticate, validate(trendsSchema, 'query'), Analytics.spendingTrends);
router.get('/category-breakdown', authenticate, validate(rangeSchema, 'query'), Analytics.categoryBreakdown);
router.get('/monthly-summary', authenticate, validate(monthlySummarySchema, 'query'), Analytics.monthlySummary);
router.get('/yearly-summary', authenticate, validate(yearlySummarySchema, 'query'), Analytics.yearlySummary);
router.get('/financial-health', authenticate, Analytics.financialHealth);
router.get('/budget-performance', authenticate, Analytics.budgetPerformance);

router.get('/health', (_req, res) => {
  res.json({ message: 'Analytics routes working' });
});

export default router;
