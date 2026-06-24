import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { comparePassword, hashPassword } from '../utils/password';
import { signToken } from '../utils/jwt';

function sanitizeUser(user: InstanceType<typeof User>) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function register(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body as { name: string; email: string; password: string };

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ message: 'Email already registered' });
      return;
    }

    const user = await User.create({
      name,
      email,
      password: await hashPassword(password),
      role: 'customer',
    });

    const token = signToken({ userId: user._id.toString(), role: user.role });
    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed. Check MongoDB connection.' });
  }
}

export async function login(req: AuthRequest, res: Response): Promise<void> {
  const { email, password } = req.body as { email: string; password: string };

  const user = await User.findOne({ email });
  if (!user || !(await comparePassword(password, user.password))) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  const token = signToken({ userId: user._id.toString(), role: user.role });
  res.json({ token, user: sanitizeUser(user) });
}

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  const user = await User.findById(req.user!.id).select('-password');
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  res.json({ user: sanitizeUser(user) });
}
