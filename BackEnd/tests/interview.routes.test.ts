import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { Interview } from '../src/models/index.js';

vi.mock('../src/middleware/auth.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/middleware/auth.js')>();
  return {
    ...actual,
    authenticate: vi.fn((req, res, next) => {
      req.userId = '605c72efb3112a00155b4431';
      req.user = { _id: req.userId, role: 'candidate' };
      next();
    }),
  };
});

// Mock the AI service so tests don't hit real APIs
vi.mock('../src/services/ai.js', () => ({
  default: {
    generateInterviewQuestions: vi.fn().mockResolvedValue([
      { question: 'What is React?', topic: 'React', expectedPoints: ['Component-based', 'Virtual DOM'] },
      { question: 'Explain REST APIs.', topic: 'APIs', expectedPoints: ['HTTP methods', 'Stateless'] },
      { question: 'What is TypeScript?', topic: 'TypeScript', expectedPoints: ['Type safety', 'Superset of JS'] },
    ]),
    evaluateAnswer: vi.fn().mockResolvedValue({
      overallScore: 78,
      dimensions: { correctness: 82, communication: 75, technicalDepth: 78, completeness: 72 },
      strengths: ['Good understanding'],
      weaknesses: ['Could elaborate more'],
      improvedAnswer: 'A more detailed answer...',
    }),
    generateInterviewReport: vi.fn().mockResolvedValue({
      overallScore: 76,
      dimensions: { Technical: 78, Communication: 72, 'Problem Solving': 80, Confidence: 68, Completeness: 74 },
      strengths: ['Strong React knowledge'],
      weaknesses: ['System design needs work'],
      recommendations: ['Practice system design problems'],
      performanceLevel: 'Good',
    }),
  },
}));

describe('Interview Routes', () => {
  beforeEach(async () => {
    await Interview.deleteMany({});
    vi.clearAllMocks();
  });

  it('POST /api/interviews - should create a new interview with AI-generated questions', async () => {
    const res = await request(app)
      .post('/api/interviews')
      .send({
        type: 'Technical',
        difficulty: 'Intermediate',
        targetRole: 'Full Stack Developer',
        duration: 30,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.type).toBe('Technical');
    expect(res.body.data.status).toBe('active');
    // Verify AI-generated questions are stored
    expect(res.body.data.questions).toHaveLength(3);
    expect(res.body.data.questions[0].question).toBe('What is React?');
    expect(res.body.data.questions[0].expectedPoints).toBeDefined();
  });

  it('POST /api/interviews - should return 400 if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/interviews')
      .send({ type: 'Technical' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/interviews/:id/answer - should evaluate answer via AI', async () => {
    // Create an interview first
    const interview = await Interview.create({
      userId: '605c72efb3112a00155b4431',
      type: 'Technical',
      difficulty: 'Intermediate',
      targetRole: 'Dev',
      status: 'active',
      questions: [
        { question: 'What is React?', topic: 'React', expectedPoints: ['Component-based', 'Virtual DOM'] },
      ],
      answers: [],
    });

    const res = await request(app)
      .post(`/api/interviews/${interview._id}/answer`)
      .send({ questionIndex: 0, answer: 'React is a JavaScript library for building user interfaces.' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.evaluation.overallScore).toBe(78);
    expect(res.body.data.evaluation.dimensions.correctness).toBe(82);
    expect(res.body.data.evaluation.strengths).toContain('Good understanding');
  });

  it('POST /api/interviews/:id/finish - should generate AI report', async () => {
    const interview = await Interview.create({
      userId: '605c72efb3112a00155b4431',
      type: 'Technical',
      difficulty: 'Intermediate',
      targetRole: 'Dev',
      status: 'active',
      questions: [
        { question: 'What is React?', topic: 'React', expectedPoints: ['Component-based'] },
      ],
      answers: [
        { questionIndex: 0, answer: 'React is a JS library.', evaluation: { overallScore: 78 } },
      ],
    });

    const res = await request(app)
      .post(`/api/interviews/${interview._id}/finish`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.report.overallScore).toBe(76);
    expect(res.body.data.report.performanceLevel).toBe('Good');
    expect(res.body.data.report.recommendations).toContain('Practice system design problems');
  });
});
