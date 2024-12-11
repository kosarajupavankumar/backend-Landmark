import { Router } from 'express';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
} from '../controllers/catergoryController';

const router = Router();

router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);
router.get('/tree', getCategoryTree);

export default router;
