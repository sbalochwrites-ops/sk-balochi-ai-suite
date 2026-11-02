import React, { useState } from 'react';
import { X } from 'lucide-react';
import { TransactionEntity, TransactionType } from '../database/entities';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<TransactionEntity, 'id'>) => void;
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
}) => {
  const [type, setType] = useState<TransactionType>('SALE');
  const [title, setTitle] = useState('');
  const [titleUrdu, setTitleUrdu] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'ONLINE' | 'UDHAAR'>(
    'CASH'
  );
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!title.trim() || !numericAmount || numericAmount <= 0) return;

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
                <option value="UDHAAR">Udhaar (ادھار)</option>
              </select>
            </div>
          </div>

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
