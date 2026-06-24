import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import {
  authHeader,
  clearTestDb,
  closeTestDb,
  createAdmin,
  createCustomer,
  createProduct,
  getTestApp,
  initTestDb,
} from '../helpers/testApp';

describe('Orders API (feature)', () => {
  beforeAll(async () => {
    await initTestDb();
  });

  afterEach(async () => {
    await clearTestDb();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  it('POST /api/orders creates a COD order for authenticated customer', async () => {
    const { token } = await createCustomer();
    const product = await createProduct({ name: 'Order Burger', price: 10 });

    const res = await request(getTestApp())
      .post('/api/orders')
      .set(authHeader(token))
      .send({
        items: [{ productId: product._id.toString(), quantity: 2 }],
        paymentMethod: 'cod',
        deliveryAddress: '123 Test Street',
        notes: 'Ring the bell',
      });

    expect(res.status).toBe(201);
    expect(res.body.order.status).toBe('pending');
    expect(res.body.order.paymentMethod).toBe('cod');
    expect(res.body.order.totalAmount).toBe(20);
    expect(res.body.order.items).toHaveLength(1);
  });

  it('POST /api/orders returns validation error without delivery address', async () => {
    const { token } = await createCustomer();
    const product = await createProduct();

    const res = await request(getTestApp())
      .post('/api/orders')
      .set(authHeader(token))
      .send({
        items: [{ productId: product._id.toString(), quantity: 1 }],
        paymentMethod: 'cod',
        deliveryAddress: '',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Delivery address is required');
  });

  it('POST /api/orders returns 503 for online payment when stripe is not configured', async () => {
    const { token } = await createCustomer();
    const product = await createProduct();

    const res = await request(getTestApp())
      .post('/api/orders')
      .set(authHeader(token))
      .send({
        items: [{ productId: product._id.toString(), quantity: 1 }],
        paymentMethod: 'online',
        deliveryAddress: '123 Test Street',
      });

    expect(res.status).toBe(503);
    expect(res.body.message).toContain('Online payments are not configured');
  });

  it('GET /api/orders/mine returns orders for the current user', async () => {
    const { token } = await createCustomer();
    const product = await createProduct();

    await request(getTestApp())
      .post('/api/orders')
      .set(authHeader(token))
      .send({
        items: [{ productId: product._id.toString(), quantity: 1 }],
        paymentMethod: 'cod',
        deliveryAddress: '123 Test Street',
      });

    const res = await request(getTestApp()).get('/api/orders/mine').set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(1);
  });

  it('PATCH /api/orders/:id/status allows admin to update order status', async () => {
    const { token: customerToken } = await createCustomer();
    const { token: adminToken } = await createAdmin();
    const product = await createProduct();

    const created = await request(getTestApp())
      .post('/api/orders')
      .set(authHeader(customerToken))
      .send({
        items: [{ productId: product._id.toString(), quantity: 1 }],
        paymentMethod: 'cod',
        deliveryAddress: '123 Test Street',
      });

    const orderId = created.body.order._id;

    const res = await request(getTestApp())
      .patch(`/api/orders/${orderId}/status`)
      .set(authHeader(adminToken))
      .send({ status: 'confirmed' });

    expect(res.status).toBe(200);
    expect(res.body.order.status).toBe('confirmed');
  });

  it('GET /api/orders/admin/stats returns dashboard metrics for admin', async () => {
    const { token: customerToken } = await createCustomer();
    const { token: adminToken } = await createAdmin();
    const product = await createProduct();

    await request(getTestApp())
      .post('/api/orders')
      .set(authHeader(customerToken))
      .send({
        items: [{ productId: product._id.toString(), quantity: 1 }],
        paymentMethod: 'cod',
        deliveryAddress: '123 Test Street',
      });

    const res = await request(getTestApp()).get('/api/orders/admin/stats').set(authHeader(adminToken));

    expect(res.status).toBe(200);
    expect(res.body.stats.totalOrders).toBe(1);
    expect(res.body.stats.totalProducts).toBe(1);
  });
});
