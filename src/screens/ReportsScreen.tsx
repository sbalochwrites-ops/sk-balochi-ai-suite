import React, { useState, useRef } from 'react';
import {
  Download,
  RotateCcw,
  ChartColumn,
  Upload,
  Database,
  Check,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { CustomerEntity, TransactionEntity } from '../database/entities';
import { AppDatabase } from '../database/AppDatabase';
import { WeeklyProfitTrendChart } from '../components/WeeklyProfitTrendChart';

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
  const [backupMessage, setBackupMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleExportRoznamchaCsv = () => {
    const headers = [
      'Transaction_ID',
      'Date',
      'Time',
      'Type',
      'Title_English',
      'Title_Urdu',
      'Category',
      'Payment_Mode',
      'Linked_Customer',
      'Amount_PKR',
      'Notes',
    ];
    const rows = allTransactions.map((t) => [
      t.id,
      t.date,
      t.time,
      t.type,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.titleUrdu.replace(/"/g, '""')}"`,
      `"${t.category}"`,
      t.paymentMode,
      `"${(t.customerName || '').replace(/"/g, '""')}"`,
      t.amount,
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `sk_ai_studio_roznamcha_cashbook_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setBackupMessage({
      type: 'success',
      text: 'Roznamcha Cashbook CSV exported successfully!',
    });
    setTimeout(() => setBackupMessage(null), 3500);
  };

  const handleExportUdhaarKhataCsv = () => {
    const dbState = AppDatabase.getInstance().getState();
    const customerMap = new Map<string, string>();
    customers.forEach((c) => customerMap.set(c.id, c.name));

    const lines: string[] = [
      '=== SK AI STUDIO: CUSTOMER UDHAAR KHATA LEDGER SUMMARY ===',
      [
        'Customer_ID',
        'Customer_Name',
        'Name_Urdu',
        'Phone',
        'City',
        'Total_Udhaar_Balance_PKR',
        'Khata_Status',
        'Last_Updated',
      ].join(','),
      ...customers.map((c) =>
        [
          c.id,
          `"${c.name.replace(/"/g, '""')}"`,
          `"${c.nameUrdu.replace(/"/g, '""')}"`,
          `"${c.phone}"`,
          `"${c.city}"`,
          c.totalUdhaar,
          c.totalUdhaar > 0 ? 'Receivable (واجب الادا)' : 'Settled (بے باق)',
          c.lastUpdated,
        ].join(',')
      ),
      '',
      '=== DETAILED KHATA LEDGER TRANSACTIONS (GIVEN & RECEIVED) ===',
      [
        'Entry_ID',
        'Customer_ID',
        'Customer_Name',
        'Date',
        'Entry_Type',
        'Amount_PKR',
        'Description',
        'Bill_Number',
      ].join(','),
      ...dbState.khataEntries.map((e) =>
        [
          e.id,
          e.customerId,
          `"${(customerMap.get(e.customerId) || 'Unknown').replace(/"/g, '""')}"`,
          e.date,
          e.entryType === 'GIVEN' ? 'GIVEN (ادھار دیا)' : 'RECEIVED (وصولی ہوئی)',
          e.amount,
          `"${e.description.replace(/"/g, '""')}"`,
          `"${e.billNo || ''}"`,
        ].join(',')
      ),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' + encodeURIComponent(lines.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute(
      'download',
      `sk_ai_studio_udhaar_khata_ledgers_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setBackupMessage({
      type: 'success',
      text: 'Udhaar Khata Customer Ledgers CSV exported successfully!',
    });
    setTimeout(() => setBackupMessage(null), 3500);
  };

  const handleExportCombinedAuditCsv = () => {
    const dbState = AppDatabase.getInstance().getState();
    const customerMap = new Map<string, string>();
    customers.forEach((c) => customerMap.set(c.id, c.name));

    const lines: string[] = [
      '========================================================================',
      'SK AI STUDIO - CONSOLIDATED BUSINESS FINANCIAL & KHATA AUDIT REPORT',
      `Generated At: ${new Date().toISOString()}`,
      '========================================================================',
      '',
      '=== 1. FINANCIAL SUMMARY METRICS ===',
      `Total Sales (PKR),${summaryMetrics.totalSales}`,
      `Total Expenses (PKR),${summaryMetrics.totalExpenses}`,
      `Net Profit (PKR),${summaryMetrics.netProfit}`,
      `Cash in Hand (PKR),${summaryMetrics.cashInHand}`,
      `Total Outstanding Udhaar Receivable (PKR),${summaryMetrics.totalUdhaarReceivable}`,
      `Active Customer Khata Accounts,${customers.length}`,
      `Total Roznamcha Transactions,${allTransactions.length}`,
      '',
      '=== 2. ROZNAMCHA DAILY CASHBOOK TRANSACTIONS ===',
      [
        'Transaction_ID',
        'Date',
        'Time',
        'Type',
        'Title_EN',
        'Title_UR',
        'Category',
        'Payment_Mode',
        'Customer_Name',
        'Amount_PKR',
        'Notes',
      ].join(','),
      ...allTransactions.map((t) =>
        [
          t.id,
          t.date,
          t.time,
          t.type,
          `"${t.title.replace(/"/g, '""')}"`,
          `"${t.titleUrdu.replace(/"/g, '""')}"`,
          `"${t.category}"`,
          t.paymentMode,
          `"${(t.customerName || '').replace(/"/g, '""')}"`,
          t.amount,
          `"${(t.note || '').replace(/"/g, '""')}"`,
        ].join(',')
      ),
      '',
      '=== 3. CUSTOMER UDHAAR KHATA BALANCES ===',
      [
        'Customer_ID',
        'Customer_Name',
        'Name_Urdu',
        'Phone',
        'City',
        'Balance_PKR',
        'Status',
        'Last_Updated',
      ].join(','),
      ...customers.map((c) =>
        [
          c.id,
          `"${c.name.replace(/"/g, '""')}"`,
          `"${c.nameUrdu.replace(/"/g, '""')}"`,
          `"${c.phone}"`,
          `"${c.city}"`,
          c.totalUdhaar,
          c.totalUdhaar > 0 ? 'Receivable (واجب الادا)' : 'Settled (بے باق)',
          c.lastUpdated,
        ].join(',')
      ),
      '',
      '=== 4. DETAILED LEDGER ENTRIES ===',
      [
        'Entry_ID',
        'Customer_Name',
        'Date',
        'Type',
        'Amount_PKR',
        'Description',
        'Bill_Number',
      ].join(','),
      ...dbState.khataEntries.map((e) =>
        [
          e.id,
          `"${(customerMap.get(e.customerId) || 'Unknown').replace(/"/g, '""')}"`,
          e.date,
          e.entryType === 'GIVEN' ? 'Given (ادھار)' : 'Received (وصولی)',
          e.amount,
          `"${e.description.replace(/"/g, '""')}"`,
          `"${e.billNo || ''}"`,
        ].join(',')
      ),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' + encodeURIComponent(lines.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute(
      'download',
      `sk_ai_studio_full_audit_statement_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setBackupMessage({
      type: 'success',
      text: 'Consolidated Financial Audit CSV exported successfully!',
    });
    setTimeout(() => setBackupMessage(null), 3500);
  };

  const handleExportJson = () => {
    const jsonStr = AppDatabase.getInstance().exportBackupJson();
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(jsonStr);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute(
      'download',
      `sk_ai_studio_backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setBackupMessage({
      type: 'success',
      text: 'Full SK AI Studio database backup exported as JSON!',
    });
    setTimeout(() => setBackupMessage(null), 3500);
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawContent = event.target?.result as string;
        const result = AppDatabase.getInstance().importBackupJson(rawContent);
        if (result.success) {
          setBackupMessage({
            type: 'success',
            text: 'Backup restored successfully! All tables updated.',
          });
        } else {
          setBackupMessage({
            type: 'error',
            text: result.message,
          });
        }
      } catch (err: any) {
        setBackupMessage({
          type: 'error',
          text: err?.message || 'Failed to read backup file.',
        });
      }
      setTimeout(() => setBackupMessage(null), 4000);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const profitMarginPct =
    summaryMetrics.totalSales > 0
      ? Math.round((summaryMetrics.netProfit / summaryMetrics.totalSales) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-sec)]">
            <span>Financial Analytics</span>
            <span aria-hidden="true">·</span>
            <span>Aggregated DAO Reports &amp; D3 Analytics</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)] mt-1">
            Business Financial Reports (مالیاتی رپورٹس اور خلاصہ)
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onResetDemoData}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-xs font-medium text-[var(--text-sec)] min-h-[38px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
          <button
            type="button"
            onClick={handleExportRoznamchaCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-xs font-semibold text-[var(--text)] min-h-[38px]"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Roznamcha CSV</span>
          </button>
          <button
            type="button"
            onClick={handleExportUdhaarKhataCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-xs font-semibold text-[var(--text)] min-h-[38px]"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-600" />
            <span>Udhaar Khata CSV</span>
          </button>
          <button
            type="button"
            onClick={handleExportCombinedAuditCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1B5E20] hover:bg-[#114216] text-white text-xs font-semibold min-h-[38px]"
          >
            <Download className="w-4 h-4" />
            <span>Full Audit CSV</span>
          </button>
        </div>
      </div>

      {/* Backup Notification Alert */}
      {backupMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
            backupMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {backupMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{backupMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setBackupMessage(null)}
            className="text-[11px] font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

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

      {/* Dynamic 7-Day D3 Weekly Profit Trend Line Chart */}
      <WeeklyProfitTrendChart transactions={allTransactions} />

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

      {/* Database Backup & Portability Card */}
      <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div>
            <h2 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
              <Database className="w-4 h-4 text-[var(--primary)]" />
              <span>Database Portability &amp; Backup Restore (بیک اپ اور ری سٹور)</span>
            </h2>
            <p className="text-xs text-[var(--text-sec)] mt-0.5">
              Export complete Roznamcha, Udhaar Khata, and AI Datasets as JSON or restore from a previously saved file.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Roznamcha CSV */}
          <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-xs text-[var(--text)]">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Roznamcha Cashbook CSV</span>
              </div>
              <p className="text-xs text-[var(--text-sec)] leading-relaxed">
                Export all daily sales, expenses, counter payment modes, categories, and customer links as CSV for Excel/Sheets.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportRoznamchaCsv}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-xs font-semibold text-[var(--text)] min-h-[36px]"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download Roznamcha</span>
            </button>
          </div>

          {/* Card 2: Udhaar Khata CSV */}
          <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-xs text-[var(--text)]">
                <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                <span>Udhaar Khata Ledgers CSV</span>
              </div>
              <p className="text-xs text-[var(--text-sec)] leading-relaxed">
                Export customer credit records, outstanding receivable balances, phone directories, and entry history logs.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportUdhaarKhataCsv}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-xs font-semibold text-[var(--text)] min-h-[36px]"
            >
              <Download className="w-3.5 h-3.5 text-amber-600" />
              <span>Download Khata CSV</span>
            </button>
          </div>

          {/* Card 3: Combined Financial Statement */}
          <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-xs text-[var(--text)]">
                <FileSpreadsheet className="w-4 h-4 text-[var(--primary)]" />
                <span>Full Audit Statement CSV</span>
              </div>
              <p className="text-xs text-[var(--text-sec)] leading-relaxed">
                Consolidated audit report combining summary financial KPIs, daily cashbook entries, and customer balances.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportCombinedAuditCsv}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#1B5E20] hover:bg-[#114216] text-white text-xs font-semibold min-h-[36px]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Full Statement</span>
            </button>
          </div>

          {/* Card 4: JSON Backup & Restore */}
          <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-xs text-[var(--text)]">
                <Database className="w-4 h-4 text-sky-600" />
                <span>JSON Snapshot &amp; Restore</span>
              </div>
              <p className="text-xs text-[var(--text-sec)] leading-relaxed">
                Download database snapshots or restore existing backups directly into local storage.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportJson}
                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-xs font-semibold text-[var(--text)] min-h-[36px]"
              >
                <Download className="w-3 h-3 text-[var(--primary)]" />
                <span>Export JSON</span>
              </button>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportJsonFile}
                  className="hidden"
                  id="restore-file-input"
                />
                <label
                  htmlFor="restore-file-input"
                  className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-xs font-semibold text-[var(--text)] cursor-pointer min-h-[36px]"
                >
                  <Upload className="w-3 h-3 text-[var(--primary)]" />
                  <span>Restore</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
