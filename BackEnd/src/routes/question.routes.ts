import { Router, type Request, type Response } from 'express';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { Question } from '../models/index.js';

const router = Router();

// GET /api/questions — List questions with filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.topic) filter.topic = req.query.topic;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;
    if (req.query.company) filter.company = req.query.company;
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [(req.query.search as string).toLowerCase()] } },
      ];
    }

    const [questions, total] = await Promise.all([
      Question.find(filter).sort({ category: 1, difficulty: 1 }).skip(skip).limit(limit),
      Question.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: questions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch questions' } });
  }
});

// GET /api/questions/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Question not found' } });
      return;
    }

    res.json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch question' } });
  }
});

// POST /api/questions/:id/bookmark — Toggle bookmark (stored client-side for now)
router.post('/:id/bookmark', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // In a full implementation, bookmarks would be stored in a UserBookmarks collection.
    // For now, return success to let the frontend handle state locally.
    res.json({ success: true, message: 'Bookmark toggled' });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to toggle bookmark' } });
  }
});

export default router;
