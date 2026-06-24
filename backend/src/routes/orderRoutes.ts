import { Router } from 'express';
import { body } from 'express-validator';
import {
  confirmPayment,
  createOrder,
  getAllOrders,
  getDashboardStats,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orderController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  [
    body('items').isArray({ min: 1 }).withMessage('Order must include at least one item'),
    body('items.*.productId').notEmpty().withMessage('Each item must have a product'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('paymentMethod').isIn(['online', 'cod']).withMessage('Payment method must be online or cod'),
    body('deliveryAddress').trim().notEmpty().withMessage('Delivery address is required'),
  ],
  validate,
  createOrder
);

router.get('/mine', getMyOrders);
router.get('/admin/all', requireAdmin, getAllOrders);
router.get('/admin/stats', requireAdmin, getDashboardStats);
router.get('/:id', getOrderById);
router.post('/:id/confirm-payment', confirmPayment);
router.patch('/:id/status', requireAdmin, updateOrderStatus);

export default router;
