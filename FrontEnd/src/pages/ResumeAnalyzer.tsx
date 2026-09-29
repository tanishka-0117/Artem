import React, { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { cn, getReadinessClass } from '@/lib/utils';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { AIBadge, Badge } from '@/components/ui/Badge';
import { CircularProgress } from '@/components/ui/ProgressBar';
import { LoadingState, ErrorState } from '@/components/ui/StateDisplay';
import {
  Upload, FileText, AlertTriangle, Sparkles, MessageSquare,
  ChevronDown, ChevronUp, Trash2, Download, File, X, CheckCircle2,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types matching the expanded backend model                         */
/* ------------------------------------------------------------------ */
interface WeakDescription {
  section: string;
  issue: string;
  suggestion: string;
}

interface ResumeData {
  _id: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  skills: string[];
  missingSkills: string[];
  weakDescriptions: WeakDescription[];
  grammarIssues: number;
  suggestions: string[];
  interviewQuestions: string[];
  resumeScore: number;
  atsScore: number;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ================================================================== */
/*  MAIN COMPONENT                                                    */
/* ================================================================== */
const ResumeAnalyzer: React.FC = () => {
  const queryClient = useQueryClient();

  /* ── Fetch latest resume ────────────────────────────────────────── */
  const {
    data: resumesResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['resumes'],
    queryFn: async () => {
      const res = await api.get('/resumes');
      return res.data;
    },
  });

  const resumes: ResumeData[] = resumesResponse?.data || [];
  const latestResume = resumes.length > 0 ? resumes[0] : null;

  /* ── Local UI state ─────────────────────────────────────────────── */
  const [showUploader, setShowUploader] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['skills', 'missing']);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section],
    );
  };

  /* ── Upload mutation ────────────────────────────────────────────── */
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (event.total) {
            setUploadProgress(Math.round((event.loaded / event.total) * 100));
          }
        },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      setShowUploader(false);
      setSelectedFile(null);
      setUploadProgress(0);
    },
    onError: () => {
      setUploadProgress(0);
    },
  });

  /* ── Delete mutation ────────────────────────────────────────────── */
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/resumes/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
  });

  /* ── Drag and drop handlers ─────────────────────────────────────── */
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateAndSetFile = (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a PDF, DOC, or DOCX file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File must be under 5 MB.');
      return;
    }
    setSelectedFile(file);
  };

  /* ── Loading / Error ────────────────────────────────────────────── */
  if (isLoading) return <LoadingState text="Loading resume data..." />;
  if (isError) return <ErrorState message="Failed to load resume data." onRetry={() => refetch()} />;

  /* ================================================================ */
  /*  UPLOAD VIEW — shown when no resume exists or user clicks Upload */
  /* ================================================================ */
  if (!latestResume || showUploader) {
    return (
      <div className="max-w-xl mx-auto animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-heading-1 text-text-primary">Resume Analyzer</h1>
          <p className="text-body text-text-secondary mt-1">
            Upload your resume for AI-powered analysis and insights
          </p>
        </div>

        {/* Back button if they already have a resume */}
        {latestResume && (
          <div className="mb-4">
            <button
              onClick={() => { setShowUploader(false); setSelectedFile(null); }}
              className="text-body-sm text-primary hover:text-primary-hover font-medium transition-colors"
            >
              ← Back to analysis
            </button>
          </div>
        )}

        <Card padding="none">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !selectedFile && fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 m-5',
              dragActive
                ? 'border-primary bg-primary/5'
                : selectedFile
                  ? 'border-success/50 bg-success/5'
                  : 'border-border hover:border-primary/50 cursor-pointer',
            )}
          >
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* No file selected */}
            {!selectedFile && (
              <>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-heading-3 text-text-primary mb-1">
                  {dragActive ? 'Drop your resume here' : 'Upload Resume'}
                </h3>
                <p className="text-body-sm text-text-secondary mb-4">
                  Drag and drop or click to select
                </p>
                <p className="text-caption text-text-muted">PDF, DOC, DOCX — Max 5 MB</p>
              </>
            )}

            {/* File selected — show preview */}
            {selectedFile && (
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-7 w-7 text-success" />
                </div>
                <div className="flex items-center justify-center gap-3">
                  <File className="h-5 w-5 text-text-muted shrink-0" />
                  <div className="text-left">
                    <p className="text-body-sm font-medium text-text-primary truncate max-w-[280px]">
                      {selectedFile.name}
                    </p>
                    <p className="text-caption text-text-muted">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                    className="p-1 rounded-md hover:bg-surface-soft text-text-muted hover:text-text-primary transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Upload progress */}
                {uploadMutation.isPending && (
                  <div className="w-full max-w-xs mx-auto">
                    <div className="h-1.5 bg-surface-soft rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-caption text-text-muted mt-1.5">
                      Uploading… {uploadProgress}%
                    </p>
                  </div>
                )}

                {/* Error message */}
                {uploadMutation.isError && (
                  <p className="text-body-sm text-error">
                    {(uploadMutation.error as any)?.response?.data?.error?.message || 'Upload failed. Please try again.'}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          {selectedFile && (
            <div className="px-5 pb-5 flex gap-3 justify-center">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setSelectedFile(null)}
                disabled={uploadMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => uploadMutation.mutate(selectedFile)}
                isLoading={uploadMutation.isPending}
                leftIcon={<Upload className="h-4 w-4" />}
              >
                {uploadMutation.isPending ? 'Analyzing…' : 'Upload & Analyze'}
              </Button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  /* ================================================================ */
  /*  ANALYSIS VIEW — display results from the database               */
  /* ================================================================ */
  const r = latestResume;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-1 text-text-primary">Resume Analyzer</h1>
          <p className="text-body text-text-secondary mt-1">
            AI-powered resume analysis and improvement suggestions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            leftIcon={<Upload className="h-4 w-4" />}
            onClick={() => setShowUploader(true)}
          >
            Upload New
          </Button>
        </div>
      </div>

      {/* File info banner */}
      <div className="card-base px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <p className="text-body-sm font-medium text-text-primary">{r.fileName}</p>
            <p className="text-caption text-text-muted">
              {formatFileSize(r.fileSize)} • Uploaded {new Date(r.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={r.fileUrl}
            download
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-soft transition-colors"
            title="Download resume"
          >
            <Download className="h-4 w-4" />
          </a>
          <button
            onClick={() => {
              if (confirm('Delete this resume and its analysis?')) {
                deleteMutation.mutate(r._id);
              }
            }}
            className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors"
            title="Delete resume"
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card padding="lg" className="flex flex-col items-center text-center">
          <p className="text-body-sm text-text-secondary mb-3">Resume Score</p>
          <CircularProgress value={r.resumeScore} size={110} strokeWidth={8} />
          <p className={cn('text-body-sm font-medium mt-2', getReadinessClass(r.resumeScore))}>
            {r.resumeScore >= 80 ? 'Strong' : r.resumeScore >= 60 ? 'Good' : 'Needs Work'}
          </p>
        </Card>
        <Card padding="lg" className="flex flex-col items-center text-center">
          <p className="text-body-sm text-text-secondary mb-3">ATS Score</p>
          <CircularProgress value={r.atsScore} size={110} strokeWidth={8} />
          <p className={cn('text-body-sm font-medium mt-2', getReadinessClass(r.atsScore))}>
            ATS Compatible
          </p>
        </Card>
        <Card padding="lg" className="flex flex-col items-center text-center">
          <p className="text-body-sm text-text-secondary mb-3">Issues Found</p>
          <div className="flex items-center gap-4 mt-4">
            <div className="text-center">
              <p className="text-heading-2 font-bold text-warning">{r.weakDescriptions.length}</p>
              <p className="text-caption text-text-muted">Weak</p>
            </div>
            <div className="text-center">
              <p className="text-heading-2 font-bold text-error">{r.missingSkills.length}</p>
              <p className="text-caption text-text-muted">Missing</p>
            </div>
            <div className="text-center">
              <p className="text-heading-2 font-bold text-info">{r.grammarIssues}</p>
              <p className="text-caption text-text-muted">Grammar</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Detected Skills */}
      <Card padding="lg">
        <button onClick={() => toggleSection('skills')} className="w-full flex items-center justify-between">
          <CardTitle>Detected Skills</CardTitle>
          {expandedSections.includes('skills') ? (
            <ChevronUp className="h-4 w-4 text-text-muted" />
          ) : (
            <ChevronDown className="h-4 w-4 text-text-muted" />
          )}
        </button>
        {expandedSections.includes('skills') && (
          <div className="flex flex-wrap gap-2 mt-4">
            {r.skills.map((skill) => (
              <Badge key={skill} variant="info" size="md">{skill}</Badge>
            ))}
          </div>
        )}
      </Card>

      {/* Missing Skills */}
      <Card padding="lg">
        <button onClick={() => toggleSection('missing')} className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Missing Skills</CardTitle>
            <AIBadge />
          </div>
          {expandedSections.includes('missing') ? (
            <ChevronUp className="h-4 w-4 text-text-muted" />
          ) : (
            <ChevronDown className="h-4 w-4 text-text-muted" />
          )}
        </button>
        {expandedSections.includes('missing') && (
          <div className="flex flex-wrap gap-2 mt-4">
            {r.missingSkills.map((skill) => (
              <Badge key={skill} variant="warning" size="md">{skill}</Badge>
            ))}
          </div>
        )}
      </Card>

      {/* Weak Descriptions */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Weak Descriptions</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {r.weakDescriptions.map((wd, i) => (
            <div key={i} className="p-4 bg-surface-soft rounded-lg border border-border">
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                <p className="text-body-sm font-medium text-text-primary">{wd.section}</p>
              </div>
              <p className="text-body-sm text-text-secondary mb-2 pl-6">{wd.issue}</p>
              <div className="pl-6 card-ai p-3 rounded-lg">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="h-3 w-3 text-ai-text" />
                  <span className="text-caption font-medium text-ai-text">Suggestion</span>
                </div>
                <p className="text-body-sm text-text-primary">{wd.suggestion}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Improvement Suggestions */}
      <Card padding="lg" variant="ai">
        <div className="flex items-center gap-2 mb-4">
          <AIBadge />
          <CardTitle>Improvement Suggestions</CardTitle>
        </div>
        <div className="space-y-3">
          {r.suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-caption font-bold text-primary">{i + 1}</span>
              </div>
              <p className="text-body-sm text-text-primary">{s}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Interview Questions */}
      <Card padding="lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Resume-Based Interview Questions</CardTitle>
            <AIBadge />
          </div>
        </CardHeader>
        <div className="space-y-2">
          {r.interviewQuestions.map((q, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-soft transition-colors">
              <MessageSquare className="h-4 w-4 text-text-muted shrink-0" />
              <p className="text-body-sm text-text-primary">{q}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ResumeAnalyzer;
