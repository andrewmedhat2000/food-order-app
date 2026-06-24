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

describe('Products API (feature)', () => {
  beforeAll(async () => {
    await initTestDb();
  });

  afterEach(async () => {
    await clearTestDb();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  it('GET /api/products returns available products publicly', async () => {
    await createProduct({ name: 'Public Burger' });
    await createProduct({ name: 'Hidden Item', isAvailable: false });

    const res = await request(getTestApp()).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);
    expect(res.body.products[0].name).toBe('Public Burger');
  });

  it('POST /api/products requires admin role', async () => {
    const { token } = await createCustomer();

    const res = await request(getTestApp())
      .post('/api/products')
      .set(authHeader(token))
      .send({
        name: 'New Item',
        nameAr: 'جديد',
        description: 'Desc',
        descriptionAr: 'وصف',
        price: 5,
        image: 'https://example.com/item.jpg',
        category: 'Snacks',
        categoryAr: 'وجبات',
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Admin access required');
  });

  it('POST /api/products allows admin to create a product', async () => {
    const { token } = await createAdmin();

    const res = await request(getTestApp())
      .post('/api/products')
      .set(authHeader(token))
      .send({
        name: 'Admin Pizza',
        nameAr: 'بيتzza',
        description: 'Cheesy pizza',
        descriptionAr: 'وصف',
        price: 12.5,
        image: 'https://example.com/pizza.jpg',
        category: 'Pizza',
        categoryAr: 'بيتzza',
      });

    expect(res.status).toBe(201);
    expect(res.body.product.name).toBe('Admin Pizza');
  });

  it('PUT /api/products/:id allows admin to update a product', async () => {
    const { token } = await createAdmin();
    const product = await createProduct({ name: 'Old Name', price: 8 });

    const res = await request(getTestApp())
      .put(`/api/products/${product._id}`)
      .set(authHeader(token))
      .send({ name: 'Updated Name', price: 10 });

    expect(res.status).toBe(200);
    expect(res.body.product.name).toBe('Updated Name');
    expect(res.body.product.price).toBe(10);
  });

  it('DELETE /api/products/:id allows admin to delete a product', async () => {
    const { token } = await createAdmin();
    const product = await createProduct();

    const res = await request(getTestApp())
      .delete(`/api/products/${product._id}`)
      .set(authHeader(token));

    expect(res.status).toBe(200);

    const list = await request(getTestApp()).get('/api/products/admin/all').set(authHeader(token));
    expect(list.body.products).toHaveLength(0);
  });
});
