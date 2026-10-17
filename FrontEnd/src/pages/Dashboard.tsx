import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { cn, getReadinessClass, formatTimeAgo } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { AIBadge } from '@/components/ui/Badge';
import { CircularProgress, ProgressBar } from '@/components/ui/ProgressBar';
import { ScoreCard, LoadingState } from '@/components/ui/StateDisplay';
import {
  Sparkles, BookOpen, Code2, Target, TrendingUp,
  MessageSquare, FileText, ChevronRight, CheckCircle, Clock,
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

const activityIcons: Record<string, React.ReactNode> = {
  interview: <MessageSquare className="h-4 w-4" />,
  coding: <Code2 className="h-4 w-4" />,
  resume: <FileText className="h-4 w-4" />,
};

const Dashboard: React.FC = () => {
  const user = useAuthStore((s) => s.user);

  // Fetch analytics (progress + interviews + submissions)
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res = await api.get('/progress/analytics');
      return res.data;
    },
  });

  // Fetch recent interviews for activity feed
  const { data: interviewsData } = useQuery({
    queryKey: ['interviews', 'recent'],
    queryFn: async () => {
      const res = await api.get('/interviews?limit=5');
      return res.data;
    },
  });

  // Fetch progress breakdown for skill radar
  const { data: progressData } = useQuery({
    queryKey: ['progress'],
    queryFn: async () => {
      const res = await api.get('/progress');
      return res.data;
    },
  });

  const analytics = analyticsData?.data || {
    questionsAttempted: 0,
    interviewsCompleted: 0,
    codingProblemsSolved: 0,
    averageInterviewScore: 0,
    topicPerformance: [],
    recentInterviews: [],
  };

  // Build skill radar from topic performance data
  const skillRadarData = (analytics.topicPerformance || []).map((tp: any) => ({
    skill: tp.topic,
    score: tp.score || 0,
    fullMark: 100,
  }));

  // Build recent activity from interview data
  const recentActivity = (interviewsData?.data || []).slice(0, 5).map((interview: any) => ({
    id: interview._id,
    type: 'interview' as const,
    title: `${interview.type} Interview — ${interview.difficulty}`,
    score: typeof interview.score === 'number' ? interview.score : 0,
    date: interview.createdAt,
  }));

  // Build performance trend from recent interviews
  const recentInterviewScores = (analytics.recentInterviews || [])
    .reverse()
    .map((interview: any, i: number) => ({
      date: `#${i + 1}`,
      score: typeof interview.score === 'number' ? interview.score : 0,
    }));

  const readinessScore = analytics.averageInterviewScore > 0 ? analytics.averageInterviewScore : 50;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Section — Greeting, Readiness, CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Greeting + CTA */}
        <div className="lg:col-span-2">
          <Card padding="lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-heading-1 text-text-primary mb-1">
                  Welcome back, <span className="artem-gradient-text">{user?.name?.split(' ')[0] || 'there'}</span>
                </h2>
                <p className="text-body text-text-secondary">
                  Your interview readiness is{' '}
                  <span className={cn('font-semibold', getReadinessClass(readinessScore))}>
                    {readinessScore >= 70 ? 'on track' : 'improving'}
                  </span>
                  . Keep preparing to hit your targets.
                </p>
              </div>
              <Link to="/ai-interview">
                <Button variant="gradient" size="lg" leftIcon={<Sparkles className="h-4.5 w-4.5" />}>
                  Start AI Interview
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Readiness Score */}
        <Card padding="lg" className="flex flex-col items-center justify-center">
          <p className="text-body-sm text-text-secondary mb-3">Job Readiness Score</p>
          <CircularProgress value={readinessScore} size={130} strokeWidth={10} label="readiness" />
          <p className={cn('text-body-sm font-medium mt-3', getReadinessClass(readinessScore))}>
            {readinessScore >= 85 ? 'Excellent' : readinessScore >= 70 ? 'Good' : readinessScore >= 50 ? 'Moderate' : 'Needs Work'}
          </p>
        </Card>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreCard
          label="Questions Attempted"
          value={analytics.questionsAttempted}
          icon={<BookOpen className="h-4 w-4" />}
        />
        <ScoreCard
          label="Interviews Completed"
          value={analytics.interviewsCompleted}
          icon={<MessageSquare className="h-4 w-4" />}
        />
        <ScoreCard
          label="Coding Solved"
          value={analytics.codingProblemsSolved}
          icon={<Code2 className="h-4 w-4" />}
        />
        <ScoreCard
          label="Avg Score"
          value={`${analytics.averageInterviewScore}/100`}
          icon={<Target className="h-4 w-4" />}
        />
      </div>

      {/* Middle Section — Performance + Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Performance Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
            <span className="text-caption text-text-muted">Recent interviews</span>
          </CardHeader>
          <div className="h-[220px] -mx-2">
            {recentInterviewScores.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={recentInterviewScores}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '13px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                    labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={2} fill="url(#scoreGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-body-sm text-text-muted">Complete interviews to see your trend</p>
              </div>
            )}
          </div>
        </Card>

        {/* Skill Radar */}
        <Card>
          <CardHeader>
            <CardTitle>Skill Analysis</CardTitle>
            <span className="text-caption text-text-muted">By topic performance</span>
          </CardHeader>
          <div className="h-[220px]">
            {skillRadarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillRadarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Score" dataKey="score" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-body-sm text-text-muted">Practice questions to build your skill profile</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Quick Actions</CardTitle>
            <AIBadge />
          </div>
        </CardHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/ai-interview" className="card-ai p-4 rounded-lg hover:scale-[1.02] transition-transform">
            <div className="flex items-start justify-between mb-2">
              <span className="text-caption font-medium text-ai-text uppercase tracking-wider">Interview</span>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <h4 className="text-body font-medium text-text-primary mb-1.5">Start AI Mock Interview</h4>
            <p className="text-body-sm text-text-secondary line-clamp-2">Practice with AI-powered questions tailored to your role</p>
          </Link>
          <Link to="/coding" className="card-ai p-4 rounded-lg hover:scale-[1.02] transition-transform">
            <div className="flex items-start justify-between mb-2">
              <span className="text-caption font-medium text-ai-text uppercase tracking-wider">Coding</span>
              <Code2 className="h-4 w-4 text-cyan" />
            </div>
            <h4 className="text-body font-medium text-text-primary mb-1.5">Solve Coding Problems</h4>
            <p className="text-body-sm text-text-secondary line-clamp-2">LeetCode-style problems with a built-in code editor</p>
          </Link>
          <Link to="/resume" className="card-ai p-4 rounded-lg hover:scale-[1.02] transition-transform">
            <div className="flex items-start justify-between mb-2">
              <span className="text-caption font-medium text-ai-text uppercase tracking-wider">Resume</span>
              <FileText className="h-4 w-4 text-purple" />
            </div>
            <h4 className="text-body font-medium text-text-primary mb-1.5">Analyze Your Resume</h4>
            <p className="text-body-sm text-text-secondary line-clamp-2">Get AI-powered feedback on ATS compatibility and skills</p>
          </Link>
        </div>
      </Card>

      {/* Bottom Section — Activity + Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity: any) => (
                <div key={activity.id} className="flex items-center gap-3 py-2">
                  <div className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                    'bg-purple/10 text-purple',
                  )}>
                    {activityIcons[activity.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm font-medium text-text-primary truncate">{activity.title}</p>
                    <p className="text-caption text-text-muted">{formatTimeAgo(activity.date)}</p>
                  </div>
                  {activity.score > 0 && (
                    <span className={cn('text-body-sm font-semibold', getReadinessClass(activity.score))}>
                      {activity.score}%
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-body-sm text-text-muted">No activity yet — start an interview or solve a problem!</p>
              </div>
            )}
          </div>
        </Card>

        {/* Topic Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Topic Progress</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            {(analytics.topicPerformance || []).length > 0 ? (
              (analytics.topicPerformance || []).map((tp: any) => (
                <div key={tp.topic}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-body-sm font-medium text-text-primary">{tp.topic}</p>
                    <span className="text-caption text-text-muted">{tp.correct}/{tp.attempted}</span>
                  </div>
                  <ProgressBar value={tp.score} size="sm" />
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-body-sm text-text-muted">Practice questions to track your progress by topic</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
