import { Router } from 'express';
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProducts,
  updateProduct,
} from '../controllers/productController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/', getProducts);
router.get('/admin/all', authenticate, requireAdmin, getAllProducts);

router.post(
  '/',
  authenticate,
  requireAdmin,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('nameAr').notEmpty().withMessage('Arabic name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('descriptionAr').notEmpty().withMessage('Arabic description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('image')
      .custom((value) => {
        if (typeof value !== 'string' || !value.trim()) {
          throw new Error('Image is required');
        }
        if (value.startsWith('/images/')) {
          return true;
        }
        if (value.startsWith('data:image/')) {
          return true;
        }
        try {
          new URL(value);
          return true;
        } catch {
          throw new Error('Image must be a valid URL or /images/ path');
        }
      })
      .withMessage('Image must be a valid URL or /images/ path'),
    body('category').notEmpty().withMessage('Category is required'),
    body('categoryAr').notEmpty().withMessage('Arabic category is required'),
  ],
  validate,
  createProduct
);

router.put('/:id', authenticate, requireAdmin, updateProduct);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);

export default router;
