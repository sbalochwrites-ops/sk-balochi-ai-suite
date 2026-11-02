import React from 'react';
import {
  FolderTree,
  BookOpen,
  Users,
  Database,
  ChartColumn,
  Plus,
} from 'lucide-react';

export type ScreenTab =
  | 'structure'
  | 'roznamcha'
  | 'khata'
  | 'datasets'
  | 'reports';

interface TopBarProps {
  activeTab: ScreenTab;
  onSelectTab: (tab: ScreenTab) => void;
  onQuickAddTransaction: () => void;
}

const NAV_ITEMS: {
  id: ScreenTab;
  label: string;
  labelUrdu: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'structure',
    label: 'Project Structure',
    labelUrdu: 'پروجیکٹ ٹری سٹرکچر',
    icon: FolderTree,
  },
  {
    id: 'roznamcha',
    label: 'Roznamcha',
    labelUrdu: 'روزنامچہ',
    icon: BookOpen,
  },
  {
    id: 'khata',
    label: 'Udhaar Khata',
    labelUrdu: 'ادھار کھاتہ',
    icon: Users,
  },
  {
    id: 'datasets',
    label: 'AI Datasets & Cloud',
    labelUrdu: 'ڈیٹا سیٹس',
    icon: Database,
  },
  {
    id: 'reports',
    label: 'Reports',
    labelUrdu: 'رپورٹس',
    icon: ChartColumn,
  },
];

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  onQuickAddTransaction,
}) => {
  return (
    <>
      {/* 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 h-16 bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--border)]">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab('structure')}
          className="text-lg font-bold tracking-tight text-[var(--primary)] whitespace-nowrap shrink-0 text-left focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
        >
          SK Balochi Studio &amp; Khata
        </button>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav
          aria-label="Main navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--text-sec)]"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`py-1 whitespace-nowrap shrink-0 transition-colors border-b-2 ${
                  isActive
                    ? 'text-[var(--primary)] border-[var(--primary)] font-semibold'
                    : 'border-transparent hover:text-[var(--text)] hover:border-[var(--border)]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onQuickAddTransaction}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#1B5E20] hover:bg-[#114216] rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span>New Entry</span>
          </button>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar (Thumb-Zone Ergonomics) */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)] grid grid-cols-5 items-center h-16 px-1"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
                isActive ? 'text-[var(--primary)] font-semibold' : 'text-[var(--text-sec)]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] tracking-tight mt-1 truncate max-w-[68px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
