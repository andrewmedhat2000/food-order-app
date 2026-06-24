import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Product } from '../models/Product';

export async function getProducts(_req: AuthRequest, res: Response): Promise<void> {
  const products = await Product.find({ isAvailable: true }).sort({ category: 1, name: 1 });
  res.json({ products });
}

export async function getAllProducts(_req: AuthRequest, res: Response): Promise<void> {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json({ products });
}

export async function createProduct(req: AuthRequest, res: Response): Promise<void> {
  const product = await Product.create(req.body);
  res.status(201).json({ product });
}

export async function updateProduct(req: AuthRequest, res: Response): Promise<void> {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }

  res.json({ product });
}

export async function deleteProduct(req: AuthRequest, res: Response): Promise<void> {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }
  res.json({ message: 'Product deleted' });
}
