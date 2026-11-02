import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Landmark,
  Search,
  Plus,
  Trash2,
} from 'lucide-react';
import { TransactionEntity, TransactionType } from '../database/entities';

interface RoznamchaScreenProps {
  transactions: TransactionEntity[];
  summaryMetrics: {
    totalSales: number;
    totalExpenses: number;
    netProfit: number;
    cashInHand: number;
    todaySales: number;
    todayExpenses: number;
    totalUdhaarReceivable: number;
  };
  txFilter: 'ALL' | TransactionType;
  setTxFilter: (filter: 'ALL' | TransactionType) => void;
  txSearch: string;
  setTxSearch: (q: string) => void;
  onOpenNewEntry: () => void;
  onDeleteTransaction: (id: string) => void;
}

export const RoznamchaScreen: React.FC<RoznamchaScreenProps> = ({
  transactions,
  summaryMetrics,
  txFilter,
  setTxFilter,
  txSearch,
  setTxSearch,
  onOpenNewEntry,
  onDeleteTransaction,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-sec)]">
            <span>Roznamcha Ledger</span>
            <span aria-hidden="true">·</span>
            <span>TransactionDao &amp; AppDatabase</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)] mt-1">
            Daily Cashbook &amp; Roznamcha (روزنامچہ حساب کتاب)
          </h1>
        </div>

        <button
          type="button"
          onClick={onOpenNewEntry}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1B5E20] hover:bg-[#114216] text-white text-xs font-semibold transition-colors self-start sm:self-auto min-h-[40px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Sale / Expense (نیا اندراج)</span>
        </button>
      </div>

      {/* 4-Column KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-sec)]">
              Total Sales (کل بکری)
            </span>
            <TrendingUp className="w-4 h-4 text-[var(--sale)]" />
          </div>
          <div className="text-2xl font-bold font-mono-num text-[var(--sale)] mt-2">
            PKR {summaryMetrics.totalSales.toLocaleString()}
          </div>
          <div className="text-xs text-[var(--text-sec)] mt-1 font-mono-num">
            Today: PKR {summaryMetrics.todaySales.toLocaleString()}
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-sec)]">
              Total Expenses (کل خرچہ)
            </span>
            <TrendingDown className="w-4 h-4 text-[var(--expense)]" />
          </div>
          <div className="text-2xl font-bold font-mono-num text-[var(--expense)] mt-2">
            PKR {summaryMetrics.totalExpenses.toLocaleString()}
          </div>
          <div className="text-xs text-[var(--text-sec)] mt-1 font-mono-num">
            Today: PKR {summaryMetrics.todayExpenses.toLocaleString()}
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-sec)]">
              Net Profit (خالص منافع)
            </span>
            <Landmark className="w-4 h-4 text-[var(--profit)]" />
          </div>
          <div className="text-2xl font-bold font-mono-num text-[var(--profit)] mt-2">
            PKR {summaryMetrics.netProfit.toLocaleString()}
          </div>
          <div className="text-xs text-[var(--text-sec)] mt-1">
            Sales minus operating expenses
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-sec)]">
              Cash in Hand (نقد گلہ)
            </span>
            <Wallet className="w-4 h-4 text-[var(--udhaar)]" />
          </div>
          <div className="text-2xl font-bold font-mono-num text-[var(--text)] mt-2">
            PKR {summaryMetrics.cashInHand.toLocaleString()}
          </div>
          <div className="text-xs text-[var(--text-sec)] mt-1 font-mono-num">
            Market Udhaar: PKR {summaryMetrics.totalUdhaarReceivable.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar + Ledger Table */}
      <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
          {/* Segmented Control */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-2)] self-start">
            {(
              [
                { id: 'ALL', label: 'All Entries (سب)' },
                { id: 'SALE', label: 'Sales (بکری)' },
                { id: 'EXPENSE', label: 'Expenses (خرچہ)' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTxFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  txFilter === tab.id
                    ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                    : 'text-[var(--text-sec)] hover:text-[var(--text)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[var(--text-ter)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={txSearch}
              onChange={(e) => setTxSearch(e.target.value)}
              placeholder="Search title, Urdu, or category..."
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:border-[var(--primary)] outline-none"
            />
          </div>
        </div>

        {/* High-Density Transaction Rows */}
        {transactions.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-sm text-[var(--text-sec)]">
              No Roznamcha transactions match the current filter.
            </p>
            <button
              type="button"
              onClick={onOpenNewEntry}
              className="px-4 py-2 rounded-lg bg-[#1B5E20] text-white text-xs font-semibold"
            >
              Log First Entry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] text-[11px] font-semibold text-[var(--text-sec)]">
                  <th className="py-3 pr-4">Description / تفصیل</th>
                  <th className="py-3 px-4">Category &amp; Mode</th>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 pl-4 text-right">Amount (PKR)</th>
                  <th className="py-3 pl-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-sm">
                {transactions.map((tx) => {
                  const isSale = tx.type === 'SALE';
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-[var(--bg)] transition-colors"
                    >
                      <td className="py-3.5 pr-4">
                        <div className="font-semibold text-[var(--text)]">
                          {tx.title}
                        </div>
                        <div className="text-xs text-[var(--text-sec)] urdu mt-0.5">
                          {tx.titleUrdu}
                        </div>
                        {tx.note && (
                          <div className="text-xs text-[var(--text-ter)] mt-0.5">
                            {tx.note}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[var(--text-sec)] whitespace-nowrap">
                        <span>{tx.category}</span>
                        <span aria-hidden="true"> · </span>
                        <span className="font-mono-num">{tx.paymentMode}</span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono-num text-[var(--text-sec)] whitespace-nowrap">
                        <div>{tx.date}</div>
                        <div className="text-[var(--text-ter)]">{tx.time}</div>
                      </td>
                      <td
                        className={`py-3.5 pl-4 text-right font-mono-num font-bold whitespace-nowrap ${
                          isSale
                            ? 'text-[var(--sale)]'
                            : 'text-[var(--expense)]'
                        }`}
                      >
                        {isSale ? '+' : '-'} PKR {tx.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 pl-2 text-right">
                        <button
                          type="button"
                          onClick={() => onDeleteTransaction(tx.id)}
                          aria-label={`Delete ${tx.title}`}
                          className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-lg text-[var(--text-ter)] hover:text-[#C62828] hover:bg-[var(--surface-2)] transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
