import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, BookOpen, Sparkles, Code2, FileText,
  Database, TrendingUp, Map, User, ChevronLeft, Menu,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/practice', label: 'Practice', icon: BookOpen },
  { path: '/ai-interview', label: 'AI Interview', icon: Sparkles },
  { path: '/coding', label: 'Coding', icon: Code2 },
  { path: '/resume', label: 'Resume Analyzer', icon: FileText },
  { path: '/questions', label: 'Question Bank', icon: Database },
  { path: '/progress', label: 'Progress', icon: TrendingUp },
  { path: '/roadmap', label: 'Roadmap', icon: Map },
  { path: '/profile', label: 'Profile', icon: User },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
  onCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, isCollapsed, onCollapse }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full bg-surface border-r border-border z-50 flex flex-col transition-all duration-200',
          'lg:relative lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          isCollapsed ? 'lg:w-[72px]' : 'lg:w-sidebar',
          'w-sidebar',
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center h-16 border-b border-border px-4',
          isCollapsed ? 'justify-center' : 'justify-between',
        )}>
          {!isCollapsed && (
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg artem-gradient flex items-center justify-center">
                <span className="text-white font-bold text-body-sm">A</span>
              </div>
              <span className="text-heading-3 font-bold artem-gradient-text">Artem</span>
            </Link>
          )}
          {isCollapsed && (
            <Link to="/" className="w-8 h-8 rounded-lg artem-gradient flex items-center justify-center">
              <span className="text-white font-bold text-body-sm">A</span>
            </Link>
          )}
          <button
            onClick={onCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-soft transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', isCollapsed && 'rotate-180')} />
          </button>
          <button
            onClick={onToggle}
            className="lg:hidden p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-soft transition-colors"
            aria-label="Close sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5" aria-label="Main navigation">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => { if (window.innerWidth < 1024) onToggle(); }}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-body font-medium transition-all duration-200',
                      isCollapsed && 'justify-center px-0',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-soft',
                    )}
                    title={isCollapsed ? item.label : undefined}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className={cn('h-[18px] w-[18px] shrink-0', isActive && 'text-primary')} />
                    {!isCollapsed && <span>{item.label}</span>}
                    {isActive && item.path === '/ai-interview' && !isCollapsed && (
                      <span className="ml-auto px-1.5 py-0.5 text-[0.625rem] font-medium rounded artem-gradient text-white">
                        ✦ AI
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom */}
        {!isCollapsed && (
          <div className="p-4 border-t border-border">
            <div className="card-ai p-3 rounded-lg">
              <p className="text-caption text-ai-text font-medium">✦ AI-Powered Prep</p>
              <p className="text-[0.6875rem] text-text-muted mt-0.5">Smart interviews & feedback</p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
export { navItems };
