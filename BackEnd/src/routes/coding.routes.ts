import { Router, type Request, type Response } from 'express';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { CodingProblem, Submission } from '../models/index.js';

const router = Router();

// GET /api/problems — List coding problems
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;

    const [problems, total] = await Promise.all([
      CodingProblem.find(filter).sort({ difficulty: 1, title: 1 }).skip(skip).limit(limit),
      CodingProblem.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: problems,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch problems' } });
  }
});

// GET /api/problems/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const problem = await CodingProblem.findById(req.params.id);

    if (!problem) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Problem not found' } });
      return;
    }

    res.json({ success: true, data: problem });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch problem' } });
  }
});

// POST /api/problems/submissions — Submit code
router.post('/submissions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { problemId, language, code } = req.body;

    if (!problemId || !language || !code) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Problem ID, language, and code are required' } });
      return;
    }

    // In production, code would be sent to a sandboxed execution service.
    // For now, create the submission as 'Pending'.
    const submission = await Submission.create({
      userId: req.userId,
      problemId,
      language,
      code,
      status: 'Pending',
    });

    res.status(201).json({
      success: true,
      data: submission,
      message: 'Code submitted for evaluation',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to submit code' } });
  }
});

// GET /api/problems/submissions/:id — Get submission result
router.get('/submissions/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const submission = await Submission.findOne({ _id: req.params.id, userId: req.userId });

    if (!submission) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Submission not found' } });
      return;
    }

    res.json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch submission' } });
  }
});

export default router;
