import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import interviewRoutes from './routes/interview.routes.js';
import resumeRoutes from './routes/resume.routes.js';
import questionRoutes from './routes/question.routes.js';
import codingRoutes from './routes/coding.routes.js';
import progressRoutes from './routes/progress.routes.js';

const app = express();

// ── Security ──
app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));

// ── Rate limiting ──
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } },
});
app.use(limiter);

// ── Body parsing ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Static file serving for uploaded resumes ──
app.use('/uploads', express.static(path.resolve('uploads')));

// ── Health check ──
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API routes ──
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/problems', codingRoutes);
app.use('/api/progress', progressRoutes);

// ── Error handling ──
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
