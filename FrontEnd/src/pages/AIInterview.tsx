import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { cn, getReadinessClass } from '@/lib/utils';
import { CircularProgress, ProgressBar } from '@/components/ui/ProgressBar';
import { AIBadge, Badge } from '@/components/ui/Badge';
import {
  Sparkles, ChevronRight, Loader2, CheckCircle, XCircle,
  MessageSquare, Clock, RotateCcw, Send, Bot, User, Zap,
  Brain, Target, Code2, Briefcase, Building2, FileText,
  Settings2, Mic, MicOff, ArrowDown,
} from 'lucide-react';

type InterviewPhase = 'config' | 'loading' | 'active' | 'processing' | 'feedback' | 'finishing' | 'complete';
interface Question { question: string; topic: string; expectedPoints: string[]; }
interface AnswerEvaluation {
  overallScore: number;
  dimensions: { correctness: number; communication: number; technicalDepth: number; completeness: number; };
  strengths: string[]; weaknesses: string[]; improvedAnswer: string; followUp?: string;
}
interface InterviewReport {
  overallScore: number; dimensions: Record<string, number>;
  strengths: string[]; weaknesses: string[]; recommendations: string[]; performanceLevel: string;
}
interface ChatMessage { id: string; type: 'ai' | 'user' | 'system'; content: React.ReactNode; timestamp: Date; }

// Floating particles for ambient background
const FloatingParticles: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="absolute rounded-full opacity-20"
        style={{
          width: 4 + Math.random() * 6, height: 4 + Math.random() * 6,
          left: `${10 + Math.random() * 80}%`, top: `${10 + Math.random() * 80}%`,
          background: i % 2 === 0 ? 'var(--primary)' : 'var(--cyan)',
          animation: `floatParticle ${8 + Math.random() * 12}s ease-in-out infinite`,
          animationDelay: `${i * -2}s`,
        }}
      />
    ))}
  </div>
);

// Animated AI Orb
const AIOrb: React.FC<{ size?: 'sm' | 'md' | 'lg'; pulsing?: boolean }> = ({ size = 'md', pulsing = true }) => {
  const s = { sm: 40, md: 72, lg: 110 }[size];
  return (
    <div className="relative group" style={{ width: s, height: s }}>
      {pulsing && (
        <>
          <div className="absolute inset-0 rounded-full animate-ping"
            style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', animationDuration: '3s' }} />
          <div className="absolute rounded-full" style={{ inset: '-25%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 60%)', animation: 'pulseSoft 4s ease-in-out infinite' }} />
        </>
      )}
      <div className="absolute inset-0 rounded-full" style={{
        background: 'conic-gradient(from 180deg at 50% 50%, #2563EB 0deg, #06B6D4 120deg, #7C3AED 240deg, #2563EB 360deg)',
        filter: `blur(${s * 0.08}px)`, animation: 'spin 6s linear infinite',
      }} />
      <div className="absolute rounded-full" style={{ inset: '12%',
        background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.25) 0%, transparent 60%), radial-gradient(circle, #0c1525 0%, #111c2e 100%)',
      }} />
      <div className="absolute rounded-full" style={{ inset: '20%',
        background: 'radial-gradient(circle at 40% 30%, rgba(59,130,246,0.5) 0%, rgba(6,182,212,0.25) 40%, transparent 70%)',
        animation: 'pulseSoft 3s ease-in-out infinite',
      }} />
    </div>
  );
};

// Typing indicator dots
const TypingDots: React.FC = () => (
  <div className="flex gap-1 items-center py-1">
    {[0, 1, 2].map((i) => (
      <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/70" style={{
        animation: 'typingBounce 1.2s ease-in-out infinite', animationDelay: `${i * 0.15}s`,
      }} />
    ))}
  </div>
);

// Quick Action Chip with ripple
const QuickChip: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; active?: boolean; desc?: string }> = ({
  icon, label, onClick, active, desc,
}) => {
  const [ripple, setRipple] = useState(false);
  const handleClick = () => { setRipple(true); setTimeout(() => setRipple(false), 400); onClick(); };
  return (
    <button onClick={handleClick} className={cn(
      'group relative flex flex-col items-center gap-1.5 px-5 py-3.5 rounded-2xl text-body-sm font-medium transition-all duration-300',
      'border backdrop-blur-sm overflow-hidden',
      active
        ? 'bg-primary/15 border-primary/40 text-primary shadow-[0_0_25px_rgba(59,130,246,0.12)] scale-[1.03]'
        : 'bg-surface/30 border-border/40 text-text-secondary hover:border-primary/25 hover:text-text-primary hover:bg-surface/50 hover:scale-[1.02]',
      'active:scale-[0.97]',
    )}>
      {ripple && <span className="absolute inset-0 bg-primary/10 animate-ping rounded-2xl" style={{ animationIterationCount: 1 }} />}
      <span className={cn('transition-transform duration-300', active && 'scale-110')}>{icon}</span>
      <span>{label}</span>
      {desc && <span className="text-[0.6rem] text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">{desc}</span>}
    </button>
  );
};

// Chat Bubble with staggered entrance
const ChatBubble: React.FC<{ type: 'ai' | 'user' | 'system'; children: React.ReactNode; animate?: boolean }> = ({
  type, children, animate = true,
}) => {
  const [visible, setVisible] = useState(!animate);
  useEffect(() => { if (animate) { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); } }, [animate]);

  if (type === 'system') {
    return (
      <div className={cn('flex justify-center my-3 transition-all duration-500', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2')}>
        <div className="px-4 py-1.5 rounded-full bg-surface/40 border border-border/30 backdrop-blur-sm text-caption text-text-muted inline-flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-primary/50" />
          {children}
        </div>
      </div>
    );
  }
  const isAI = type === 'ai';
  return (
    <div className={cn(
      'flex gap-3 max-w-[85%] transition-all duration-500',
      isAI ? 'self-start' : 'self-end flex-row-reverse',
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
    )}>
      <div className={cn(
        'shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-1 transition-all duration-300',
        isAI ? 'artem-gradient shadow-[0_0_12px_rgba(59,130,246,0.25)]' : 'bg-surface-soft border border-border',
      )}>
        {isAI ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-text-secondary" />}
      </div>
      <div className={cn(
        'rounded-2xl px-5 py-3.5 text-body transition-all duration-300',
        isAI
          ? 'bg-surface/50 border border-border/40 backdrop-blur-sm text-text-primary rounded-tl-md hover:border-border/60'
          : 'bg-primary/12 border border-primary/18 text-text-primary rounded-tr-md',
      )}>
        {children}
      </div>
    </div>
  );
};

// Config Selector with smooth transitions
const ConfigOption: React.FC<{
  label: string; options: { value: string; label: string; icon?: React.ReactNode }[];
  value: string; onChange: (v: string) => void;
}> = ({ label, options, value, onChange }) => (
  <div>
    <label className="block text-caption text-text-muted font-medium mb-2 uppercase tracking-wider">{label}</label>
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button key={opt.value} onClick={() => onChange(opt.value)} className={cn(
          'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-body-sm font-medium transition-all duration-200 border',
          value === opt.value
            ? 'bg-primary/15 border-primary/40 text-primary scale-[1.03]'
            : 'bg-surface/30 border-border/40 text-text-secondary hover:border-border-strong hover:text-text-primary active:scale-95',
        )}>
          {opt.icon && <span className="opacity-70">{opt.icon}</span>}
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

// Compact Score Ring
const ScoreRing: React.FC<{ score: number; label: string }> = ({ score, label }) => (
  <div className="flex flex-col items-center gap-1">
    <CircularProgress value={score} size={48} strokeWidth={4} showValue />
    <span className="text-caption text-text-muted">{label}</span>
  </div>
);

// Scroll-to-bottom indicator
const ScrollIndicator: React.FC<{ show: boolean; onClick: () => void }> = ({ show, onClick }) => (
  <button onClick={onClick} className={cn(
    'absolute bottom-20 right-6 w-9 h-9 rounded-full bg-surface/80 border border-border/50 backdrop-blur-sm',
    'flex items-center justify-center shadow-elevated transition-all duration-300 z-30',
    show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none',
  )}>
    <ArrowDown className="w-4 h-4 text-text-secondary" />
  </button>
);

/* ===================== MAIN COMPONENT ===================== */
const AIInterview: React.FC = () => {
  const [phase, setPhase] = useState<InterviewPhase>('config');
  const [config, setConfig] = useState({ type: 'Technical', difficulty: 'Intermediate', targetRole: 'Full Stack Developer', duration: '30' });
  const [showConfig, setShowConfig] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState('');
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [lastEvaluation, setLastEvaluation] = useState<AnswerEvaluation | null>(null);
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const totalQuestions = questions.length;

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [chatMessages, phase, scrollToBottom]);

  // Track scroll position for "scroll to bottom" button
  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    const handleScroll = () => {
      const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollBtn(gap > 100);
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [phase]);

  // Auto-focus input when entering active phase
  useEffect(() => {
    if (phase === 'active') setTimeout(() => inputRef.current?.focus(), 500);
  }, [phase, currentQuestion]);

  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
  };

  const addMessage = (type: ChatMessage['type'], content: React.ReactNode) => {
    setChatMessages((prev) => [...prev, { id: `msg-${Date.now()}-${Math.random()}`, type, content, timestamp: new Date() }]);
  };

  // — Mutations —
  const createInterviewMutation = useMutation({
    mutationFn: async () => { const res = await api.post('/interviews', { type: config.type, difficulty: config.difficulty, targetRole: config.targetRole, duration: parseInt(config.duration) }); return res.data; },
    onSuccess: (data) => {
      setInterviewId(data.data._id);
      const qs: Question[] = data.data.questions || [];
      setQuestions(qs);
      setPhase('active');
      setCurrentQuestion(1);
      setError(null);
      addMessage('system', `${config.type} Interview · ${config.difficulty} · ${config.duration} min`);
      if (qs.length > 0) {
        setTimeout(() => addMessage('ai', (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="info" size="sm">Q1 / {qs.length}</Badge>
              <Badge variant="default" size="sm">{qs[0].topic}</Badge>
            </div>
            <p className="leading-relaxed">{qs[0].question}</p>
          </div>
        )), 400);
      }
    },
    onError: (err: any) => { setError(err.response?.data?.error?.message || 'Failed to start interview.'); setPhase('config'); },
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async () => { const res = await api.post(`/interviews/${interviewId}/answer`, { questionIndex: currentQuestion - 1, answer }); return res.data; },
    onSuccess: (data) => {
      const ev = data.data.evaluation as AnswerEvaluation;
      setLastEvaluation(ev);
      setPhase('feedback');
      setTimeout(() => addMessage('ai', (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1"><AIBadge /><span className="text-caption font-medium text-ai-text">Evaluation</span></div>
          <div className="flex items-center gap-4">
            <CircularProgress value={ev.overallScore} size={60} strokeWidth={5} />
            <div>
              <p className="text-heading-3 font-bold text-text-primary">{ev.overallScore}<span className="text-body text-text-muted">/100</span></p>
              <p className="text-caption text-text-muted">Overall Score</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <ScoreRing score={ev.dimensions.correctness} label="Correct" />
            <ScoreRing score={ev.dimensions.communication} label="Comm" />
            <ScoreRing score={ev.dimensions.technicalDepth} label="Depth" />
            <ScoreRing score={ev.dimensions.completeness} label="Complete" />
          </div>
          <div className="space-y-1 text-body-sm">
            {ev.strengths.map((s, i) => (
              <div key={`s-${i}`} className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" /><span className="text-text-primary">{s}</span></div>
            ))}
            {ev.weaknesses.map((w, i) => (
              <div key={`w-${i}`} className="flex items-start gap-2"><XCircle className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" /><span className="text-text-primary">{w}</span></div>
            ))}
          </div>
          {ev.improvedAnswer && (
            <div className="p-3 rounded-lg bg-surface-soft/50 border border-border/30">
              <p className="text-caption text-text-muted font-medium mb-1">💡 Improved Answer</p>
              <p className="text-body-sm text-text-secondary">{ev.improvedAnswer}</p>
            </div>
          )}
        </div>
      )), 300);
    },
    onError: () => { setPhase('active'); setError('Failed to evaluate. Try again.'); },
  });

  const finishInterviewMutation = useMutation({
    mutationFn: async () => { const res = await api.post(`/interviews/${interviewId}/finish`); return res.data; },
    onSuccess: (data) => { setReport(data.data.report); setPhase('complete'); },
    onError: () => { setPhase('complete'); },
  });

  // — Handlers —
  const startInterview = () => { setPhase('loading'); setError(null); setChatMessages([]); createInterviewMutation.mutate(); };

  const submitAnswer = () => {
    if (!answer.trim()) return;
    addMessage('user', <p>{answer}</p>);
    setPhase('processing');
    submitAnswerMutation.mutate();
  };

  const nextQuestion = () => {
    if (currentQuestion >= totalQuestions) {
      setPhase('finishing');
      addMessage('system', 'Generating your performance report...');
      finishInterviewMutation.mutate();
    } else {
      setAnswer('');
      setLastEvaluation(null);
      const nextIdx = currentQuestion;
      setCurrentQuestion((prev) => prev + 1);
      setPhase('active');
      const nextQ = questions[nextIdx];
      if (nextQ) {
        setTimeout(() => addMessage('ai', (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="info" size="sm">Q{nextIdx + 1} / {totalQuestions}</Badge>
              <Badge variant="default" size="sm">{nextQ.topic}</Badge>
            </div>
            <p className="leading-relaxed">{nextQ.question}</p>
          </div>
        )), 400);
      }
      if (inputRef.current) inputRef.current.style.height = 'auto';
    }
  };

  const resetInterview = () => {
    setPhase('config'); setCurrentQuestion(0); setAnswer(''); setQuestions([]); setReport(null);
    setLastEvaluation(null); setError(null); setChatMessages([]); setShowConfig(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (phase === 'active' && answer.trim()) submitAnswer();
      else if (phase === 'feedback') nextQuestion();
    }
  };

  const typeIcons: Record<string, { icon: React.ReactNode; desc: string }> = {
    'Technical': { icon: <Code2 className="w-5 h-5" />, desc: 'DSA & Coding' },
    'HR': { icon: <Briefcase className="w-5 h-5" />, desc: 'Culture fit' },
    'Behavioral': { icon: <Brain className="w-5 h-5" />, desc: 'STAR method' },
    'System Design': { icon: <Target className="w-5 h-5" />, desc: 'Architecture' },
    'Resume Based': { icon: <FileText className="w-5 h-5" />, desc: 'Your experience' },
    'Company Specific': { icon: <Building2 className="w-5 h-5" />, desc: 'Targeted prep' },
  };

  // Helper: render chat messages list
  const renderMessages = () => chatMessages.map((msg) => <ChatBubble key={msg.id} type={msg.type}>{msg.content}</ChatBubble>);

  /* =================== CONFIG / WELCOME =================== */
  if (phase === 'config') {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] relative overflow-hidden">
        <FloatingParticles />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, rgba(6,182,212,0.025) 40%, transparent 65%)' }} />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-5 relative z-10 pb-36">
          <div className="mb-1 transition-transform duration-700 hover:scale-110"><AIOrb size="lg" /></div>
          <div className="text-center space-y-1">
            <h1 className="text-heading-1 text-text-primary">
              I'm Your <span className="artem-gradient-text">AI Interviewer</span>, How
            </h1>
            <h1 className="text-heading-1 text-text-primary">Can I Prepare You Today..?</h1>
          </div>
          <p className="text-body text-text-muted max-w-md text-center mt-1">Pick an interview type to get started, then configure difficulty and duration below</p>

          <div className="flex flex-wrap justify-center gap-3 mt-3">
            {Object.entries(typeIcons).map(([type, { icon, desc }]) => (
              <QuickChip key={type} icon={icon} label={type} desc={desc} active={config.type === type}
                onClick={() => setConfig({ ...config, type })} />
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-error/10 border border-error/20 text-error text-body-sm animate-slide-up">
              <XCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
          <div className={cn(
            'max-w-2xl mx-auto rounded-2xl border backdrop-blur-xl transition-all duration-300',
            'bg-surface/60 border-border/30 shadow-[0_-4px_30px_rgba(0,0,0,0.06)]',
            showConfig && 'shadow-[0_-8px_40px_rgba(0,0,0,0.12)]',
          )}>
            {showConfig && (
              <div className="px-5 pt-5 pb-3 space-y-4 border-b border-border/20 animate-slide-up">
                <ConfigOption label="Difficulty"
                  options={[{ value: 'Beginner', label: 'Beginner' }, { value: 'Intermediate', label: 'Intermediate' }, { value: 'Advanced', label: 'Advanced' }]}
                  value={config.difficulty} onChange={(v) => setConfig({ ...config, difficulty: v })} />
                <ConfigOption label="Duration"
                  options={[
                    { value: '15', label: '15 min', icon: <Clock className="w-3.5 h-3.5" /> },
                    { value: '30', label: '30 min', icon: <Clock className="w-3.5 h-3.5" /> },
                    { value: '45', label: '45 min', icon: <Clock className="w-3.5 h-3.5" /> },
                    { value: '60', label: '60 min', icon: <Clock className="w-3.5 h-3.5" /> },
                  ]}
                  value={config.duration} onChange={(v) => setConfig({ ...config, duration: v })} />
              </div>
            )}
            <div className="flex items-center gap-3 px-4 py-3">
              <button onClick={() => setShowConfig(!showConfig)} className={cn(
                'shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300',
                showConfig ? 'bg-primary/15 text-primary rotate-90' : 'text-text-muted hover:text-text-secondary hover:bg-surface-soft',
              )} title="Configure interview">
                <Settings2 className="w-4.5 h-4.5" />
              </button>
              <div className="flex-1 text-body text-text-muted select-none flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/8 text-primary text-caption">{config.type}</span>
                <span>·</span>
                <span>{config.difficulty}</span>
                <span>·</span>
                <span>{config.duration}min</span>
              </div>
              <button onClick={startInterview} className={cn(
                'shrink-0 flex items-center gap-2 h-10 px-5 rounded-xl font-medium text-body transition-all duration-300',
                'artem-gradient text-white shadow-[0_4px_15px_rgba(59,130,246,0.25)]',
                'hover:shadow-[0_4px_25px_rgba(59,130,246,0.35)] hover:scale-[1.03] active:scale-[0.97]',
              )}>
                <Zap className="w-4 h-4" />Start
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =================== LOADING =================== */
  if (phase === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-5 relative">
        <FloatingParticles />
        <div className="animate-scale-in"><AIOrb size="md" /></div>
        <div className="text-center space-y-2 animate-slide-up">
          <h2 className="text-heading-2 text-text-primary">Preparing Your Interview</h2>
          <p className="text-body text-text-secondary">Generating personalized {config.type} questions...</p>
        </div>
        <TypingDots />
      </div>
    );
  }

  /* =================== FINISHING =================== */
  if (phase === 'finishing') {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto flex flex-col gap-4">
            {renderMessages()}
            <div className="flex justify-center mt-6">
              <div className="flex flex-col items-center gap-3 animate-scale-in">
                <AIOrb size="sm" />
                <p className="text-body text-text-secondary">Generating your performance report...</p>
                <TypingDots />
              </div>
            </div>
            <div ref={chatEndRef} />
          </div>
        </div>
      </div>
    );
  }

  /* =================== COMPLETE =================== */
  if (phase === 'complete') {
    const finalScore = report?.overallScore ?? 0;
    const dims = report?.dimensions ?? {};
    const str = report?.strengths ?? [];
    const wk = report?.weaknesses ?? [];
    const recs = report?.recommendations ?? [];
    const perf = report?.performanceLevel ?? 'N/A';
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-6 relative">
          <div className="max-w-3xl mx-auto flex flex-col gap-4">
            {renderMessages()}
            <ChatBubble type="ai">
              <div className="space-y-4">
                <div className="flex items-center gap-2"><AIBadge /><span className="text-caption font-medium text-ai-text">Interview Report</span></div>
                <div className="flex items-center gap-5">
                  <CircularProgress value={finalScore} size={90} strokeWidth={7} label="overall" />
                  <div>
                    <p className={cn('text-heading-1 font-bold', getReadinessClass(finalScore))}>{finalScore}</p>
                    <p className="text-body text-text-secondary">{perf}</p>
                  </div>
                </div>
                {Object.keys(dims).length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(dims).map(([l, s]) => (
                      <div key={l} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-soft/30 border border-border/15 transition-colors hover:bg-surface-soft/50">
                        <span className="text-body-sm text-text-secondary">{l}</span>
                        <span className={cn('text-body-sm font-bold', getReadinessClass(s as number))}>{s as number}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-1.5">
                  {str.map((s, i) => <div key={`s-${i}`} className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" /><span className="text-body-sm text-text-primary">{s}</span></div>)}
                  {wk.map((w, i) => <div key={`w-${i}`} className="flex items-start gap-2"><XCircle className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" /><span className="text-body-sm text-text-primary">{w}</span></div>)}
                </div>
                {recs.length > 0 && (
                  <div className="p-3 rounded-xl bg-ai-bg/40 border border-ai-border/25 space-y-1.5">
                    <p className="text-caption font-medium text-ai-text">✦ Recommendations</p>
                    {recs.map((r, i) => <div key={i} className="flex items-start gap-2"><Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" /><span className="text-body-sm text-text-primary">{r}</span></div>)}
                  </div>
                )}
              </div>
            </ChatBubble>
            <div ref={chatEndRef} />
          </div>
          <ScrollIndicator show={showScrollBtn} onClick={scrollToBottom} />
        </div>
        <div className="shrink-0 p-4 border-t border-border/15">
          <div className="max-w-3xl mx-auto flex gap-3">
            <button onClick={resetInterview}
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border border-border/40 bg-surface/50 backdrop-blur-sm text-text-primary font-medium transition-all duration-200 hover:bg-surface-soft hover:border-border-strong hover:scale-[1.01] active:scale-[0.99]">
              <RotateCcw className="w-4 h-4" />New Interview
            </button>
            <button onClick={() => window.location.href = '/progress'}
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl artem-gradient text-white font-medium transition-all duration-200 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] shadow-[0_4px_15px_rgba(59,130,246,0.25)]">
              <MessageSquare className="w-4 h-4" />View Progress
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =================== ACTIVE / PROCESSING / FEEDBACK =================== */
  const charCount = answer.length;
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Top progress bar */}
      <div className="shrink-0 px-4 py-2.5 border-b border-border/20 bg-surface/20 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="flex items-center gap-2">
            <AIOrb size="sm" pulsing={phase === 'processing'} />
            <div className="ml-0.5">
              <p className="text-body-sm font-medium text-text-primary">{config.type} Interview</p>
              <p className="text-caption text-text-muted">
                {phase === 'processing' ? 'Analyzing...' : `Question ${currentQuestion} of ${totalQuestions}`}
              </p>
            </div>
          </div>
          <div className="flex-1"><ProgressBar value={currentQuestion} max={totalQuestions} size="sm" color="var(--primary)" /></div>
          <Badge variant="default" size="sm">{config.difficulty}</Badge>
        </div>
      </div>

      {/* Chat area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-5 relative">
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          {renderMessages()}
          {phase === 'processing' && (
            <ChatBubble type="ai" animate>
              <div className="flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <span className="text-text-secondary text-body-sm">Analyzing your response</span>
                <TypingDots />
              </div>
            </ChatBubble>
          )}
          <div ref={chatEndRef} />
        </div>
        <ScrollIndicator show={showScrollBtn} onClick={scrollToBottom} />
      </div>

      {/* Bottom input */}
      <div className="shrink-0 p-3 border-t border-border/15">
        <div className="max-w-3xl mx-auto">
          {phase === 'feedback' ? (
            <button onClick={nextQuestion} className={cn(
              'w-full flex items-center justify-center gap-2.5 h-12 rounded-2xl font-medium text-body transition-all duration-300',
              'artem-gradient text-white shadow-[0_4px_15px_rgba(59,130,246,0.25)]',
              'hover:shadow-[0_4px_25px_rgba(59,130,246,0.35)] hover:scale-[1.01] active:scale-[0.99]',
            )}>
              {currentQuestion >= totalQuestions
                ? <><CheckCircle className="w-4.5 h-4.5" />View Final Report</>
                : <><ChevronRight className="w-4.5 h-4.5" />Next Question</>}
            </button>
          ) : (
            <div className={cn(
              'rounded-2xl border backdrop-blur-xl transition-all duration-300',
              inputFocused ? 'bg-surface/80 border-primary/30 shadow-[0_0_20px_rgba(59,130,246,0.08)]' : 'bg-surface/60 border-border/30',
              phase === 'processing' && 'opacity-40 pointer-events-none',
            )}>
              <div className="flex items-end gap-2 px-4 py-2.5">
                <textarea ref={inputRef} value={answer} onChange={handleInputResize} onKeyDown={handleKeyDown}
                  onFocus={() => setInputFocused(true)} onBlur={() => setInputFocused(false)}
                  placeholder="Type your answer... (Shift+Enter for new line)"
                  rows={1} disabled={phase === 'processing'}
                  className="flex-1 bg-transparent text-body text-text-primary placeholder:text-text-muted resize-none outline-none max-h-40 py-1.5"
                />
                {charCount > 0 && <span className="text-caption text-text-muted shrink-0 pb-2">{charCount}</span>}
                <button onClick={submitAnswer} disabled={!answer.trim() || phase === 'processing'}
                  className={cn(
                    'shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 mb-0.5',
                    answer.trim()
                      ? 'artem-gradient text-white shadow-[0_2px_10px_rgba(59,130,246,0.25)] hover:shadow-[0_2px_15px_rgba(59,130,246,0.35)] hover:scale-105 active:scale-95'
                      : 'bg-surface-soft text-text-muted cursor-not-allowed',
                  )}>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              {error && (
                <div className="px-4 pb-2">
                  <div className="flex items-center gap-2 text-error text-caption"><XCircle className="h-3.5 w-3.5 shrink-0" />{error}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIInterview;
