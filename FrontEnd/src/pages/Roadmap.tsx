import React from 'react';
import { cn, getReadinessClass } from '@/lib/utils';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { AIBadge, Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CheckCircle, Circle, AlertTriangle, Sparkles, ChevronRight } from 'lucide-react';
import { mockRoadmap } from '@/lib/mockData';

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  completed: { bg: 'bg-success/10', text: 'text-success', label: 'Completed' },
  'in-progress': { bg: 'bg-primary/10', text: 'text-primary', label: 'In Progress' },
  'not-started': { bg: 'bg-surface-soft', text: 'text-text-muted', label: 'Not Started' },
};

const categoryColors: Record<string, string> = {
  DSA: 'bg-cyan/10 text-cyan border-cyan/20',
  'System Design': 'bg-purple/10 text-purple border-purple/20',
  HR: 'bg-warning/10 text-warning border-warning/20',
};

const Roadmap: React.FC = () => {
  const totalTasks = mockRoadmap.reduce((acc, r) => acc + r.tasks.length, 0);
  const completedTasks = mockRoadmap.reduce((acc, r) => acc + r.tasks.filter((t) => t.done).length, 0);
  const overallProgress = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-heading-1 text-text-primary">Roadmap</h1>
          <p className="text-body text-text-secondary mt-1">Your personalized preparation plan based on skill gaps</p>
        </div>
        <AIBadge />
      </div>

      {/* Overall progress */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-body font-medium text-text-primary">Overall Roadmap Progress</p>
            <p className="text-body-sm text-text-secondary">{completedTasks} of {totalTasks} tasks completed</p>
          </div>
          <span className={cn('text-heading-3 font-bold', getReadinessClass(overallProgress))}>{overallProgress}%</span>
        </div>
        <ProgressBar value={overallProgress} size="md" />
      </Card>

      {/* Roadmap items */}
      <div className="space-y-4">
        {mockRoadmap.map((item, index) => {
          const status = statusColors[item.status];
          const doneTasks = item.tasks.filter((t) => t.done).length;
          const progress = Math.round((doneTasks / item.tasks.length) * 100);

          return (
            <Card key={item.id} padding="lg" className={cn(item.status === 'completed' && 'opacity-75')}>
              <div className="flex items-start gap-4">
                {/* Priority number */}
                <div className="w-10 h-10 rounded-xl artem-gradient flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-body">{item.priority}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <h3 className="text-heading-3 text-text-primary">{item.title}</h3>
                    <Badge variant="outline" className={categoryColors[item.category] || ''} size="sm">
                      {item.category}
                    </Badge>
                    <span className={cn('px-2 py-0.5 rounded-md text-caption font-medium', status.bg, status.text)}>
                      {status.label}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 mb-4">
                    <Sparkles className="h-3.5 w-3.5 text-ai-text mt-0.5 shrink-0" />
                    <p className="text-body-sm text-text-secondary">{item.reason}</p>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <ProgressBar value={progress} size="sm" className="flex-1" />
                    <span className="text-caption text-text-muted whitespace-nowrap">{doneTasks}/{item.tasks.length}</span>
                  </div>

                  <div className="space-y-1.5">
                    {item.tasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-2.5 py-1">
                        {task.done ? (
                          <CheckCircle className="h-4 w-4 text-success shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-text-muted shrink-0" />
                        )}
                        <span className={cn('text-body-sm', task.done ? 'text-text-muted line-through' : 'text-text-primary')}>
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Roadmap;
