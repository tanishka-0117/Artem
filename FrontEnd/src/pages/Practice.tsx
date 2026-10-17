import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import {
  Code2, Globe, Layers, Database, Cpu, Users, ChevronRight, Sparkles, BookOpen,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  code: <Code2 className="h-5 w-5" />,
  globe: <Globe className="h-5 w-5" />,
  layers: <Layers className="h-5 w-5" />,
  database: <Database className="h-5 w-5" />,
  cpu: <Cpu className="h-5 w-5" />,
  users: <Users className="h-5 w-5" />,
  book: <BookOpen className="h-5 w-5" />,
};

const colorMap: Record<string, string> = {
  primary: 'bg-primary/10 text-primary',
  cyan: 'bg-cyan/10 text-cyan',
  purple: 'bg-purple/10 text-purple',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-info/10 text-info',
};

// Category configuration for icons and colors
const categoryConfig: Record<string, { icon: string; color: string }> = {
  'DSA': { icon: 'code', color: 'primary' },
  'Web Development': { icon: 'globe', color: 'cyan' },
  'System Design': { icon: 'layers', color: 'purple' },
  'DBMS': { icon: 'database', color: 'success' },
  'OOP': { icon: 'cpu', color: 'warning' },
  'HR': { icon: 'users', color: 'info' },
};

const Practice: React.FC = () => {
  // Fetch all questions to aggregate by category
  const { data: questionsData } = useQuery({
    queryKey: ['questions', 'all'],
    queryFn: async () => {
      const res = await api.get('/questions?limit=500');
      return res.data;
    },
  });

  // Fetch progress for completion tracking
  const { data: progressData } = useQuery({
    queryKey: ['progress'],
    queryFn: async () => {
      const res = await api.get('/progress');
      return res.data;
    },
  });

  // Aggregate questions by category
  const questions = questionsData?.data || [];
  const progressByTopic = (progressData?.data?.byTopic || []).reduce((acc: Record<string, any>, p: any) => {
    acc[p.topic] = p;
    return acc;
  }, {});

  const categoryMap = new Map<string, { topics: Set<string>; total: number }>();
  for (const q of questions) {
    const cat = q.category || 'Other';
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, { topics: new Set(), total: 0 });
    }
    const entry = categoryMap.get(cat)!;
    entry.total++;
    if (q.topic) entry.topics.add(q.topic);
  }

  const categories = Array.from(categoryMap.entries()).map(([name, { topics, total }]) => {
    const cfg = categoryConfig[name] || { icon: 'book', color: 'primary' };
    // Count completed from progress data
    const completed = progressByTopic[name]?.questionsCorrect || 0;
    return {
      id: name,
      name,
      icon: cfg.icon,
      color: cfg.color,
      topics: Array.from(topics),
      totalQuestions: total,
      completed,
    };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-1 text-text-primary">Practice</h1>
          <p className="text-body text-text-secondary mt-1">Choose a topic area to practice and improve your skills</p>
        </div>
        <Link to="/ai-interview">
          <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 artem-gradient text-white rounded-lg text-body font-medium hover:opacity-90 transition-opacity">
            <Sparkles className="h-4 w-4" />
            Quick AI Interview
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.length > 0 ? categories.map((cat) => (
          <Link key={cat.id} to={`/questions?category=${encodeURIComponent(cat.name)}`}>
            <Card variant="interactive" padding="none" className="group">
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', colorMap[cat.color])}>
                    {iconMap[cat.icon]}
                  </div>
                  <ChevronRight className="h-4 w-4 text-text-muted group-hover:text-text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="text-heading-3 text-text-primary mb-1">{cat.name}</h3>
                <p className="text-body-sm text-text-secondary mb-4">
                  {cat.completed} of {cat.totalQuestions} completed
                </p>
                <ProgressBar
                  value={cat.completed}
                  max={cat.totalQuestions}
                  size="sm"
                  color={`var(--${cat.color})`}
                />
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {cat.topics.slice(0, 4).map((topic) => (
                    <Badge key={topic} variant="outline" size="sm">{topic}</Badge>
                  ))}
                  {cat.topics.length > 4 && (
                    <Badge variant="outline" size="sm">+{cat.topics.length - 4}</Badge>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        )) : (
          <div className="col-span-full text-center py-12">
            <p className="text-body text-text-secondary">Loading practice categories...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Practice;
