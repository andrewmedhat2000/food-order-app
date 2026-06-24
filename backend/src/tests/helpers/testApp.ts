import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import type { Express } from 'express';
import { createApp } from '../../app';
import { User } from '../../models/User';
import { Product } from '../../models/Product';
import { hashPassword } from '../../utils/password';
import { signToken } from '../../utils/jwt';

let mongoServer: MongoMemoryServer | null = null;
let appInstance: Express | null = null;

export async function initTestDb(): Promise<void> {
  if (mongoServer) return;

  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  await mongoose.connect(process.env.MONGODB_URI);
  appInstance = createApp();
}

export async function closeTestDb(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
  appInstance = null;
}

export async function clearTestDb(): Promise<void> {
  const collections = mongoose.connection.collections;
  for (const collection of Object.values(collections)) {
    await collection.deleteMany({});
  }
}

export function getTestApp(): Express {
  if (!appInstance) {
    throw new Error('Test app not initialized. Call initTestDb() in beforeAll.');
  }
  return appInstance;
}

export async function createCustomer(overrides: Partial<{ name: string; email: string; password: string }> = {}) {
  const user = await User.create({
    name: overrides.name ?? 'Test Customer',
    email: overrides.email ?? 'customer@test.com',
    password: await hashPassword(overrides.password ?? 'password123'),
    role: 'customer',
  });

  const token = signToken({ userId: user._id.toString(), role: user.role });
  return { user, token };
}

export async function createAdmin(overrides: Partial<{ name: string; email: string; password: string }> = {}) {
  const user = await User.create({
    name: overrides.name ?? 'Test Admin',
    email: overrides.email ?? 'admin@test.com',
    password: await hashPassword(overrides.password ?? 'admin123'),
    role: 'admin',
  });

  const token = signToken({ userId: user._id.toString(), role: user.role });
  return { user, token };
}

export async function createProduct(
  overrides: Partial<{ name: string; price: number; isAvailable: boolean }> = {}
) {
  return Product.create({
    name: overrides.name ?? 'Test Burger',
    nameAr: 'برجر تجريبي',
    description: 'Test description',
    descriptionAr: 'وصف تجريبي',
    price: overrides.price ?? 9.99,
    image: 'https://example.com/burger.jpg',
    category: 'Burgers',
    categoryAr: 'برجر',
    isAvailable: overrides.isAvailable ?? true,
  });
}

export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}
