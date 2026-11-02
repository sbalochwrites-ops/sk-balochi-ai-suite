import React from 'react';
import { Download, RotateCcw, ChartColumn } from 'lucide-react';
import { CustomerEntity, TransactionEntity } from '../database/entities';

interface ReportsScreenProps {
  allTransactions: TransactionEntity[];
  customers: CustomerEntity[];
  summaryMetrics: {
    totalSales: number;
    totalExpenses: number;
    netProfit: number;
    cashInHand: number;
    totalUdhaarReceivable: number;
  };
  onResetDemoData: () => void;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  allTransactions,
  customers,
  summaryMetrics,
  onResetDemoData,
}) => {
  // Compute category breakdown
  const categoryMap = new Map<
    string,
    { sales: number; expenses: number; count: number }
  >();

  for (const tx of allTransactions) {
    const existing = categoryMap.get(tx.category) ?? {
      sales: 0,
      expenses: 0,
      count: 0,
    };
    if (tx.type === 'SALE') existing.sales += tx.amount;
    else existing.expenses += tx.amount;
    existing.count += 1;
    categoryMap.set(tx.category, existing);
  }

  const categoryRows = Array.from(categoryMap.entries()).map(([cat, stats]) => ({
    category: cat,
    ...stats,
    net: stats.sales - stats.expenses,
  }));

  const handleExportCsv = () => {
    const headers = [
      'ID',
      'Date',
      'Time',
      'Type',
      'Title',
      'Category',
      'PaymentMode',
      'Amount_PKR',
    ];
    const rows = allTransactions.map((t) => [
      t.id,
      t.date,
      t.time,
      t.type,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.category}"`,
      t.paymentMode,
      t.amount,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'sk_balochi_roznamcha_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const profitMarginPct =
    summaryMetrics.totalSales > 0
      ? Math.round((summaryMetrics.netProfit / summaryMetrics.totalSales) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-sec)]">
            <span>Financial Analytics</span>
            <span aria-hidden="true">·</span>
            <span>Aggregated DAO Reports</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)] mt-1">
            Business Financial Reports (مالیاتی رپورٹس اور خلاصہ)
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onResetDemoData}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-xs font-medium text-[var(--text-sec)] min-h-[40px]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Seed Data</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1B5E20] hover:bg-[#114216] text-white text-xs font-semibold min-h-[40px]"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-5">
          <div className="text-xs font-medium text-[var(--text-sec)]">
            Net Profit Margin (منافع کی شرح)
          </div>
          <div className="text-2xl font-bold font-mono-num text-[var(--profit)] mt-2">
            {profitMarginPct}%
          </div>
          <div className="text-xs text-[var(--text-sec)] mt-1 font-mono-num">
            Net: PKR {summaryMetrics.netProfit.toLocaleString()}
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-5">
          <div className="text-xs font-medium text-[var(--text-sec)]">
            Total Active Khata Accounts (کل کھاتے)
          </div>
          <div className="text-2xl font-bold font-mono-num text-[var(--text)] mt-2">
            {customers.length} Accounts
          </div>
          <div className="text-xs text-[var(--text-sec)] mt-1 font-mono-num">
            Receivable: PKR {summaryMetrics.totalUdhaarReceivable.toLocaleString()}
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-5">
          <div className="text-xs font-medium text-[var(--text-sec)]">
            Total Recorded Transactions (کل اندراجات)
          </div>
          <div className="text-2xl font-bold font-mono-num text-[var(--text)] mt-2">
            {allTransactions.length} Entries
          </div>
          <div className="text-xs text-[var(--text-sec)] mt-1 font-mono-num">
            Cash in Hand: PKR {summaryMetrics.cashInHand.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Category Performance Table */}
      <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <h2 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
            <ChartColumn className="w-4 h-4 text-[var(--primary)]" />
            <span>Category-Wise Revenue &amp; Expense Breakdown</span>
          </h2>
          <span className="text-xs text-[var(--text-sec)] urdu">
            شعبہ جات کے لحاظ سے آمدن اور خرچہ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] text-[11px] font-semibold text-[var(--text-sec)]">
                <th className="py-3 pr-4">Category</th>
                <th className="py-3 px-4 text-right">Transactions</th>
                <th className="py-3 px-4 text-right">Sales (PKR)</th>
                <th className="py-3 px-4 text-right">Expenses (PKR)</th>
                <th className="py-3 pl-4 text-right">Net Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-sm">
              {categoryRows.map((row) => (
                <tr key={row.category}>
                  <td className="py-3.5 pr-4 font-semibold text-[var(--text)]">
                    {row.category}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono-num text-[var(--text-sec)]">
                    {row.count}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono-num text-[var(--sale)]">
                    {row.sales.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono-num text-[var(--expense)]">
                    {row.expenses.toLocaleString()}
                  </td>
                  <td
                    className={`py-3.5 pl-4 text-right font-mono-num font-bold ${
                      row.net >= 0
                        ? 'text-[var(--profit)]'
                        : 'text-[var(--expense)]'
                    }`}
                  >
                    {row.net >= 0 ? '+' : ''}
                    {row.net.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
