import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { DifficultyBadge, Badge } from '@/components/ui/Badge';
import { Dropdown } from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import { EmptyState, LoadingState } from '@/components/ui/StateDisplay';
import {
  Search, Bookmark, BookmarkCheck, CheckCircle, Circle,
  Sparkles, Filter, ChevronDown, Building2,
} from 'lucide-react';

const QuestionBank: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [localState, setLocalState] = useState<Record<string, { bookmarked?: boolean; completed?: boolean }>>({}); 

  const { data: questionsData, isLoading } = useQuery({
    queryKey: ['questions', searchQuery, categoryFilter, difficultyFilter],
    queryFn: async () => {
      const params: Record<string, string> = { limit: '100' };
      if (searchQuery) params.search = searchQuery;
      if (categoryFilter) params.category = categoryFilter;
      if (difficultyFilter) params.difficulty = difficultyFilter;
      const res = await api.get('/questions', { params });
      return res.data;
    },
  });

  const questions = (questionsData?.data || []).map((q: any) => ({
    ...q,
    bookmarked: localState[q._id]?.bookmarked || false,
    completed: localState[q._id]?.completed || false,
  }));

  const toggleBookmark = (id: string) => {
    setLocalState((prev) => ({ ...prev, [id]: { ...prev[id], bookmarked: !prev[id]?.bookmarked } }));
  };

  const toggleComplete = (id: string) => {
    setLocalState((prev) => ({ ...prev, [id]: { ...prev[id], completed: !prev[id]?.completed } }));
  };

  const categories: string[] = Array.from(new Set((questionsData?.data || []).map((q: any) => q.category as string)));

  if (isLoading) return <LoadingState text="Loading questions..." />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-heading-1 text-text-primary">Question Bank</h1>
        <p className="text-body text-text-secondary mt-1">Search, filter, and practice interview questions</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <Button
          variant="secondary"
          size="md"
          leftIcon={<Filter className="h-4 w-4" />}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters
          {(categoryFilter || difficultyFilter) && (
            <span className="w-5 h-5 rounded-full bg-primary text-white text-[0.625rem] flex items-center justify-center ml-1">
              {[categoryFilter, difficultyFilter].filter(Boolean).length}
            </span>
          )}
        </Button>
      </div>

      {showFilters && (
        <Card padding="md" className="flex flex-wrap gap-4">
          <Dropdown
            label="Category"
            placeholder="All categories"
            options={categories.map((c) => ({ value: c, label: c }))}
            value={categoryFilter}
            onChange={setCategoryFilter}
            className="w-full sm:w-48"
          />
          <Dropdown
            label="Difficulty"
            placeholder="All difficulties"
            options={[
              { value: 'Easy', label: 'Easy' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Hard', label: 'Hard' },
            ]}
            value={difficultyFilter}
            onChange={setDifficultyFilter}
            className="w-full sm:w-40"
          />
          {(categoryFilter || difficultyFilter) && (
            <div className="flex items-end">
              <Button variant="ghost" size="sm" onClick={() => { setCategoryFilter(''); setDifficultyFilter(''); }}>
                Clear all
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Results count */}
      <p className="text-body-sm text-text-muted">{questions.length} questions found</p>

      {/* Question List */}
      {questions.length === 0 ? (
        <EmptyState
          title="No questions found"
          description="Try adjusting your search or filters"
          action={{ label: 'Clear filters', onClick: () => { setSearchQuery(''); setCategoryFilter(''); setDifficultyFilter(''); } }}
        />
      ) : (
        <div className="space-y-2">
          {questions.map((q: any) => (
            <Card key={q._id} variant="interactive" padding="none">
              <div className="p-4 flex items-start gap-3">
                {/* Complete toggle */}
                <button
                  onClick={() => toggleComplete(q._id)}
                  className="mt-0.5 shrink-0"
                  aria-label={q.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {q.completed ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <Circle className="h-5 w-5 text-text-muted hover:text-text-secondary transition-colors" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={cn('text-body font-medium', q.completed ? 'text-text-muted line-through' : 'text-text-primary')}>
                      {q.title}
                    </h3>
                    <button
                      onClick={() => toggleBookmark(q._id)}
                      className="shrink-0 p-1"
                      aria-label={q.bookmarked ? 'Remove bookmark' : 'Add bookmark'}
                    >
                      {q.bookmarked ? (
                        <BookmarkCheck className="h-4 w-4 text-primary" />
                      ) : (
                        <Bookmark className="h-4 w-4 text-text-muted hover:text-text-secondary transition-colors" />
                      )}
                    </button>
                  </div>
                  <p className="text-body-sm text-text-secondary mt-1 line-clamp-2">{q.description}</p>
                  <div className="flex items-center flex-wrap gap-2 mt-2.5">
                    <DifficultyBadge difficulty={q.difficulty} />
                    <Badge variant="outline">{q.category}</Badge>
                    <Badge variant="outline">{q.topic}</Badge>
                    {q.company && (
                      <Badge variant="default" size="sm">
                        <Building2 className="h-3 w-3 mr-1" />{q.company}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionBank;
