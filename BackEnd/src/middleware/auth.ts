import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { User, type IUser } from '../models/index.js';

export interface AuthRequest extends Request {
  user?: IUser;
  userId?: string;
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'User not found' } });
      return;
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
      return;
    }
    next();
  };
}
