import { Router, type Response, type NextFunction } from 'express';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { Resume } from '../models/index.js';
import aiService, { type ResumeAnalysis } from '../services/ai.js';
import fs from 'fs';
import path from 'path';

const router = Router();

/* ------------------------------------------------------------------ */
/*  Text extraction from uploaded files                               */
/* ------------------------------------------------------------------ */
async function extractTextFromFile(filePath: string, _originalName: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf') {
    // Dynamic import for pdf-parse (ESM compatibility)
    const pdfModule = await import('pdf-parse');
    const pdfParse = (pdfModule as any).default || pdfModule;
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  }

  if (ext === '.txt') {
    return fs.readFileSync(filePath, 'utf-8');
  }

  // For .doc/.docx — extract what we can or notify
  // pdf-parse handles PDFs well; for DOC/DOCX a dedicated library (mammoth)
  // would be needed. For now, we'll read raw text as fallback.
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    // If the raw read produced meaningful text (not binary garbage), use it
    const printableRatio = raw.replace(/[^\x20-\x7E\n\r\t]/g, '').length / raw.length;
    if (printableRatio > 0.7) return raw;
  } catch {
    // Binary file — can't extract
  }

  throw new Error('Unable to extract text from this file format. Please upload a PDF.');
}

/* ------------------------------------------------------------------ */
/*  POST /api/resumes/upload — Upload and analyze a resume            */
/* ------------------------------------------------------------------ */
router.post(
  '/upload',
  authenticate,
  (req: AuthRequest, res: Response, next: NextFunction) => {
    upload.single('resume')(req, res, (err: any) => {
      if (err) {
        // Multer-specific errors
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(400).json({
            success: false,
            error: { code: 'FILE_TOO_LARGE', message: 'File must be under 5 MB' },
          });
          return;
        }
        res.status(400).json({
          success: false,
          error: { code: 'UPLOAD_ERROR', message: err.message || 'File upload failed' },
        });
        return;
      }
      next();
    });
  },
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'No resume file provided' },
        });
        return;
      }

      const filePath = req.file.path;
      let analysis: ResumeAnalysis;

      try {
        // Extract text from the uploaded file
        const resumeText = await extractTextFromFile(filePath, req.file.originalname);

        if (!resumeText || resumeText.trim().length < 50) {
          res.status(400).json({
            success: false,
            error: { code: 'EXTRACTION_ERROR', message: 'Could not extract enough text from the file. Please upload a text-based PDF.' },
          });
          return;
        }

        // Get the user's target role for context (if available)
        const targetRole = req.body.targetRole || undefined;

        // AI-powered analysis
        analysis = await aiService.analyzeResume({ resumeText, targetRole });
      } catch (aiError: any) {
        console.error('[Resume] AI analysis failed:', aiError);

        // Check if it was an extraction issue vs AI issue
        if (aiError.message?.includes('Unable to extract')) {
          res.status(400).json({
            success: false,
            error: { code: 'EXTRACTION_ERROR', message: aiError.message },
          });
          return;
        }

        // AI unavailable — fallback to basic analysis
        console.warn('[Resume] Falling back to basic analysis');
        analysis = {
          resumeScore: 65,
          atsScore: 60,
          skills: [],
          missingSkills: [],
          weakDescriptions: [],
          grammarIssues: 0,
          suggestions: ['AI analysis is temporarily unavailable. Please try re-analyzing later.'],
          interviewQuestions: [],
        };
      }

      const resume = await Resume.create({
        userId: req.userId,
        fileUrl: `/uploads/${req.file.filename}`,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        skills: analysis.skills,
        missingSkills: analysis.missingSkills,
        weakDescriptions: analysis.weakDescriptions,
        grammarIssues: analysis.grammarIssues,
        suggestions: analysis.suggestions,
        interviewQuestions: analysis.interviewQuestions,
        resumeScore: analysis.resumeScore,
        atsScore: analysis.atsScore,
      });

      res.status(201).json({
        success: true,
        data: resume,
        message: 'Resume uploaded and analyzed successfully',
      });
    } catch (error) {
      console.error('[Resume] Upload error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to upload resume' },
      });
    }
  },
);

/* ------------------------------------------------------------------ */
/*  GET /api/resumes — List user's resumes (newest first)             */
/* ------------------------------------------------------------------ */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const resumes = await Resume.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: resumes });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch resumes' },
    });
  }
});

/* ------------------------------------------------------------------ */
/*  GET /api/resumes/:id — Single resume detail                       */
/* ------------------------------------------------------------------ */
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.userId });

    if (!resume) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Resume not found' },
      });
      return;
    }

    res.json({ success: true, data: resume });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch resume' },
    });
  }
});

/* ------------------------------------------------------------------ */
/*  DELETE /api/resumes/:id — Delete a resume + its file              */
/* ------------------------------------------------------------------ */
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!resume) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Resume not found' },
      });
      return;
    }

    // Clean up the file from disk (best-effort)
    const filePath = resume.fileUrl.replace(/^\//, '');
    fs.unlink(filePath, () => {});

    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to delete resume' },
    });
  }
});

export default router;
