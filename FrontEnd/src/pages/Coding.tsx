import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Editor from '@monaco-editor/react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { DifficultyBadge, Badge, AIBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/StateDisplay';
import {
  Play, Send, CheckCircle, XCircle, Clock, Cpu, Lightbulb,
  ArrowLeft, Search, Filter, ChevronDown, Tag, Hash,
  FileText, BarChart3, Code2, Terminal, RotateCcw,
  Maximize2, Minimize2, GripVertical,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
interface Problem {
  _id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  constraints: string[];
  examples: { input: string; output: string; explanation?: string }[];
  acceptanceRate?: number;
}

/* ------------------------------------------------------------------ */
/*  Starter code templates                                            */
/* ------------------------------------------------------------------ */
const starterCode: Record<string, string> = {
  javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function solution(nums, target) {
  // Write your solution here

}`,
  python: `class Solution:
    def solve(self, nums: list[int], target: int) -> list[int]:
        # Write your solution here
        pass`,
  java: `class Solution {
    public int[] solve(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }
}`,
  cpp: `class Solution {
public:
    vector<int> solve(vector<int>& nums, int target) {
        // Write your solution here
        return {};
    }
};`,
};

const languageMap: Record<string, string> = {
  javascript: 'JavaScript',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
};

const monacoLanguageMap: Record<string, string> = {
  javascript: 'javascript',
  python: 'python',
  java: 'java',
  cpp: 'cpp',
};

/* ------------------------------------------------------------------ */
/*  Difficulty colour helpers                                          */
/* ------------------------------------------------------------------ */
const difficultyColor = (d: string) =>
  d === 'Easy' ? 'text-success' : d === 'Medium' ? 'text-warning' : 'text-error';

const difficultyBg = (d: string) =>
  d === 'Easy'
    ? 'bg-success/8 text-success border-success/20'
    : d === 'Medium'
      ? 'bg-warning/8 text-warning border-warning/20'
      : 'bg-error/8 text-error border-error/20';

/* ================================================================== */
/*  MAIN COMPONENT                                                    */
/* ================================================================== */
const Coding: React.FC = () => {
  /* ── API ────────────────────────────────────────────────────────── */
  const { data: problemsData, isLoading } = useQuery({
    queryKey: ['problems'],
    queryFn: async () => {
      const res = await api.get('/problems');
      return res.data;
    },
  });

  const problems: Problem[] = problemsData?.data || [];

  /* ── View state ─────────────────────────────────────────────────── */
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  /* ── Editor state ───────────────────────────────────────────────── */
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(starterCode.javascript);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'submissions'>('description');
  const [bottomTab, setBottomTab] = useState<'testcase' | 'result'>('testcase');
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [isEditorFullscreen, setIsEditorFullscreen] = useState(false);

  /* ── Resizable splitter ─────────────────────────────────────────── */
  const [splitPercent, setSplitPercent] = useState(42);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onMouseDown = useCallback(() => {
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPercent(Math.min(Math.max(pct, 25), 65));
    };
    const onMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  /* ── Submission ─────────────────────────────────────────────────── */
  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/problems/submissions', {
        problemId: selectedProblem?._id,
        language: languageMap[language],
        code,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setSubmitStatus(data.data?.status || 'Pending');
      setShowResults(true);
      setBottomTab('result');
    },
  });

  /* ── Problem selection handler ──────────────────────────────────── */
  const openProblem = (problem: Problem) => {
    setSelectedProblem(problem);
    setCode(starterCode[language]);
    setShowResults(false);
    setSubmitStatus(null);
    setActiveTab('description');
    setBottomTab('testcase');
  };

  /* ── Filters ────────────────────────────────────────────────────── */
  const categories = ['All', ...Array.from(new Set(problems.map((p) => p.category)))];

  const filteredProblems = problems.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  /* ── Stats ──────────────────────────────────────────────────────── */
  const stats = {
    total: problems.length,
    easy: problems.filter((p) => p.difficulty === 'Easy').length,
    medium: problems.filter((p) => p.difficulty === 'Medium').length,
    hard: problems.filter((p) => p.difficulty === 'Hard').length,
  };

  /* ── Mock test results ──────────────────────────────────────────── */
  const testResults = [
    { id: 1, input: 'nums = [2,7,11,15], target = 9', expected: '[0,1]', output: '[0,1]', passed: true, time: '2ms' },
    { id: 2, input: 'nums = [3,2,4], target = 6', expected: '[1,2]', output: '[1,2]', passed: true, time: '1ms' },
    { id: 3, input: 'nums = [3,3], target = 6', expected: '[0,1]', output: '[0,1]', passed: true, time: '1ms' },
  ];

  /* ── Loading state ──────────────────────────────────────────────── */
  if (isLoading) return <LoadingState text="Loading problems..." />;

  /* ================================================================ */
  /*  VIEW 1 — PROBLEM LIST (LeetCode-style table)                    */
  /* ================================================================ */
  if (!selectedProblem) {
    return (
      <div className="animate-fade-in max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-heading-1 text-text-primary mb-1">Coding Problems</h1>
          <p className="text-body text-text-secondary">
            Sharpen your skills with curated coding challenges
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'text-primary', bg: 'bg-primary/8' },
            { label: 'Easy', value: stats.easy, color: 'text-success', bg: 'bg-success/8' },
            { label: 'Medium', value: stats.medium, color: 'text-warning', bg: 'bg-warning/8' },
            { label: 'Hard', value: stats.hard, color: 'text-error', bg: 'bg-error/8' },
          ].map((s) => (
            <div
              key={s.label}
              className={cn('card-base px-4 py-3 flex items-center gap-3')}
            >
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-heading-3 font-bold', s.bg, s.color)}>
                {s.value}
              </div>
              <span className="text-body-sm text-text-secondary font-medium">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="card-base p-3 mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 bg-surface-soft border border-border rounded-lg text-body-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          {/* Difficulty filter */}
          <div className="flex items-center gap-1.5">
            {['All', 'Easy', 'Medium', 'Hard'].map((d) => (
              <button
                key={d}
                onClick={() => setDifficultyFilter(d)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-body-sm font-medium transition-all duration-200',
                  difficultyFilter === d
                    ? d === 'Easy'
                      ? 'bg-success/15 text-success'
                      : d === 'Medium'
                        ? 'bg-warning/15 text-warning'
                        : d === 'Hard'
                          ? 'bg-error/15 text-error'
                          : 'bg-primary/15 text-primary'
                    : 'text-text-muted hover:text-text-secondary hover:bg-surface-soft',
                )}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 px-3 bg-surface-soft border border-border rounded-lg text-body-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 10px center',
              paddingRight: '2rem',
            }}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>

        {/* Problem Table */}
        <div className="card-base overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_2.5fr_1fr_1fr_1fr] gap-4 px-5 py-3 bg-surface-soft border-b border-border text-caption text-text-muted font-semibold uppercase tracking-wider">
            <span>#</span>
            <span>Title</span>
            <span>Difficulty</span>
            <span>Category</span>
            <span className="text-right">Acceptance</span>
          </div>

          {/* Table body */}
          <div className="divide-y divide-border">
            {filteredProblems.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <Code2 className="h-10 w-10 text-text-muted mx-auto mb-3" />
                <p className="text-body text-text-secondary">No problems match your filters</p>
                <p className="text-body-sm text-text-muted mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredProblems.map((problem, idx) => (
                <button
                  key={problem._id}
                  onClick={() => openProblem(problem)}
                  className="w-full grid grid-cols-[1fr_2.5fr_1fr_1fr_1fr] gap-4 px-5 py-3.5 text-left transition-all duration-200 hover:bg-surface-soft/70 group"
                >
                  {/* Number */}
                  <span className="text-body-sm text-text-muted font-mono tabular-nums">
                    {idx + 1}
                  </span>

                  {/* Title */}
                  <span className="text-body-sm font-medium text-text-primary group-hover:text-primary transition-colors truncate">
                    {problem.title}
                  </span>

                  {/* Difficulty */}
                  <span>
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded text-[0.6875rem] font-semibold border',
                        difficultyBg(problem.difficulty),
                      )}
                    >
                      {problem.difficulty}
                    </span>
                  </span>

                  {/* Category */}
                  <span className="text-body-sm text-text-secondary truncate">
                    {problem.category}
                  </span>

                  {/* Acceptance */}
                  <span className="text-body-sm text-text-secondary text-right tabular-nums">
                    {problem.acceptanceRate ?? '—'}%
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 bg-surface-soft border-t border-border flex items-center justify-between">
            <span className="text-caption text-text-muted">
              Showing {filteredProblems.length} of {problems.length} problems
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  VIEW 2 — PROBLEM DETAIL + EDITOR (LeetCode split-pane)         */
  /* ================================================================ */
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col -mx-4 lg:-mx-6 -my-6 animate-fade-in">
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedProblem(null)}
            className="flex items-center gap-1.5 text-body-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Problem List</span>
          </button>
          <div className="h-4 w-px bg-border" />
          <h2 className="text-body font-semibold text-text-primary truncate max-w-[300px]">
            {selectedProblem.title}
          </h2>
          <DifficultyBadge difficulty={selectedProblem.difficulty} />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-body-sm text-text-muted">
            <Clock className="h-3.5 w-3.5" />
            <span>15:00</span>
          </div>
        </div>
      </div>

      {/* ── Split pane ──────────────────────────────────────────────── */}
      <div ref={containerRef} className="flex-1 flex min-h-0">
        {/* LEFT — Description panel */}
        {!isEditorFullscreen && (
          <div
            className="flex flex-col bg-surface border-r border-border overflow-hidden"
            style={{ width: `${splitPercent}%` }}
          >
            {/* Left tabs */}
            <div className="flex items-center border-b border-border px-1 shrink-0">
              {[
                { id: 'description' as const, label: 'Description', icon: <FileText className="h-3.5 w-3.5" /> },
                { id: 'submissions' as const, label: 'Submissions', icon: <BarChart3 className="h-3.5 w-3.5" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2.5 text-body-sm font-medium border-b-2 -mb-px transition-colors',
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-muted hover:text-text-secondary',
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Left content — scrollable */}
            <div className="flex-1 overflow-y-auto p-5">
              {activeTab === 'description' && (
                <div className="animate-fade-in">
                  {/* Title + meta */}
                  <h2 className="text-heading-2 text-text-primary mb-2">{selectedProblem.title}</h2>
                  <div className="flex flex-wrap items-center gap-2 mb-5">
                    <DifficultyBadge difficulty={selectedProblem.difficulty} />
                    <Badge variant="outline">{selectedProblem.category}</Badge>
                    {selectedProblem.acceptanceRate != null && (
                      <span className="text-caption text-text-muted">
                        {selectedProblem.acceptanceRate}% acceptance
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <div className="text-body text-text-secondary leading-relaxed whitespace-pre-line mb-6">
                    {selectedProblem.description}
                  </div>

                  {/* Examples */}
                  <div className="space-y-3 mb-6">
                    {selectedProblem.examples.map((ex, i) => (
                      <div key={i} className="bg-surface-soft rounded-lg p-4 border border-border/50">
                        <p className="text-caption font-semibold text-text-primary mb-2">Example {i + 1}</p>
                        <div className="space-y-1 font-mono text-body-sm">
                          <p className="text-text-secondary">
                            <span className="text-text-primary font-semibold">Input: </span>
                            {ex.input}
                          </p>
                          <p className="text-text-secondary">
                            <span className="text-text-primary font-semibold">Output: </span>
                            {ex.output}
                          </p>
                        </div>
                        {ex.explanation && (
                          <p className="text-body-sm text-text-muted mt-2 pl-0 border-l-2 border-border ml-0 pl-3">
                            {ex.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Constraints */}
                  {selectedProblem.constraints?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-body-sm font-semibold text-text-primary mb-2">Constraints</h4>
                      <ul className="space-y-1.5">
                        {selectedProblem.constraints.map((c, i) => (
                          <li key={i} className="text-body-sm text-text-secondary flex items-start gap-2">
                            <span className="text-text-muted mt-0.5">•</span>
                            <code className="text-caption bg-surface-soft px-1.5 py-0.5 rounded border border-border/50 font-mono">
                              {c}
                            </code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* AI hint */}
                  <div className="card-ai p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-1.5">
                      <AIBadge />
                      <span className="text-body-sm font-medium text-ai-text">AI Hint Available</span>
                    </div>
                    <p className="text-caption text-text-muted mb-2">
                      Get a contextual hint without revealing the full solution
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-ai-text"
                      leftIcon={<Lightbulb className="h-3.5 w-3.5" />}
                    >
                      Get Hint
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'submissions' && (
                <div className="animate-fade-in">
                  <p className="text-body text-text-muted py-8 text-center">
                    No submissions yet. Submit your solution to see results here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DRAG HANDLE */}
        {!isEditorFullscreen && (
          <div
            onMouseDown={onMouseDown}
            className="w-1.5 bg-border hover:bg-primary/40 cursor-col-resize transition-colors duration-150 flex items-center justify-center shrink-0 group"
          >
            <GripVertical className="h-4 w-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}

        {/* RIGHT — Editor panel (always dark) */}
        <div
          className="flex-1 flex flex-col min-w-0"
          style={{ backgroundColor: '#0F172A' }}
        >
          {/* Editor toolbar */}
          <div
            className="flex items-center justify-between px-4 py-2 border-b shrink-0"
            style={{ borderColor: '#1E293B' }}
          >
            <div className="flex items-center gap-3">
              {/* Language selector */}
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  setCode(starterCode[e.target.value]);
                }}
                className="h-8 px-2.5 text-body-sm rounded-md border focus:outline-none focus:ring-1 focus:ring-primary"
                style={{ backgroundColor: '#1E293B', color: '#E2E8F0', borderColor: '#334155' }}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>

              {/* Reset code */}
              <button
                onClick={() => setCode(starterCode[language])}
                className="p-1.5 rounded-md transition-colors hover:bg-[#1E293B]"
                style={{ color: '#94A3B8' }}
                title="Reset code"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              {/* Fullscreen toggle */}
              <button
                onClick={() => setIsEditorFullscreen(!isEditorFullscreen)}
                className="p-1.5 rounded-md transition-colors hover:bg-[#1E293B]"
                style={{ color: '#94A3B8' }}
                title={isEditorFullscreen ? 'Exit fullscreen' : 'Fullscreen editor'}
              >
                {isEditorFullscreen ? (
                  <Minimize2 className="h-3.5 w-3.5" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowResults(true);
                  setBottomTab('result');
                }}
                leftIcon={<Play className="h-3.5 w-3.5" />}
                className="border-[#334155] text-[#E2E8F0] bg-[#1E293B] hover:bg-[#334155]"
              >
                Run
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => submitMutation.mutate()}
                leftIcon={<Send className="h-3.5 w-3.5" />}
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? 'Submitting…' : 'Submit'}
              </Button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={monacoLanguageMap[language]}
              value={code}
              onChange={(val) => setCode(val || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                lineNumbers: 'on',
                renderLineHighlight: 'line',
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                suggestOnTriggerCharacters: true,
                bracketPairColorization: { enabled: true },
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
              }}
            />
          </div>

          {/* Bottom panel — Test Cases / Results */}
          <div
            className="border-t shrink-0"
            style={{
              borderColor: '#1E293B',
              maxHeight: showResults ? '240px' : '0px',
              overflow: 'hidden',
              transition: 'max-height 200ms ease',
            }}
          >
            {/* Bottom tabs */}
            <div
              className="flex items-center gap-0 px-2 border-b"
              style={{ borderColor: '#1E293B' }}
            >
              {[
                { id: 'testcase' as const, label: 'Test Cases', icon: <Terminal className="h-3 w-3" /> },
                { id: 'result' as const, label: 'Result', icon: <CheckCircle className="h-3 w-3" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setBottomTab(tab.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 text-[0.75rem] font-medium border-b -mb-px transition-colors',
                    bottomTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-[#64748B] hover:text-[#94A3B8]',
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}

              {showResults && (
                <div className="ml-auto pr-1">
                  <Badge variant="success" size="sm">3/3 Passed</Badge>
                </div>
              )}
            </div>

            {/* Results content */}
            <div className="overflow-y-auto" style={{ maxHeight: '190px' }}>
              {bottomTab === 'result' && (
                <div>
                  <div
                    className="px-4 py-2.5 flex items-center gap-3"
                    style={{ borderBottom: '1px solid #1E293B' }}
                  >
                    <span className="text-body-sm font-medium" style={{ color: '#E2E8F0' }}>
                      Test Results
                    </span>
                    <div className="ml-auto flex items-center gap-3 text-caption" style={{ color: '#94A3B8' }}>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> 4ms
                      </span>
                      <span className="flex items-center gap-1">
                        <Cpu className="h-3 w-3" /> 42.1 MB
                      </span>
                    </div>
                  </div>
                  <div className="divide-y" style={{ borderColor: '#1E293B' }}>
                    {testResults.map((t) => (
                      <div key={t.id} className="px-4 py-2.5 flex items-center gap-3">
                        {t.passed ? (
                          <CheckCircle className="h-4 w-4 shrink-0" style={{ color: '#34D399' }} />
                        ) : (
                          <XCircle className="h-4 w-4 shrink-0" style={{ color: '#F87171' }} />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-body-sm truncate" style={{ color: '#E2E8F0' }}>
                            Test {t.id}: {t.input}
                          </p>
                        </div>
                        <span className="text-caption" style={{ color: '#94A3B8' }}>
                          {t.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {bottomTab === 'testcase' && (
                <div className="p-4">
                  {selectedProblem.examples.map((ex, i) => (
                    <div key={i} className="mb-3">
                      <p className="text-[0.6875rem] font-semibold mb-1" style={{ color: '#94A3B8' }}>
                        Case {i + 1}
                      </p>
                      <div
                        className="rounded-md p-2.5 font-mono text-body-sm"
                        style={{ backgroundColor: '#1E293B', color: '#E2E8F0' }}
                      >
                        {ex.input}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom toggle for test panel */}
          {!showResults && (
            <button
              onClick={() => setShowResults(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 border-t text-caption font-medium transition-colors"
              style={{ borderColor: '#1E293B', color: '#64748B' }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#94A3B8')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#64748B')}
            >
              <Terminal className="h-3 w-3" />
              Console
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Coding;
