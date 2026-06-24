import { Response } from 'express';
import { stripe, isStripeConfigured } from '../config/stripe';
import { AuthRequest } from '../middleware/auth';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { CartItemInput, OrderItemSnapshot } from '../types';

async function buildOrderItems(items: CartItemInput[]): Promise<{ orderItems: OrderItemSnapshot[]; total: number }> {
  const orderItems: OrderItemSnapshot[] = [];
  let total = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product || !product.isAvailable) {
      throw new Error(`Product unavailable: ${item.productId}`);
    }

    const lineTotal = product.price * item.quantity;
    total += lineTotal;

    orderItems.push({
      productId: product._id.toString(),
      name: product.name,
      nameAr: product.nameAr,
      price: product.price,
      image: product.image,
      quantity: item.quantity,
    });
  }

  return { orderItems, total };
}

export async function createOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { items, paymentMethod, deliveryAddress, notes } = req.body as {
      items: CartItemInput[];
      paymentMethod: 'online' | 'cod';
      deliveryAddress: string;
      notes?: string;
    };

    const { orderItems, total } = await buildOrderItems(items);

    const order = await Order.create({
      user: req.user!.id,
      items: orderItems,
      totalAmount: total,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      deliveryAddress,
      notes,
      status: 'pending',
    });

    if (paymentMethod === 'online') {
      if (!isStripeConfigured()) {
        res.status(503).json({
          message:
            'Online payments are not configured. Add STRIPE_SECRET_KEY to backend/.env and restart the server. Get test keys at https://dashboard.stripe.com/test/apikeys',
        });
        return;
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100),
        currency: 'usd',
        metadata: { orderId: order._id.toString(), userId: req.user!.id },
        automatic_payment_methods: { enabled: true },
      });

      order.stripePaymentIntentId = paymentIntent.id;
      await order.save();

      res.status(201).json({
        order,
        clientSecret: paymentIntent.client_secret,
      });
      return;
    }

    res.status(201).json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create order';
    res.status(400).json({ message });
  }
}

export async function confirmPayment(req: AuthRequest, res: Response): Promise<void> {
  const order = await Order.findOne({ _id: req.params.id, user: req.user!.id });
  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }

  if (order.paymentMethod !== 'online' || !order.stripePaymentIntentId || !stripe) {
    res.status(400).json({ message: 'Invalid payment confirmation request' });
    return;
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);

  if (paymentIntent.status === 'succeeded') {
    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    await order.save();
    res.json({ order });
    return;
  }

  res.status(402).json({ message: 'Payment not completed', status: paymentIntent.status });
}

export async function getMyOrders(req: AuthRequest, res: Response): Promise<void> {
  const orders = await Order.find({ user: req.user!.id }).sort({ createdAt: -1 });
  res.json({ orders });
}

export async function getOrderById(req: AuthRequest, res: Response): Promise<void> {
  const filter =
    req.user!.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, user: req.user!.id };

  const order = await Order.findOne(filter);
  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }
  res.json({ order });
}

export async function getAllOrders(_req: AuthRequest, res: Response): Promise<void> {
  const orders = await Order.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
  res.json({ orders });
}

export async function updateOrderStatus(req: AuthRequest, res: Response): Promise<void> {
  const { status } = req.body as { status: string };
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }

  if (status === 'delivered' && order.paymentMethod === 'cod' && order.paymentStatus === 'pending') {
    order.paymentStatus = 'paid';
    await order.save();
  }

  res.json({ order });
}

export async function getDashboardStats(_req: AuthRequest, res: Response): Promise<void> {
  const [totalOrders, pendingOrders, totalProducts, revenueAgg] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'preparing', 'out_for_delivery'] } }),
    Product.countDocuments(),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
  ]);

  res.json({
    stats: {
      totalOrders,
      pendingOrders,
      totalProducts,
      totalRevenue: revenueAgg[0]?.total ?? 0,
    },
  });
}
