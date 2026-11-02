import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  MessageCircle,
  Check,
  Copy,
  Trash2,
} from 'lucide-react';
import { CustomerEntity, KhataEntryEntity } from '../database/entities';

interface UdhaarKhataScreenProps {
  customers: CustomerEntity[];
  customerSearch: string;
  setCustomerSearch: (q: string) => void;
  selectedCustomer?: CustomerEntity;
  onSelectCustomer: (id: string) => void;
  selectedCustomerEntries: KhataEntryEntity[];
  onOpenNewCustomerModal: () => void;
  onAddKhataEntry: (payload: Omit<KhataEntryEntity, 'id'>) => void;
  onDeleteCustomer: (id: string) => void;
}

export const UdhaarKhataScreen: React.FC<UdhaarKhataScreenProps> = ({
  customers,
  customerSearch,
  setCustomerSearch,
  selectedCustomer,
  onSelectCustomer,
  selectedCustomerEntries,
  onOpenNewCustomerModal,
  onAddKhataEntry,
  onDeleteCustomer,
}) => {
  const [entryType, setEntryType] = useState<'GIVEN' | 'RECEIVED'>('RECEIVED');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [billNo, setBillNo] = useState('');
  const [copiedReminder, setCopiedReminder] = useState(false);

  const handleRecordEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    const numeric = Number(amount);
    if (!numeric || numeric <= 0) return;

    onAddKhataEntry({
      customerId: selectedCustomer.id,
      amount: numeric,
      entryType,
      description:
        description.trim() ||
        (entryType === 'GIVEN'
          ? 'Credit goods issued (ادھار مال دیا)'
          : 'Cash / Online payment received (وصولی)'),
      date: new Date().toISOString().slice(0, 10),
      billNo: billNo.trim() || `KH-${Math.floor(100 + Math.random() * 900)}`,
    });

    setAmount('');
    setDescription('');
    setBillNo('');
  };

  const handleCopyWhatsAppReminder = () => {
    if (!selectedCustomer) return;
    const message = `السلام علیکم ${selectedCustomer.nameUrdu} صاحب (${selectedCustomer.name})،\nSK Balochi Dukan کے کھاتے کے مطابق آپ کے ذمے بقایا ادھار رقم PKR ${selectedCustomer.totalUdhaar.toLocaleString()} واجب الادا ہے۔ براہِ کرم سہولت کے مطابق ادائیگی فرما دیں۔ شکریہ!`;
    navigator.clipboard.writeText(message);
    setCopiedReminder(true);
    setTimeout(() => setCopiedReminder(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-sec)]">
            <span>CustomerKhataDao</span>
            <span aria-hidden="true">·</span>
            <span>Credit &amp; Vasooli Ledger</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)] mt-1">
            Udhaar Khata &amp; Customer Ledgers (گاہک ادھار کھاتہ)
          </h1>
        </div>

        <button
          type="button"
          onClick={onOpenNewCustomerModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1B5E20] hover:bg-[#114216] text-white text-xs font-semibold transition-colors self-start sm:self-auto min-h-[40px]"
        >
          <Plus className="w-4 h-4" />
          <span>New Customer Khata (نیا گاہک)</span>
        </button>
      </div>

      {/* Split Workspace: Left = Customer List (5 cols), Right = Selected Customer Ledger (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Directory */}
        <div className="lg:col-span-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--primary)]" />
              <span>Customers ({customers.length})</span>
            </h2>
            <span className="text-xs text-[var(--text-sec)] urdu">
              گاہکوں کی فہرست
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-[var(--text-ter)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              placeholder="Search name, Urdu, city, or phone..."
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:border-[var(--primary)] outline-none"
            />
          </div>

          <div className="space-y-2">
            {customers.map((cust) => {
              const isSelected = selectedCustomer?.id === cust.id;
              return (
                <button
                  key={cust.id}
                  type="button"
                  onClick={() => onSelectCustomer(cust.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-colors flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[var(--primary-light)] border-[var(--primary)]'
                      : 'bg-[var(--bg)] border-[var(--border)] hover:bg-[var(--surface-2)]'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-[var(--text)] truncate">
                      {cust.name}
                    </div>
                    <div className="text-xs text-[var(--primary)] urdu mt-0.5">
                      {cust.nameUrdu}
                    </div>
                    <div className="text-[11px] text-[var(--text-sec)] font-mono-num mt-1">
                      {cust.city} · {cust.phone}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`text-sm font-bold font-mono-num ${
                        cust.totalUdhaar > 0
                          ? 'text-[var(--udhaar)]'
                          : 'text-[var(--sale)]'
                      }`}
                    >
                      PKR {cust.totalUdhaar.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-[var(--text-sec)]">
                      {cust.totalUdhaar > 0 ? 'Receivable · واجب الادا' : 'Settled · بے باق'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Customer Detail & Entry Recorder */}
        <div className="lg:col-span-7 space-y-5">
          {selectedCustomer ? (
            <>
              <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-[var(--border)]">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-sec)]">
                      <span>{selectedCustomer.city}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-num">
                        {selectedCustomer.phone}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Updated {selectedCustomer.lastUpdated}</span>
                    </div>
                    <h2 className="text-xl font-bold text-[var(--text)] mt-1">
                      {selectedCustomer.name}
                    </h2>
                    <p className="text-base font-semibold text-[var(--primary)] urdu mt-0.5">
                      {selectedCustomer.nameUrdu}
                    </p>
                  </div>

                  <div className="flex flex-col sm:items-end">
                    <span className="text-xs text-[var(--text-sec)]">
                      Current Udhaar Balance (کل بقایا ادھار)
                    </span>
                    <span className="text-2xl font-bold font-mono-num text-[var(--udhaar)] mt-0.5">
                      PKR {selectedCustomer.totalUdhaar.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* WhatsApp Reminder & Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyWhatsAppReminder}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#1B5E20] hover:bg-[#114216] text-white text-xs font-semibold transition-colors min-h-[40px]"
                    >
                      {copiedReminder ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Urdu Reminder Copied!</span>
                        </>
                      ) : (
                        <>
                          <MessageCircle className="w-4 h-4" />
                          <span>Copy WhatsApp Reminder (واٹس ایپ تقاضا)</span>
                        </>
                      )}
                    </button>

                    <a
                      href={`tel:${selectedCustomer.phone}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--surface-2)] text-xs font-medium text-[var(--text)] min-h-[40px]"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span className="font-mono-num">
                        {selectedCustomer.phone}
                      </span>
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteCustomer(selectedCustomer.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-[var(--expense)] hover:bg-[var(--surface-2)] min-h-[40px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Khata</span>
                  </button>
                </div>

                {/* Record New Khata Entry Form */}
                <form
                  onSubmit={handleRecordEntry}
                  className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[var(--text)]">
                      Record Khata Transaction (نئی وصولی یا ادھار درج کریں)
                    </h3>
                    <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                      <button
                        type="button"
                        onClick={() => setEntryType('RECEIVED')}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                          entryType === 'RECEIVED'
                            ? 'bg-[#1B5E20] text-white'
                            : 'text-[var(--text-sec)]'
                        }`}
                      >
                        Vasooli / وصولی ہوئی (-)
                      </button>
                      <button
                        type="button"
                        onClick={() => setEntryType('GIVEN')}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                          entryType === 'GIVEN'
                            ? 'bg-[#EF6C00] text-white'
                            : 'text-[var(--text-sec)]'
                        }`}
                      >
                        Udhaar Given / ادھار دیا (+)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="number"
                      required
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Amount (PKR)"
                      className="h-10 px-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs font-mono-num text-[var(--text)] outline-none focus:border-[var(--primary)]"
                    />
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Description / تفصیل"
                      className="h-10 px-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text)] outline-none focus:border-[var(--primary)]"
                    />
                    <button
                      type="submit"
                      className="h-10 px-4 rounded-lg bg-[#1B5E20] hover:bg-[#114216] text-white text-xs font-semibold transition-colors"
                    >
                      Save Khata Entry
                    </button>
                  </div>
                </form>

                {/* Ledger History Table */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-[var(--text-sec)]">
                    Khata Statement History (کھاتہ تفصیلات)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--border)] text-[11px] font-semibold text-[var(--text-sec)]">
                          <th className="py-2.5 pr-3">Date &amp; Bill</th>
                          <th className="py-2.5 px-3">Particulars / تفصیل</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 pl-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)] text-xs">
                        {selectedCustomerEntries.map((entry) => {
                          const isGiven = entry.entryType === 'GIVEN';
                          return (
                            <tr key={entry.id}>
                              <td className="py-3 pr-3 font-mono-num text-[var(--text-sec)] whitespace-nowrap">
                                <div>{entry.date}</div>
                                <div className="text-[10px] text-[var(--text-ter)]">
                                  {entry.billNo}
                                </div>
                              </td>
                              <td className="py-3 px-3 text-[var(--text)] font-medium">
                                {entry.description}
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap text-[var(--text-sec)]">
                                {isGiven
                                  ? 'Udhaar Given · ادھار دیا'
                                  : 'Received · وصولی'}
                              </td>
                              <td
                                className={`py-3 pl-3 text-right font-mono-num font-bold whitespace-nowrap ${
                                  isGiven
                                    ? 'text-[var(--udhaar)]'
                                    : 'text-[var(--sale)]'
                                }`}
                              >
                                {isGiven ? '+' : '-'} PKR{' '}
                                {entry.amount.toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-8 text-center text-sm text-[var(--text-sec)]">
              Select a customer from the left list to inspect their Khata ledger.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
