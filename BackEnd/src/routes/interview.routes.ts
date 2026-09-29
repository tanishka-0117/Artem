import { Router, type Response } from 'express';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { Interview } from '../models/index.js';
import aiService, {
  type GeneratedQuestion,
  type AnswerEvaluation,
  type InterviewReport,
} from '../services/ai.js';

const router = Router();

/* ------------------------------------------------------------------ */
/*  POST /api/interviews — Create interview + AI-generate questions   */
/* ------------------------------------------------------------------ */
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { type, difficulty, targetRole, duration } = req.body;

    if (!type || !difficulty || !targetRole) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Type, difficulty, and target role are required' } });
      return;
    }

    // Determine question count based on duration
    const questionCount = Math.max(3, Math.min(12, Math.floor((parseInt(duration) || 30) / 4)));

    // Generate questions via AI
    let questions: GeneratedQuestion[];
    try {
      questions = await aiService.generateInterviewQuestions({
        type,
        difficulty,
        targetRole,
        count: questionCount,
      });
    } catch (aiError) {
      console.error('[AI] Question generation failed:', aiError);
      res.status(503).json({ success: false, error: { code: 'AI_UNAVAILABLE', message: 'AI service is temporarily unavailable. Please try again.' } });
      return;
    }

    const interview = await Interview.create({
      userId: req.userId,
      type,
      difficulty,
      targetRole,
      duration,
      status: 'active',
      questions,
      answers: [],
    });

    res.status(201).json({
      success: true,
      data: interview,
      message: 'Interview session created',
    });
  } catch (error) {
    console.error('[Interview] Create error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create interview' } });
  }
});

/* ------------------------------------------------------------------ */
/*  GET /api/interviews — List user's interviews                      */
/* ------------------------------------------------------------------ */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const skip = (page - 1) * limit;

    const [interviews, total] = await Promise.all([
      Interview.find({ userId: req.userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Interview.countDocuments({ userId: req.userId }),
    ]);

    res.json({
      success: true,
      data: interviews,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch interviews' } });
  }
});

/* ------------------------------------------------------------------ */
/*  GET /api/interviews/:id                                           */
/* ------------------------------------------------------------------ */
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.userId });

    if (!interview) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Interview not found' } });
      return;
    }

    res.json({ success: true, data: interview });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch interview' } });
  }
});

/* ------------------------------------------------------------------ */
/*  POST /api/interviews/:id/answer — Submit + AI-evaluate answer     */
/* ------------------------------------------------------------------ */
router.post('/:id/answer', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { questionIndex, answer } = req.body;
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.userId, status: 'active' });

    if (!interview) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Active interview not found' } });
      return;
    }

    if (typeof questionIndex !== 'number' || questionIndex < 0 || questionIndex >= interview.questions.length) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid question index' } });
      return;
    }

    if (!answer || typeof answer !== 'string' || !answer.trim()) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Answer is required' } });
      return;
    }

    const currentQuestion = interview.questions[questionIndex];

    // Evaluate answer via AI
    let evaluation: AnswerEvaluation;
    try {
      evaluation = await aiService.evaluateAnswer({
        question: currentQuestion.question,
        answer,
        expectedPoints: currentQuestion.expectedPoints || [],
        type: interview.type,
        difficulty: interview.difficulty,
        targetRole: interview.targetRole,
      });
    } catch (aiError) {
      console.error('[AI] Answer evaluation failed:', aiError);
      // Graceful degradation — store answer without AI eval
      evaluation = {
        overallScore: 0,
        dimensions: { correctness: 0, communication: 0, technicalDepth: 0, completeness: 0 },
        strengths: ['Answer recorded — AI evaluation temporarily unavailable'],
        weaknesses: [],
        improvedAnswer: '',
      };
    }

    interview.answers.push({
      questionIndex,
      answer,
      submittedAt: new Date(),
      evaluation,
    });
    await interview.save();

    res.json({
      success: true,
      data: {
        evaluation,
        interviewId: interview._id,
        questionIndex,
      },
      message: 'Answer submitted and evaluated',
    });
  } catch (error) {
    console.error('[Interview] Answer error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to submit answer' } });
  }
});

/* ------------------------------------------------------------------ */
/*  POST /api/interviews/:id/finish — Complete + AI final report      */
/* ------------------------------------------------------------------ */
router.post('/:id/finish', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.userId, status: 'active' });

    if (!interview) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Active interview not found' } });
      return;
    }

    // Build Q&A pairs for the report
    const questionsAndAnswers = interview.answers.map((a: any) => ({
      question: interview.questions[a.questionIndex]?.question || 'Unknown',
      answer: a.answer,
      score: a.evaluation?.overallScore || 0,
    }));

    // Generate final report via AI
    let report: InterviewReport;
    try {
      report = await aiService.generateInterviewReport({
        type: interview.type,
        difficulty: interview.difficulty,
        targetRole: interview.targetRole,
        questionsAndAnswers,
      });
    } catch (aiError) {
      console.error('[AI] Report generation failed:', aiError);
      // Fallback: compute from individual evaluations
      const avgScore = questionsAndAnswers.length > 0
        ? Math.round(questionsAndAnswers.reduce((sum, qa) => sum + qa.score, 0) / questionsAndAnswers.length)
        : 0;
      report = {
        overallScore: avgScore,
        dimensions: { Technical: avgScore, Communication: avgScore, 'Problem Solving': avgScore, Confidence: avgScore, Completeness: avgScore },
        strengths: ['Interview completed — detailed report unavailable due to AI service issue'],
        weaknesses: [],
        recommendations: ['Try completing another interview for a full AI-powered report'],
        performanceLevel: avgScore >= 80 ? 'Good' : avgScore >= 60 ? 'Satisfactory' : 'Needs Improvement',
      };
    }

    interview.status = 'completed';
    interview.score = report.overallScore;
    interview.feedback = report;
    await interview.save();

    res.json({
      success: true,
      data: {
        interview,
        report,
      },
      message: 'Interview completed',
    });
  } catch (error) {
    console.error('[Interview] Finish error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to complete interview' } });
  }
});

export default router;
