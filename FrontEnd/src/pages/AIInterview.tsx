import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { cn, getReadinessClass } from '@/lib/utils';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Tabs';
import { Textarea } from '@/components/ui/Input';
import { AIBadge, Badge } from '@/components/ui/Badge';
import { CircularProgress, ProgressBar } from '@/components/ui/ProgressBar';
import {
  Sparkles, Play, ChevronRight, Loader2, CheckCircle,
  XCircle, MessageSquare, Clock, ArrowRight, RotateCcw,
} from 'lucide-react';

type InterviewPhase = 'config' | 'loading' | 'active' | 'processing' | 'feedback' | 'finishing' | 'complete';

interface Question {
  question: string;
  topic: string;
  expectedPoints: string[];
}

interface AnswerEvaluation {
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

interface InterviewReport {
  overallScore: number;
  dimensions: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  performanceLevel: string;
}

const AIInterview: React.FC = () => {
  const [phase, setPhase] = useState<InterviewPhase>('config');
  const [config, setConfig] = useState({
    type: 'Technical',
    difficulty: 'Intermediate',
    targetRole: 'Full Stack Developer',
    duration: '30',
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState('');
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [lastEvaluation, setLastEvaluation] = useState<AnswerEvaluation | null>(null);
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalQuestions = questions.length;

  const createInterviewMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/interviews', {
        type: config.type,
        difficulty: config.difficulty,
        targetRole: config.targetRole,
        duration: parseInt(config.duration),
      });
      return res.data;
    },
    onSuccess: (data) => {
      setInterviewId(data.data._id);
      setQuestions(data.data.questions || []);
      setPhase('active');
      setCurrentQuestion(1);
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error?.message || 'Failed to start interview. Please try again.');
      setPhase('config');
    },
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/interviews/${interviewId}/answer`, {
        questionIndex: currentQuestion - 1,
        answer,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setLastEvaluation(data.data.evaluation);
      setPhase('feedback');
    },
    onError: () => {
      setPhase('active');
      setError('Failed to evaluate answer. Please try again.');
    },
  });

  const finishInterviewMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/interviews/${interviewId}/finish`);
      return res.data;
    },
    onSuccess: (data) => {
      setReport(data.data.report);
      setPhase('complete');
    },
    onError: () => {
      setPhase('complete');
    },
  });

  const startInterview = () => {
    setPhase('loading');
    setError(null);
    createInterviewMutation.mutate();
  };

  const submitAnswer = () => {
    setPhase('processing');
    submitAnswerMutation.mutate();
  };

  const nextQuestion = () => {
    if (currentQuestion >= totalQuestions) {
      setPhase('finishing');
      finishInterviewMutation.mutate();
    } else {
      setAnswer('');
      setLastEvaluation(null);
      setCurrentQuestion((prev) => prev + 1);
      setPhase('active');
    }
  };

  // Loading — generating questions
  if (phase === 'loading') {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl artem-gradient mb-6">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
        <h2 className="text-heading-2 text-text-primary mb-2">Preparing Your Interview</h2>
        <p className="text-body text-text-secondary">AI is generating personalized questions for your {config.type} interview...</p>
      </div>
    );
  }

  // Configuration screen
  if (phase === 'config') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <AIBadge />
          </div>
          <h1 className="text-display text-text-primary mb-2">AI Interview</h1>
          <p className="text-body-lg text-text-secondary">
            Configure your interview session and let AI assess your readiness
          </p>
        </div>

        {error && (
          <Card padding="md" className="border-error/30 bg-error/5">
            <div className="flex items-center gap-2 text-error">
              <XCircle className="h-4 w-4 shrink-0" />
              <p className="text-body-sm">{error}</p>
            </div>
          </Card>
        )}

        <Card padding="lg">
          <div className="space-y-5">
            <Dropdown
              label="Interview Type"
              options={[
                { value: 'Technical', label: 'Technical' },
                { value: 'HR', label: 'HR' },
                { value: 'Behavioral', label: 'Behavioral' },
                { value: 'System Design', label: 'System Design' },
                { value: 'Resume Based', label: 'Resume Based' },
                { value: 'Company Specific', label: 'Company Specific' },
              ]}
              value={config.type}
              onChange={(v) => setConfig({ ...config, type: v })}
            />
            <Dropdown
              label="Difficulty"
              options={[
                { value: 'Beginner', label: 'Beginner' },
                { value: 'Intermediate', label: 'Intermediate' },
                { value: 'Advanced', label: 'Advanced' },
              ]}
              value={config.difficulty}
              onChange={(v) => setConfig({ ...config, difficulty: v })}
            />
            <Dropdown
              label="Duration (minutes)"
              options={[
                { value: '15', label: '15 minutes' },
                { value: '30', label: '30 minutes' },
                { value: '45', label: '45 minutes' },
                { value: '60', label: '60 minutes' },
              ]}
              value={config.duration}
              onChange={(v) => setConfig({ ...config, duration: v })}
            />
          </div>

          <Button variant="gradient" size="lg" className="w-full mt-8" onClick={startInterview} leftIcon={<Play className="h-4.5 w-4.5" />}>
            Start Interview
          </Button>
        </Card>
      </div>
    );
  }

  // Active / Processing / Feedback
  if (phase === 'active' || phase === 'processing' || phase === 'feedback') {
    const currentQ = questions[currentQuestion - 1];

    return (
      <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
        {/* Progress bar */}
        <div className="flex items-center gap-4">
          <span className="text-body-sm text-text-secondary font-medium whitespace-nowrap">
            Question {currentQuestion}/{totalQuestions}
          </span>
          <ProgressBar value={currentQuestion} max={totalQuestions} size="sm" color="var(--primary)" className="flex-1" />
          {currentQ && (
            <Badge variant="default" size="sm">{currentQ.topic}</Badge>
          )}
        </div>

        {/* Question */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="info" size="md">{config.type}</Badge>
            <Badge variant="default" size="md">{config.difficulty}</Badge>
          </div>
          <h2 className="text-heading-2 text-text-primary leading-relaxed">
            {currentQ?.question || 'Loading question...'}
          </h2>
        </Card>

        {/* Answer / Processing / Feedback */}
        {phase === 'active' && (
          <Card padding="lg">
            {error && (
              <div className="flex items-center gap-2 text-error mb-3">
                <XCircle className="h-4 w-4 shrink-0" />
                <p className="text-body-sm">{error}</p>
              </div>
            )}
            <Textarea
              label="Your Answer"
              placeholder="Type your answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="min-h-[160px]"
            />
            <Button
              variant="primary"
              size="lg"
              className="w-full mt-4"
              onClick={submitAnswer}
              disabled={!answer.trim()}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Submit Answer
            </Button>
          </Card>
        )}

        {phase === 'processing' && (
          <Card padding="lg" variant="ai" className="text-center py-12">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl artem-gradient mb-4">
              <Loader2 className="h-7 w-7 text-white animate-spin" />
            </div>
            <h3 className="text-heading-3 text-text-primary mb-1">Analyzing your response</h3>
            <p className="text-body text-text-secondary">AI is evaluating correctness, depth, and clarity...</p>
          </Card>
        )}

        {phase === 'feedback' && lastEvaluation && (
          <div className="space-y-4">
            <Card padding="lg" variant="ai">
              <div className="flex items-center gap-2 mb-4">
                <AIBadge />
                <span className="text-body-sm font-medium text-ai-text">AI Evaluation</span>
              </div>
              <div className="flex items-center gap-6 mb-5">
                <CircularProgress value={lastEvaluation.overallScore} size={80} strokeWidth={6} />
                <div>
                  <p className="text-heading-2 text-text-primary font-bold">{lastEvaluation.overallScore}/100</p>
                  <p className="text-body-sm text-text-secondary">Overall Score</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: 'Correctness', score: lastEvaluation.dimensions.correctness },
                  { label: 'Communication', score: lastEvaluation.dimensions.communication },
                  { label: 'Technical Depth', score: lastEvaluation.dimensions.technicalDepth },
                  { label: 'Completeness', score: lastEvaluation.dimensions.completeness },
                ].map((dim) => (
                  <div key={dim.label} className="flex items-center justify-between p-2.5 rounded-lg bg-surface/50">
                    <span className="text-body-sm text-text-secondary">{dim.label}</span>
                    <span className={cn('text-body-sm font-semibold', getReadinessClass(dim.score))}>{dim.score}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {lastEvaluation.strengths.map((s, i) => (
                  <div key={`s-${i}`} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    <p className="text-body-sm text-text-primary">{s}</p>
                  </div>
                ))}
                {lastEvaluation.weaknesses.map((w, i) => (
                  <div key={`w-${i}`} className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                    <p className="text-body-sm text-text-primary">{w}</p>
                  </div>
                ))}
              </div>
              {lastEvaluation.improvedAnswer && (
                <div className="mt-4 p-3 rounded-lg bg-surface border border-border">
                  <p className="text-caption text-text-muted font-medium mb-1">💡 Improved Answer</p>
                  <p className="text-body-sm text-text-secondary">{lastEvaluation.improvedAnswer}</p>
                </div>
              )}
            </Card>
            <Button variant="primary" size="lg" className="w-full" onClick={nextQuestion} rightIcon={<ChevronRight className="h-4 w-4" />}>
              {currentQuestion >= totalQuestions ? 'View Results' : 'Next Question'}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Finishing — generating report
  if (phase === 'finishing') {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl artem-gradient mb-6">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
        <h2 className="text-heading-2 text-text-primary mb-2">Generating Your Report</h2>
        <p className="text-body text-text-secondary">AI is analyzing your overall performance...</p>
      </div>
    );
  }

  // Complete
  const finalScore = report?.overallScore ?? 0;
  const dimensions = report?.dimensions ?? {};
  const strengths = report?.strengths ?? [];
  const weaknesses = report?.weaknesses ?? [];
  const recommendations = report?.recommendations ?? [];
  const performanceLevel = report?.performanceLevel ?? 'N/A';

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl artem-gradient mb-4">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-heading-1 text-text-primary mb-2">Interview Complete</h1>
        <p className="text-body text-text-secondary">Here's your AI-powered performance summary</p>
      </div>

      <Card padding="lg" className="text-center">
        <CircularProgress value={finalScore} size={140} strokeWidth={10} label="overall" />
        <p className={cn('text-heading-3 font-semibold mt-3', getReadinessClass(finalScore))}>{performanceLevel}</p>
      </Card>

      {Object.keys(dimensions).length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(dimensions).map(([label, score]) => (
            <Card key={label} padding="md" className="text-center">
              <p className="text-caption text-text-muted mb-1">{label}</p>
              <p className={cn('text-heading-2 font-bold', getReadinessClass(score as number))}>{score as number}</p>
            </Card>
          ))}
        </div>
      )}

      <Card padding="lg">
        <h3 className="text-heading-3 text-text-primary mb-3">Key Insights</h3>
        <div className="space-y-2.5">
          {strengths.map((s, i) => (
            <div key={`s-${i}`} className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
              <p className="text-body-sm text-text-primary">{s}</p>
            </div>
          ))}
          {weaknesses.map((w, i) => (
            <div key={`w-${i}`} className="flex items-start gap-2">
              <XCircle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
              <p className="text-body-sm text-text-primary">{w}</p>
            </div>
          ))}
        </div>
      </Card>

      {recommendations.length > 0 && (
        <Card padding="lg" variant="ai">
          <div className="flex items-center gap-2 mb-3">
            <AIBadge />
            <span className="text-body-sm font-medium text-ai-text">Recommendations</span>
          </div>
          <div className="space-y-2">
            {recommendations.map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-body-sm text-text-primary">{r}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={() => { setPhase('config'); setCurrentQuestion(0); setAnswer(''); setQuestions([]); setReport(null); setLastEvaluation(null); setError(null); }} leftIcon={<RotateCcw className="h-4 w-4" />}>
          New Interview
        </Button>
        <Button variant="primary" className="flex-1" onClick={() => window.location.href = '/progress'} leftIcon={<MessageSquare className="h-4 w-4" />}>
          View Progress
        </Button>
      </div>
    </div>
  );
};

export default AIInterview;
