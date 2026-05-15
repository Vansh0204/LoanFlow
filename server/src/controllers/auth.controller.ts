import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth.middleware';

const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
  });
};

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Hash password with salt rounds: 12
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user (only borrower allowed to sign up)
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'borrower',
    });

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user.id, user.role);

    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // req.user is attached by the auth middleware
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
