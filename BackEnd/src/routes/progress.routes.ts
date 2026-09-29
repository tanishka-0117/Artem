import { Router, type Response } from 'express';
import mongoose from 'mongoose';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { Progress, Interview, Submission } from '../models/index.js';

const router = Router();

// GET /api/progress — Get user's progress summary
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const progress = await Progress.find({ userId: req.userId }).sort({ topic: 1 });

    const totalAttempted = progress.reduce((sum, p) => sum + p.questionsAttempted, 0);
    const totalCorrect = progress.reduce((sum, p) => sum + p.questionsCorrect, 0);
    const overallScore = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

    res.json({
      success: true,
      data: {
        overall: {
          questionsAttempted: totalAttempted,
          questionsCorrect: totalCorrect,
          score: overallScore,
        },
        byTopic: progress,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch progress' } });
  }
});

// GET /api/progress/analytics — Get detailed analytics
router.get('/analytics', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);

    const [progress, interviewStats, submissionStats] = await Promise.all([
      Progress.find({ userId: req.userId }),
      Interview.aggregate([
        { $match: { userId, status: 'completed' } },
        { 
          $group: { 
            _id: null, 
            count: { $sum: 1 },
            avgScore: { $avg: "$score" }
          }
        }
      ]),
      Submission.aggregate([
        { $match: { userId, status: 'Accepted' } },
        { $count: "solved" }
      ])
    ]);

    const recentInterviews = await Interview.find({ userId: req.userId, status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('type score createdAt');

    const interviewCount = interviewStats[0]?.count || 0;
    const codingSolved = submissionStats[0]?.solved || 0;
    const totalAttempted = progress.reduce((sum, p) => sum + p.questionsAttempted, 0);
    const avgInterviewScore = Math.round(interviewStats[0]?.avgScore || 0);

    res.json({
      success: true,
      data: {
        questionsAttempted: totalAttempted,
        interviewsCompleted: interviewCount,
        codingProblemsSolved: codingSolved,
        averageInterviewScore: avgInterviewScore,
        topicPerformance: progress.map((p) => ({
          topic: p.topic,
          score: p.averageScore,
          attempted: p.questionsAttempted,
          correct: p.questionsCorrect,
        })),
        recentInterviews: recentInterviews.map((i) => ({
          _id: i._id,
          type: i.type,
          score: i.score,
          createdAt: i.createdAt,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch analytics' } });
  }
});

export default router;
