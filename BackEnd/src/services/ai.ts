/* ================================================================== */
/*  Artem — AI Service Layer                                          */
/*  Abstraction over OpenAI / Groq (both use OpenAI-compatible API).  */
/*  Gemini support can be added later with the same interface.        */
/* ================================================================== */

import OpenAI from 'openai';
import config from '../config/index.js';

/* ── Provider Setup ──────────────────────────────────────────────── */

type Provider = 'openai' | 'groq';

interface ProviderConfig {
  client: OpenAI;
  model: string;
  /** Max tokens the model supports for output */
  maxTokens: number;
  name: string;
}

function createProvider(provider: Provider): ProviderConfig {
  switch (provider) {
    case 'groq':
      if (!config.groqApiKey) throw new Error('GROQ_API_KEY is not configured');
      return {
        client: new OpenAI({
          apiKey: config.groqApiKey,
          baseURL: 'https://api.groq.com/openai/v1',
        }),
        model: 'llama-3.1-70b-versatile',
        maxTokens: 4096,
        name: 'groq',
      };

    case 'openai':
    default:
      if (!config.openaiApiKey) throw new Error('OPENAI_API_KEY is not configured');
      return {
        client: new OpenAI({ apiKey: config.openaiApiKey }),
        model: 'gpt-4o-mini',
        maxTokens: 4096,
        name: 'openai',
      };
  }
}

/**
 * Returns an ordered list of available providers.
 * Primary provider first, fallback second.
 */
function getProviderChain(): ProviderConfig[] {
  const primary = config.aiProvider as Provider;
  const fallback: Provider = primary === 'openai' ? 'groq' : 'openai';
  const chain: ProviderConfig[] = [];

  try { chain.push(createProvider(primary)); } catch { /* key not set */ }
  try { chain.push(createProvider(fallback)); } catch { /* key not set */ }

  if (chain.length === 0) {
    throw new Error('No AI provider configured. Set OPENAI_API_KEY or GROQ_API_KEY in .env');
  }

  return chain;
}

/* ── Core Chat Function ──────────────────────────────────────────── */

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Send a chat completion and return the text response.
 * If `json` is true, instructs the model to return valid JSON.
 * Automatically falls back to the alternate provider on runtime errors.
 */
async function chat(
  messages: ChatMessage[],
  options?: { json?: boolean; temperature?: number; maxTokens?: number },
): Promise<string> {
  const providers = getProviderChain();

  let lastError: Error | null = null;
  for (const { client, model, maxTokens: providerMax, name } of providers) {
    try {
      const response = await client.chat.completions.create({
        model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? Math.min(providerMax, 4096),
        ...(options?.json ? { response_format: { type: 'json_object' } } : {}),
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content) throw new Error('AI returned an empty response');
      return content;
    } catch (err: any) {
      console.warn(`[AI] ${name} failed: ${err.message || err}`);
      lastError = err;
      // Continue to next provider
    }
  }

  throw lastError || new Error('All AI providers failed');
}

/**
 * Chat and parse the result as JSON. Throws if the model returns invalid JSON.
 */
async function chatJSON<T = Record<string, any>>(
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number },
): Promise<T> {
  const raw = await chat(messages, { ...options, json: true });
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`AI returned invalid JSON: ${raw.slice(0, 200)}`);
  }
}

/* ── Interview: Generate Questions ───────────────────────────────── */

export interface GeneratedQuestion {
  question: string;
  topic: string;
  expectedPoints: string[];
}

export async function generateInterviewQuestions(params: {
  type: string;
  difficulty: string;
  targetRole: string;
  count: number;
  previousQuestions?: string[];
}): Promise<GeneratedQuestion[]> {
  const { type, difficulty, targetRole, count, previousQuestions } = params;

  const systemPrompt = `You are an expert technical interviewer. Generate interview questions for a ${targetRole} position.

Rules:
- Generate exactly ${count} questions
- Interview type: ${type}
- Difficulty: ${difficulty}
- Questions should be progressively connected and build context
- Each question must be relevant to the role and type
${previousQuestions?.length ? `- Do NOT repeat these questions: ${previousQuestions.join('; ')}` : ''}

Return JSON: { "questions": [{ "question": "...", "topic": "...", "expectedPoints": ["point1", "point2", "point3"] }] }`;

  const result = await chatJSON<{ questions: GeneratedQuestion[] }>([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Generate ${count} ${type} interview questions for a ${difficulty}-level ${targetRole} candidate.` },
  ], { temperature: 0.8 });

  return result.questions;
}

/* ── Interview: Evaluate Answer ──────────────────────────────────── */

export interface AnswerEvaluation {
  overallScore: number;
  dimensions: {
    correctness: number;
    communication: number;
    technicalDepth: number;
    completeness: number;
  };
  strengths: string[];
  weaknesses: string[];
  improvedAnswer: string;
  followUp?: string;
}

export async function evaluateAnswer(params: {
  question: string;
  answer: string;
  expectedPoints: string[];
  type: string;
  difficulty: string;
  targetRole: string;
}): Promise<AnswerEvaluation> {
  const { question, answer, expectedPoints, type, difficulty, targetRole } = params;

  const systemPrompt = `You are an expert interview evaluator assessing a ${targetRole} candidate.
Interview type: ${type}, Difficulty: ${difficulty}.

Evaluate the candidate's answer on these dimensions (0-100 each):
- correctness: factual accuracy and relevance
- communication: clarity, structure, articulation
- technicalDepth: depth of technical understanding shown
- completeness: coverage of expected points

Expected points for this question: ${expectedPoints.join(', ')}

Provide:
- overallScore (0-100, weighted average)
- scores for each dimension
- 1-3 specific strengths
- 1-3 specific weaknesses/areas for improvement
- An improved version of their answer (2-3 sentences)
- Optionally, a follow-up question

Return JSON: {
  "overallScore": number,
  "dimensions": { "correctness": number, "communication": number, "technicalDepth": number, "completeness": number },
  "strengths": ["..."],
  "weaknesses": ["..."],
  "improvedAnswer": "...",
  "followUp": "..." or null
}`;

  return chatJSON<AnswerEvaluation>([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Question: ${question}\n\nCandidate's Answer: ${answer}` },
  ], { temperature: 0.4 });
}

/* ── Interview: Generate Final Report ────────────────────────────── */

export interface InterviewReport {
  overallScore: number;
  dimensions: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  performanceLevel: string;
}

export async function generateInterviewReport(params: {
  type: string;
  difficulty: string;
  targetRole: string;
  questionsAndAnswers: Array<{
    question: string;
    answer: string;
    score: number;
  }>;
}): Promise<InterviewReport> {
  const { type, difficulty, targetRole, questionsAndAnswers } = params;

  const qaText = questionsAndAnswers.map((qa, i) =>
    `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}\nScore: ${qa.score}/100`
  ).join('\n\n');

  const systemPrompt = `You are an expert interview evaluator. Generate a comprehensive performance report.

Interview: ${type} for ${targetRole} at ${difficulty} level.
Analyze all Q&A pairs below and provide a holistic assessment.

Return JSON: {
  "overallScore": number (0-100),
  "dimensions": { "Technical": number, "Communication": number, "Problem Solving": number, "Confidence": number, "Completeness": number },
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "recommendations": ["specific actionable recommendation 1", "..."],
  "performanceLevel": "Excellent" | "Good" | "Satisfactory" | "Needs Improvement"
}`;

  return chatJSON<InterviewReport>([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: qaText },
  ], { temperature: 0.3 });
}

/* ── Resume: Analyze ─────────────────────────────────────────────── */

export interface ResumeAnalysis {
  resumeScore: number;
  atsScore: number;
  skills: string[];
  missingSkills: string[];
  weakDescriptions: Array<{ section: string; issue: string; suggestion: string }>;
  grammarIssues: number;
  suggestions: string[];
  interviewQuestions: string[];
}

export async function analyzeResume(params: {
  resumeText: string;
  targetRole?: string;
}): Promise<ResumeAnalysis> {
  const { resumeText, targetRole } = params;

  const systemPrompt = `You are an expert resume reviewer and ATS specialist.
Analyze the following resume${targetRole ? ` for a ${targetRole} position` : ''}.

Evaluate:
1. Resume Score (0-100): overall quality, impact statements, relevance
2. ATS Score (0-100): keyword optimization, formatting compatibility, section headers
3. Detected Skills: technical and soft skills found
4. Missing Skills: important skills for the role that are absent
5. Weak Descriptions: sections with vague or unquantified descriptions
6. Grammar Issues: approximate count of grammar/spelling problems
7. Suggestions: 4-6 specific, actionable improvement recommendations
8. Interview Questions: 4-5 questions an interviewer would ask based on this resume

Return JSON: {
  "resumeScore": number,
  "atsScore": number,
  "skills": ["skill1", "skill2", ...],
  "missingSkills": ["skill1", "skill2", ...],
  "weakDescriptions": [{ "section": "...", "issue": "...", "suggestion": "..." }],
  "grammarIssues": number,
  "suggestions": ["...", "..."],
  "interviewQuestions": ["...", "..."]
}`;

  return chatJSON<ResumeAnalysis>([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Resume:\n\n${resumeText}` },
  ], { temperature: 0.3, maxTokens: 4096 });
}

/* ── Export ───────────────────────────────────────────────────────── */

const aiService = {
  chat,
  chatJSON,
  generateInterviewQuestions,
  evaluateAnswer,
  generateInterviewReport,
  analyzeResume,
};

export default aiService;
