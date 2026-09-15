import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.get('/', ProductController.list);
router.get('/:id', ProductController.getOne);
router.post('/', requireAuth, ProductController.create);

export default router;
