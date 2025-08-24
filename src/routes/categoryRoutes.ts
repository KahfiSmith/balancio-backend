import { Router } from 'express';

const router = Router();

// TODO: Implement category routes
// GET /api/categories
// GET /api/categories/:id
// POST /api/categories
// PUT /api/categories/:id
// DELETE /api/categories/:id
// GET /api/categories/default

router.get('/health', (req, res) => {
  res.json({ message: 'Category routes working' });
});

export default router;