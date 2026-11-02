import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CustomerEntity } from '../database/entities';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCustomer: (
    payload: Omit<CustomerEntity, 'id' | 'lastUpdated'>
  ) => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSaveCustomer,
}) => {
  const [name, setName] = useState('');
  const [nameUrdu, setNameUrdu] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Quetta');
  const [openingUdhaar, setOpeningUdhaar] = useState('0');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSaveCustomer({
      name: name.trim(),
      nameUrdu: nameUrdu.trim() || name.trim(),
      phone: phone.trim() || '0300-0000000',
      city: city.trim() || 'Quetta',
      totalUdhaar: Math.max(0, Number(openingUdhaar) || 0),
    });
    setName('');
    setNameUrdu('');
    setPhone('');
    setOpeningUdhaar('0');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-lg font-bold text-[var(--text)]">
              Add New Khata Customer
            </h2>
            <p className="text-xs text-[var(--text-sec)] urdu mt-0.5">
              نیا گاہک کھاتہ شامل کریں
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
          <div>
            <label className="block text-xs font-medium text-[var(--text-sec)] mb-1">
              Customer / Business Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nawab Cloth House"
              className="w-full h-11 px-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm text-[var(--text)] focus:border-[var(--primary)] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-sec)] mb-1">
              گاہک کا نام (اردو میں)
            </label>
            <input
              type="text"
              dir="rtl"
              value={nameUrdu}
              onChange={(e) => setNameUrdu(e.target.value)}
              placeholder="مثلاً: نواب کلاتھ ہاؤس"
              className="w-full h-11 px-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm text-[var(--text)] urdu focus:border-[var(--primary)] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-sec)] mb-1">
                Phone / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0300-1234567"
                className="w-full h-11 px-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm font-mono-num text-[var(--text)] focus:border-[var(--primary)] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-sec)] mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Quetta"
                className="w-full h-11 px-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm text-[var(--text)] focus:border-[var(--primary)] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-sec)] mb-1">
              Opening Udhaar Balance (PKR / ابتدائی بقایا)
            </label>
            <input
              type="number"
              min="0"
              value={openingUdhaar}
              onChange={(e) => setOpeningUdhaar(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm font-mono-num text-[var(--text)] focus:border-[var(--primary)] outline-none"
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
              Create Khata
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
