import { Router } from 'express';

const router = Router();

// TODO: Implement upload routes
// POST /api/upload/receipt
// POST /api/upload/avatar
// DELETE /api/upload/file/:id

router.get('/health', (req, res) => {
  res.json({ message: 'Upload routes working' });
});

export default router;