import React, { useState, useEffect } from 'react';
import { X, UserCheck } from 'lucide-react';
import { TransactionEntity, TransactionType, CustomerEntity } from '../database/entities';
import { customerKhataDao } from '../dao/CustomerKhataDao';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<TransactionEntity, 'id'>) => void;
  initialType?: TransactionType;
  initialPaymentMode?: 'CASH' | 'ONLINE' | 'UDHAAR';
}

const CATEGORIES = [
  'Apparel & Crafts',
  'E-Commerce',
  'Digital Assets',
  'Raw Material',
  'Logistics',
  'Utilities',
  'Shop Rent & Wages',
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialType = 'SALE',
  initialPaymentMode = 'CASH',
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [title, setTitle] = useState('');
  const [titleUrdu, setTitleUrdu] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'ONLINE' | 'UDHAAR'>(
    initialPaymentMode
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customers, setCustomers] = useState<CustomerEntity[]>([]);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setPaymentMode(initialPaymentMode);
      const list = customerKhataDao.getAllCustomers();
      setCustomers(list);
      if (list.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(list[0].id);
      }
    }
  }, [isOpen, initialType, initialPaymentMode]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!title.trim() || !numericAmount || numericAmount <= 0) return;

    const matchedCustomer =
      paymentMode === 'UDHAAR'
        ? customers.find((c) => c.id === selectedCustomerId)
        : undefined;

    const now = new Date();
    onSave({
      title: title.trim(),
      titleUrdu:
        titleUrdu.trim() ||
        (type === 'SALE' ? 'نئی بکری انٹری' : 'نیا دکان خرچہ'),
      amount: numericAmount,
      type,
      category,
      paymentMode,
      customerId: matchedCustomer?.id,
      customerName: matchedCustomer?.name,
      date: now.toISOString().slice(0, 10),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note: note.trim() || undefined,
    });

    setTitle('');
    setTitleUrdu('');
    setAmount('');
    setNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-lg font-bold text-[var(--text)]">
              Record Roznamcha Entry
            </h2>
            <p className="text-xs text-[var(--text-sec)] urdu mt-0.5">
              نیا روزنامچہ اندراج (بکری یا خرچہ درج کریں)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg text-[var(--text-sec)] hover:bg-[var(--surface-2)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Interactive Type Segmented Control */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[var(--surface-2)]">
            <button
              type="button"
              onClick={() => setType('SALE')}
              className={`py-2 px-4 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                type === 'SALE'
                  ? 'bg-[#1B5E20] text-white'
                  : 'text-[var(--text-sec)] hover:text-[var(--text)]'
              }`}
            >
              Sale / بکری (آمدن)
            </button>
            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className={`py-2 px-4 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                type === 'EXPENSE'
                  ? 'bg-[#C62828] text-white'
                  : 'text-[var(--text-sec)] hover:text-[var(--text)]'
              }`}
            >
              Expense / خرچہ (ادائیگی)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-sec)] mb-1">
                Entry Title (English)
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Balochi Dress Order #12"
                className="w-full h-11 px-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm text-[var(--text)] focus:border-[var(--primary)] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-sec)] mb-1">
                تفصیل (اردو میں - اختیاری)
              </label>
              <input
                type="text"
                dir="rtl"
                value={titleUrdu}
                onChange={(e) => setTitleUrdu(e.target.value)}
                placeholder="مثلاً: بلوچی شال آرڈر"
                className="w-full h-11 px-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm text-[var(--text)] urdu focus:border-[var(--primary)] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-sec)] mb-1">
                Amount (PKR / روپے)
              </label>
              <input
                type="number"
                required
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="15000"
                className="w-full h-11 px-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm font-mono-num text-[var(--text)] focus:border-[var(--primary)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-sec)] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm text-[var(--text)] focus:border-[var(--primary)] outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-sec)] mb-1">
                Payment Mode
              </label>
              <select
                value={paymentMode}
                onChange={(e) =>
                  setPaymentMode(
                    e.target.value as 'CASH' | 'ONLINE' | 'UDHAAR'
                  )
                }
                className="w-full h-11 px-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm text-[var(--text)] focus:border-[var(--primary)] outline-none"
              >
                <option value="CASH">Cash (نقد)</option>
                <option value="ONLINE">Online / Bank</option>
                <option value="UDHAAR">Udhaar (ادھار کھاتہ)</option>
              </select>
            </div>
          </div>

          {/* Conditional Customer Picker for Udhaar */}
          {paymentMode === 'UDHAAR' && (
            <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[var(--primary)]" />
                  <span>Select Khata Customer (گاہک کا انتخاب کریں)</span>
                </label>
                <span className="text-[11px] text-[var(--udhaar)] font-medium">
                  Linked to Customer Ledger
                </span>
              </div>
              {customers.length > 0 ? (
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm text-[var(--text)] focus:border-[var(--primary)] outline-none"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.nameUrdu}) — Current Udhaar: PKR {c.totalUdhaar.toLocaleString()}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-xs text-[var(--text-sec)] py-1">
                  No customers found. Create a customer in Udhaar Khata first.
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[var(--text-sec)] mb-1">
              Reference Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Invoice number, courier tracking, or supplier note..."
              className="w-full h-11 px-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm text-[var(--text)] focus:border-[var(--primary)] outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-[var(--border)] text-[var(--text-sec)] hover:bg-[var(--surface-2)] min-h-[40px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-lg text-white bg-[#1B5E20] hover:bg-[#114216] min-h-[40px]"
            >
              Save to Database
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
