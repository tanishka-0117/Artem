import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { Progress, Interview, Submission } from '../src/models/index.js';

vi.mock('../src/middleware/auth.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/middleware/auth.js')>();
  return {
    ...actual,
    authenticate: vi.fn((req, res, next) => {
      // Mock an authenticated user
      req.userId = '605c72efb3112a00155b4431';
      req.user = { _id: req.userId, role: 'candidate' };
      next();
    }),
  };
});

describe('Progress Routes', () => {
  beforeEach(async () => {
    await Progress.deleteMany({});
    await Interview.deleteMany({});
    await Submission.deleteMany({});
    vi.clearAllMocks();
  });

  it('GET /api/progress/analytics - should return aggregated stats', async () => {
    const userId = new mongoose.Types.ObjectId('605c72efb3112a00155b4431');

    await Progress.create({
      userId,
      topic: 'React',
      questionsAttempted: 10,
      questionsCorrect: 8,
      averageScore: 80,
    });

    await Interview.create({
      userId,
      type: 'Technical',
      difficulty: 'Intermediate',
      targetRole: 'Dev',
      status: 'completed',
      score: 90,
    });

    // Valid problemId objectid is required for submission
    const problemId = new mongoose.Types.ObjectId();
    await Submission.create({
      userId,
      problemId,
      language: 'JavaScript',
      code: 'console.log("hello")',
      status: 'Accepted',
    });

    const res = await request(app).get('/api/progress/analytics');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.questionsAttempted).toBe(10);
    expect(res.body.data.interviewsCompleted).toBe(1);
    expect(res.body.data.averageInterviewScore).toBe(90);
    expect(res.body.data.codingProblemsSolved).toBe(1);
  });
});
