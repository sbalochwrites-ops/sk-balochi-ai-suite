import React from 'react';
import {
  TrendingUp,
  Users,
  Wallet,
  Plus,
  ArrowUpRight,
  Minus,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { ScreenTab } from './TopBar';
import { TransactionType } from '../database/entities';

interface DashboardQuickActionWidgetsProps {
  summaryMetrics: {
    totalSales: number;
    totalExpenses: number;
    netProfit: number;
    cashInHand: number;
    todaySales: number;
    todayExpenses: number;
    totalUdhaarReceivable: number;
  };
  totalCustomersCount: number;
  onQuickAddSale: () => void;
  onQuickAddExpense: () => void;
  onQuickAddUdhaar: () => void;
  onNavigateTab: (tab: ScreenTab) => void;
  onSetTxFilter?: (filter: 'ALL' | TransactionType) => void;
}

export const DashboardQuickActionWidgets: React.FC<
  DashboardQuickActionWidgetsProps
> = ({
  summaryMetrics,
  totalCustomersCount,
  onQuickAddSale,
  onQuickAddExpense,
  onQuickAddUdhaar,
  onNavigateTab,
  onSetTxFilter,
}) => {
  const todayNet = summaryMetrics.todaySales - summaryMetrics.todayExpenses;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
            <span>Executive Overview &amp; Quick Actions</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono-num font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Live At-a-Glance
            </span>
          </h2>
          <p className="text-xs text-[var(--text-sec)] urdu mt-0.5">
            آج کی کل بکری اور واجب الادا ادھار کا فوری جائزہ مع کوئیک ایکشن بٹنز
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Widget 1: Today's Total Sales */}
        <div className="rounded-2xl bg-[var(--surface)] border-2 border-emerald-500/30 p-5 shadow-sm space-y-4 hover:border-emerald-500/50 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <TrendingUp className="w-4 h-4" />
                <span>Today&apos;s Total Sales (آج کی کل بکری)</span>
              </div>
              <div className="text-3xl font-bold font-mono-num text-[var(--sale)] mt-1.5">
                PKR {summaryMetrics.todaySales.toLocaleString()}
              </div>
            </div>
            <span className="text-[11px] font-mono-num text-[var(--text-sec)] bg-[var(--surface-2)] px-2 py-1 rounded-md">
              All-Time: PKR {summaryMetrics.totalSales.toLocaleString()}
            </span>
          </div>

          <div className="pt-2 border-t border-[var(--border)] flex items-center gap-2">
            <button
              type="button"
              onClick={onQuickAddSale}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#1B5E20] hover:bg-[#114216] text-white text-xs font-semibold transition-colors min-h-[36px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Log Sale</span>
            </button>
            {onSetTxFilter && (
              <button
                type="button"
                onClick={() => onSetTxFilter('SALE')}
                className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--surface-2)] text-xs font-medium text-[var(--text)] min-h-[36px]"
              >
                <span>Filter</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Widget 2: Outstanding Udhaar at a Glance */}
        <div className="rounded-2xl bg-[var(--surface)] border-2 border-amber-500/30 p-5 shadow-sm space-y-4 hover:border-amber-500/50 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                <Users className="w-4 h-4" />
                <span>Outstanding Udhaar (کل واجب الادا ادھار)</span>
              </div>
              <div className="text-3xl font-bold font-mono-num text-[var(--udhaar)] mt-1.5">
                PKR {summaryMetrics.totalUdhaarReceivable.toLocaleString()}
              </div>
            </div>
            <span className="text-[11px] font-mono-num text-[var(--text-sec)] bg-[var(--surface-2)] px-2 py-1 rounded-md">
              {totalCustomersCount} Accounts
            </span>
          </div>

          <div className="pt-2 border-t border-[var(--border)] flex items-center gap-2">
            <button
              type="button"
              onClick={onQuickAddUdhaar}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold transition-colors min-h-[36px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Log Udhaar</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('khata')}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--surface-2)] text-xs font-medium text-[var(--text)] min-h-[36px]"
            >
              <span>View Khata</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Widget 3: Cash in Hand & Fast Short-Cuts */}
        <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-5 shadow-sm space-y-4 md:col-span-2 lg:col-span-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-sec)]">
                <Wallet className="w-4 h-4 text-[var(--primary)]" />
                <span>Cash in Hand (نقد کیش گلہ)</span>
              </div>
              <div className="text-3xl font-bold font-mono-num text-[var(--text)] mt-1.5">
                PKR {summaryMetrics.cashInHand.toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <span
                className={`text-xs font-mono-num font-semibold ${
                  todayNet >= 0 ? 'text-[var(--profit)]' : 'text-[var(--expense)]'
                }`}
              >
                Today: {todayNet >= 0 ? '+' : ''}PKR {todayNet.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--border)] flex items-center gap-2">
            <button
              type="button"
              onClick={onQuickAddExpense}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-semibold transition-colors min-h-[36px]"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>- Log Expense</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('reports')}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--surface-2)] text-xs font-medium text-[var(--text)] min-h-[36px]"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Reports</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('datasets')}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--surface-2)] text-xs font-medium text-[var(--text)] min-h-[36px]"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
