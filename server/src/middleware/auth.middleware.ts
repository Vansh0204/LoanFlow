import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  console.log(`[Auth] ${req.method} ${req.url}`);
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
