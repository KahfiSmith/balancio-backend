import { Router, type Router as ExpressRouter } from 'express';

const router: ExpressRouter = Router();

// TODO: Implement notification routes
// GET /api/notifications
// GET /api/notifications/:id
// PUT /api/notifications/:id/read
// PUT /api/notifications/read-all
// DELETE /api/notifications/:id
// GET /api/notifications/unread-count

router.get('/health', (req, res) => {
  res.json({ message: 'Notification routes working' });
});

export default router;
