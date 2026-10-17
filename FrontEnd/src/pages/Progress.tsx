import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { cn, getReadinessClass } from '@/lib/utils';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { CircularProgress, ProgressBar } from '@/components/ui/ProgressBar';
import { ScoreCard } from '@/components/ui/StateDisplay';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/StateDisplay';
import {
  TrendingUp, Target, BookOpen, Code2, MessageSquare, Brain,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';


const Progress: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: analyticsData, isLoading } = useQuery({
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
    topicPerformance: [],
    recentInterviews: [],
  };

  const readinessScore = analytics.averageInterviewScore > 0 ? analytics.averageInterviewScore : 50;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'topics', label: 'Topics', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'interviews', label: 'Interviews', icon: <MessageSquare className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-heading-1 text-text-primary">Progress & Analytics</h1>
        <p className="text-body text-text-secondary mt-1">Track your improvement and identify areas to focus on</p>
      </div>

      {/* Overall Readiness */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <Card padding="lg" className="md:col-span-1 flex flex-col items-center justify-center">
          <p className="text-body-sm text-text-secondary mb-3">Overall Readiness</p>
          <CircularProgress value={readinessScore} size={120} strokeWidth={9} label="score" />
        </Card>
        <div className="md:col-span-3 grid grid-cols-2 lg:grid-cols-3 gap-4">
          <ScoreCard label="Questions Attempted" value={analytics.questionsAttempted} icon={<BookOpen className="h-4 w-4" />} trend={{ value: 12, isPositive: true }} />
          <ScoreCard label="Interviews Done" value={analytics.interviewsCompleted} icon={<MessageSquare className="h-4 w-4" />} trend={{ value: 3, isPositive: true }} />
          <ScoreCard label="Coding Solved" value={analytics.codingProblemsSolved} icon={<Code2 className="h-4 w-4" />} trend={{ value: 8, isPositive: true }} />
          <ScoreCard label="Avg Score" value={`${analytics.averageInterviewScore}/100`} icon={<Target className="h-4 w-4" />} trend={{ value: 5, isPositive: true }} />
          <ScoreCard label="Weak Areas" value={analytics.topicPerformance.filter((t: any) => t.score < 50).length || 2} icon={<Brain className="h-4 w-4" />} />
          <ScoreCard label="Preparation" value={`${readinessScore}%`} icon={<TrendingUp className="h-4 w-4" />} trend={{ value: 6, isPositive: true }} />
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Weekly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Performance Trend</CardTitle>
            </CardHeader>
            <div className="h-[260px] -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={(analytics.recentInterviews || []).map((i: any, idx: number) => ({ interview: `#${idx + 1}`, score: typeof i.score === 'number' ? i.score : 0 }))}>
                  <defs>
                    <linearGradient id="overallGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="interview" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px' }} />
                  <Area type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={2} fill="url(#overallGrad)" name="Score" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Skill Radar */}
          <Card>
            <CardHeader>
              <CardTitle>Skill Profile</CardTitle>
            </CardHeader>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={(analytics.topicPerformance || []).map((tp: any) => ({ skill: tp.topic, score: tp.score || 0, fullMark: 100 }))} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Score" dataKey="score" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'topics' && (
        <div className="space-y-5">
          {/* Topic Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Topic Performance</CardTitle>
            </CardHeader>
            <div className="h-[300px] -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.topicPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="topic" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px' }} />
                  <Bar dataKey="score" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={32} name="Score %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Topic Table */}
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-3 text-caption font-semibold text-text-muted uppercase tracking-wider">Topic</th>
                    <th className="px-5 py-3 text-caption font-semibold text-text-muted uppercase tracking-wider">Score</th>
                    <th className="px-5 py-3 text-caption font-semibold text-text-muted uppercase tracking-wider">Attempted</th>
                    <th className="px-5 py-3 text-caption font-semibold text-text-muted uppercase tracking-wider">Correct</th>
                    <th className="px-5 py-3 text-caption font-semibold text-text-muted uppercase tracking-wider">Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {analytics.topicPerformance.length > 0 ? analytics.topicPerformance.map((t: any) => (
                    <tr key={t.topic} className="hover:bg-surface-soft transition-colors">
                      <td className="px-5 py-3.5 text-body-sm font-medium text-text-primary">{t.topic}</td>
                      <td className="px-5 py-3.5"><span className={cn('text-body-sm font-semibold', getReadinessClass(t.score))}>{t.score}%</span></td>
                      <td className="px-5 py-3.5 text-body-sm text-text-secondary">{t.attempted}</td>
                      <td className="px-5 py-3.5 text-body-sm text-text-secondary">{t.correct}</td>
                      <td className="px-5 py-3.5 text-body-sm text-text-secondary">{t.attempted > 0 ? Math.round((t.correct / t.attempted) * 100) : 0}%</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-text-secondary text-body-sm">
                        No topic performance data yet. Start practicing!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'interviews' && (
        <div className="space-y-4">
          {analytics.recentInterviews.length > 0 ? analytics.recentInterviews.map((interview: any) => (
            <Card key={interview._id} variant="interactive" padding="md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center font-bold text-body-lg',
                    getReadinessClass(interview.score),
                    'bg-surface-soft',
                  )}>
                    {interview.score}
                  </div>
                  <div>
                    <h3 className="text-body font-medium text-text-primary">{interview.type} Interview</h3>
                    <p className="text-body-sm text-text-secondary">AI Mock Interview</p>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-body-sm text-text-secondary">{new Date(interview.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </Card>
          )) : (
            <div className="text-center py-12 card-base rounded-lg border border-border">
              <p className="text-body text-text-secondary">No interviews completed yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Progress;
