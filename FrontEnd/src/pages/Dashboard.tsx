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
import { ScoreCard } from '@/components/ui/StateDisplay';
import {
  Sparkles, BookOpen, Code2, Target, TrendingUp,
  MessageSquare, FileText, ChevronRight, CheckCircle, Clock,
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import {
  mockDashboard, mockSkillRadar, mockPerformanceData,
  mockRecommendations, mockRecentActivity, mockGoals,
} from '@/lib/mockData';

const activityIcons: Record<string, React.ReactNode> = {
  interview: <MessageSquare className="h-4 w-4" />,
  coding: <Code2 className="h-4 w-4" />,
  resume: <FileText className="h-4 w-4" />,
};

const Dashboard: React.FC = () => {
  const user = useAuthStore((s) => s.user);

  const { data: analyticsData } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res = await api.get('/progress/analytics');
      return res.data;
    },
  });

  const analytics = analyticsData?.data || {
    questionsAttempted: 0,
    interviewsCompleted: 0,
    codingProblemsSolved: 0,
    averageInterviewScore: 0,
  };

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
          trend={{ value: 12, isPositive: true }}
        />
        <ScoreCard
          label="Interviews Completed"
          value={analytics.interviewsCompleted}
          icon={<MessageSquare className="h-4 w-4" />}
          trend={{ value: 3, isPositive: true }}
        />
        <ScoreCard
          label="Coding Solved"
          value={analytics.codingProblemsSolved}
          icon={<Code2 className="h-4 w-4" />}
          trend={{ value: 8, isPositive: true }}
        />
        <ScoreCard
          label="Avg Score"
          value={`${analytics.averageInterviewScore}/100`}
          icon={<Target className="h-4 w-4" />}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Middle Section — Performance + Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Performance Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
            <span className="text-caption text-text-muted">Last 7 days</span>
          </CardHeader>
          <div className="h-[220px] -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockPerformanceData}>
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
          </div>
        </Card>

        {/* Skill Radar */}
        <Card>
          <CardHeader>
            <CardTitle>Skill Analysis</CardTitle>
            <span className="text-caption text-text-muted">Multi-dimensional</span>
          </CardHeader>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={mockSkillRadar} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="score" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recommended Practice */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Recommended Practice</CardTitle>
            <AIBadge />
          </div>
          <Link to="/roadmap" className="text-body-sm text-primary hover:text-primary-hover font-medium flex items-center gap-1">
            View roadmap <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockRecommendations.map((rec) => (
            <div key={rec.id} className="card-ai p-4 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <span className="text-caption font-medium text-ai-text uppercase tracking-wider">
                  Priority {rec.priority}
                </span>
              </div>
              <h4 className="text-body font-medium text-text-primary mb-1.5">{rec.title}</h4>
              <p className="text-body-sm text-text-secondary line-clamp-2">{rec.reason}</p>
            </div>
          ))}
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
            {mockRecentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 py-2">
                <div className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                  activity.type === 'interview' ? 'bg-purple/10 text-purple' :
                  activity.type === 'coding' ? 'bg-cyan/10 text-cyan' :
                  'bg-primary/10 text-primary',
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
            ))}
          </div>
        </Card>

        {/* Upcoming Goals */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Goals</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            {mockGoals.map((goal) => (
              <div key={goal.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-body-sm font-medium text-text-primary">{goal.title}</p>
                  <span className="text-caption text-text-muted">{goal.completed}/{goal.total}</span>
                </div>
                <ProgressBar value={goal.progress} size="sm" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
