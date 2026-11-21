import React from 'react';
import {
  FolderTree,
  BookOpen,
  Users,
  Database,
  ChartColumn,
  Plus,
  Sun,
  Moon,
  Fingerprint,
  ShieldCheck,
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
  isDark: boolean;
  onToggleTheme: () => void;
  isBiometricEnabled: boolean;
  onOpenBiometricSettings: () => void;
}

const NAV_ITEMS: {
  id: ScreenTab;
  label: string;
  shortLabel: string;
  labelUrdu: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'structure',
    label: 'Project Structure',
    shortLabel: 'Structure',
    labelUrdu: 'سٹرکچر',
    icon: FolderTree,
  },
  {
    id: 'roznamcha',
    label: 'Roznamcha',
    shortLabel: 'Roznamcha',
    labelUrdu: 'روزنامچہ',
    icon: BookOpen,
  },
  {
    id: 'khata',
    label: 'Udhaar Khata',
    shortLabel: 'Khata',
    labelUrdu: 'ادھار',
    icon: Users,
  },
  {
    id: 'datasets',
    label: 'AI Datasets & Cloud',
    shortLabel: 'Datasets',
    labelUrdu: 'ڈیٹا سیٹ',
    icon: Database,
  },
  {
    id: 'reports',
    label: 'Reports',
    shortLabel: 'Reports',
    labelUrdu: 'رپورٹس',
    icon: ChartColumn,
  },
];

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  onQuickAddTransaction,
  isDark,
  onToggleTheme,
  isBiometricEnabled,
  onOpenBiometricSettings,
}) => {
  return (
    <>
      {/* 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-4 md:gap-8 px-4 md:px-6 h-16 bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--border)]">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab('structure')}
          className="text-lg font-bold tracking-tight text-[var(--primary)] whitespace-nowrap shrink-0 text-left focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
        >
          SK AI Studio
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

        {/* Zone 3: Theme toggle, Biometric security, and Primary CTA */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={isDark}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] rounded-lg border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--surface-2)] text-[var(--text)] transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onOpenBiometricSettings}
            aria-label={
              isBiometricEnabled
                ? 'Biometric Lock Active — Open Security Settings'
                : 'Configure Biometric Authentication'
            }
            title={
              isBiometricEnabled
                ? 'Biometric Lock Active (Manage / Lock Session)'
                : 'Set up Biometric Lock (WebAuthn)'
            }
            className={`inline-flex items-center justify-center min-h-[40px] min-w-[40px] rounded-lg border transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-[var(--primary)] ${
              isBiometricEnabled
                ? 'border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)] hover:opacity-90'
                : 'border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--surface-2)] text-[var(--text)]'
            }`}
          >
            {isBiometricEnabled ? (
              <ShieldCheck className="w-4 h-4" />
            ) : (
              <Fingerprint className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={onQuickAddTransaction}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-semibold text-white bg-[#1B5E20] hover:bg-[#114216] rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span>New Entry</span>
          </button>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar (Solid Background, Thumb-Zone Ergonomics) */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)] border-t border-[var(--border)] shadow-[0_-4px_12px_rgba(0,0,0,0.08)] grid grid-cols-5 items-center h-16 px-1"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors py-1 ${
                isActive ? 'text-[var(--primary)] font-semibold' : 'text-[var(--text-sec)] hover:text-[var(--text)]'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap">
                {item.shortLabel}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
