import { Router, type Router as ExpressRouter } from 'express';
import multer from 'multer';
import { authenticate } from '@/middleware/auth';
import { cfDeleteImage, cfUploadImage } from '@/utils/cloudflareImages';
import { ApiResponse, AuthRequest } from '@/types';

const router: ExpressRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

router.post('/receipt', authenticate, upload.single('file'), async (req: AuthRequest, res) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file uploaded' });
    return;
  }
  try {
    const result = await cfUploadImage({ buffer: req.file.buffer, filename: req.file.originalname, mime: req.file.mimetype, metadata: { userId: req.user!.id, type: 'receipt' } });
    res.status(201).json({ success: true, message: 'Uploaded', data: result } as ApiResponse);
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message || 'Upload failed' });
  }
});

router.post('/avatar', authenticate, upload.single('file'), async (req: AuthRequest, res) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file uploaded' });
    return;
  }
  try {
    const result = await cfUploadImage({ buffer: req.file.buffer, filename: req.file.originalname, mime: req.file.mimetype, metadata: { userId: req.user!.id, type: 'avatar' } });
    res.status(201).json({ success: true, message: 'Uploaded', data: result } as ApiResponse);
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message || 'Upload failed' });
  }
});

router.delete('/file/:id', authenticate, async (req, res) => {
  const { id } = req.params as { id?: string };
  if (!id) {
    res.status(400).json({ success: false, message: 'File id is required' });
    return;
  }
  const ok = await cfDeleteImage(id);
  if (!ok) {
    res.status(404).json({ success: false, message: 'Delete failed or not found' });
    return;
  }
  res.json({ success: true, message: 'Deleted' } as ApiResponse);
});

router.get('/health', (_req, res) => {
  res.json({ message: 'Upload routes working' });
});

export default router;
