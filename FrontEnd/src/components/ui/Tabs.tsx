import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={cn('flex border-b border-border', className)} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-body font-medium border-b-2 -mb-px transition-colors duration-200',
            activeTab === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text-secondary hover:border-border-strong',
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn(
              'px-1.5 py-0.5 text-[0.6875rem] rounded-md font-medium',
              activeTab === tab.id
                ? 'bg-primary/10 text-primary'
                : 'bg-surface-soft text-text-muted',
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ options, value, onChange, label, placeholder, className }) => {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-body-sm font-medium text-text-primary mb-1.5">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-body text-text-primary transition-colors duration-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};

export { Tabs, Dropdown };
export type { Tab, DropdownOption };
