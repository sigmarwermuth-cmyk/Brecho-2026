import { Router } from 'express';
import { ProfileController } from '../controllers/profileController';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.post('/sync', requireAuth, ProfileController.sync);
router.get('/me', requireAuth, ProfileController.me);

export default router;
