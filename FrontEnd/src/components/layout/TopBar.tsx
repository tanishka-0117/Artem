import React from 'react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';
import { Menu, Bell, Sun, Moon, Search } from 'lucide-react';
import { mockNotifications } from '@/lib/mockData';

interface TopBarProps {
  onMenuClick: () => void;
  title?: string;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick, title }) => {
  const { theme, toggleTheme } = useThemeStore();
  const user = useAuthStore((s) => s.user);
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-surface/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 lg:px-6">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-soft transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        {title && (
          <h1 className="text-heading-3 font-semibold text-text-primary hidden sm:block">{title}</h1>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <button className="p-2.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-soft transition-colors" aria-label="Search">
          <Search className="h-[18px] w-[18px]" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-soft transition-colors"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
        </button>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-soft transition-colors" aria-label="Notifications">
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-error text-white text-[0.625rem] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Profile */}
        <div className="ml-2 flex items-center gap-2.5 pl-3 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-body-sm font-semibold text-primary">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="hidden md:block">
            <p className="text-body-sm font-medium text-text-primary leading-tight">{user?.name || 'User'}</p>
            <p className="text-caption text-text-muted leading-tight">{user?.targetRole || 'Candidate'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
