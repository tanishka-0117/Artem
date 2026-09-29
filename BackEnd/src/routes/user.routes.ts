import { Router, type Response } from 'express';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { User } from '../models/index.js';

const router = Router();

// GET /api/users/me
router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      targetRole: user.targetRole,
      experienceLevel: user.experienceLevel,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    },
  });
});

// PATCH /api/users/me
router.patch('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const allowedFields = ['name', 'targetRole', 'experienceLevel', 'profileImage'];
    const updates: Record<string, any> = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'No valid fields to update' } });
      return;
    }

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true, runValidators: true });

    if (!user) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
      return;
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        targetRole: user.targetRole,
        experienceLevel: user.experienceLevel,
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update profile' } });
  }
});

export default router;
