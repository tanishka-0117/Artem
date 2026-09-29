import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import config from '../config/index.js';
import { User } from '../models/index.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, targetRole, experienceLevel } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Name, email and password are required' } });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ success: false, error: { code: 'DUPLICATE_EMAIL', message: 'An account with this email already exists' } });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name, email: email.toLowerCase(), passwordHash, targetRole, experienceLevel,
    });

    const token = jwt.sign({ userId: user._id }, config.jwtSecret, { expiresIn: config.jwtExpiry } as SignOptions);

    res.cookie('token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      data: { user: { _id: user._id, name: user.name, email: user.email, role: user.role, targetRole: user.targetRole, experienceLevel: user.experienceLevel } },
      message: 'Account created successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Registration failed' } });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' } });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
      return;
    }

    const token = jwt.sign({ userId: user._id }, config.jwtSecret, { expiresIn: config.jwtExpiry } as SignOptions);

    res.cookie('token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: { user: { _id: user._id, name: user.name, email: user.email, role: user.role, targetRole: user.targetRole, experienceLevel: user.experienceLevel } },
      message: 'Login successful',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Login failed' } });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, (req: AuthRequest, res: Response) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// GET /api/auth/me
router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  res.json({
    success: true,
    data: { _id: user._id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage, targetRole: user.targetRole, experienceLevel: user.experienceLevel },
  });
});

export default router;
