import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import {
  authHeader,
  clearTestDb,
  closeTestDb,
  createAdmin,
  createCustomer,
  getTestApp,
  initTestDb,
} from '../helpers/testApp';

describe('Auth API (feature)', () => {
  beforeAll(async () => {
    await initTestDb();
  });

  afterEach(async () => {
    await clearTestDb();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  it('GET /api/health returns ok', async () => {
    const res = await request(getTestApp()).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('POST /api/auth/register creates a customer', async () => {
    const res = await request(getTestApp()).post('/api/auth/register').send({
      name: 'John Doe',
      email: 'john@test.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe('john@test.com');
    expect(res.body.user.role).toBe('customer');
  });

  it('POST /api/auth/register returns validation errors for invalid input', async () => {
    const res = await request(getTestApp()).post('/api/auth/register').send({
      name: '',
      email: 'not-an-email',
      password: '123',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Valid email is required');
  });

  it('POST /api/auth/register returns 409 for duplicate email', async () => {
    await request(getTestApp()).post('/api/auth/register').send({
      name: 'John Doe',
      email: 'john@test.com',
      password: 'password123',
    });

    const res = await request(getTestApp()).post('/api/auth/register').send({
      name: 'Jane Doe',
      email: 'john@test.com',
      password: 'password456',
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Email already registered');
  });

  it('POST /api/auth/login authenticates a valid user', async () => {
    await request(getTestApp()).post('/api/auth/register').send({
      name: 'John Doe',
      email: 'john@test.com',
      password: 'password123',
    });

    const res = await request(getTestApp()).post('/api/auth/login').send({
      email: 'john@test.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe('john@test.com');
  });

  it('POST /api/auth/login rejects invalid credentials', async () => {
    await createCustomer({ email: 'john@test.com', password: 'password123' });

    const res = await request(getTestApp()).post('/api/auth/login').send({
      email: 'john@test.com',
      password: 'wrong-password',
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('GET /api/auth/me returns profile for authenticated user', async () => {
    const { token } = await createCustomer({ name: 'Profile User', email: 'profile@test.com' });

    const res = await request(getTestApp()).get('/api/auth/me').set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Profile User');
    expect(res.body.user.email).toBe('profile@test.com');
  });

  it('GET /api/auth/me returns 401 without token', async () => {
    const res = await request(getTestApp()).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('admin user can authenticate', async () => {
    const { token } = await createAdmin();

    const res = await request(getTestApp()).get('/api/auth/me').set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('admin');
  });
});
