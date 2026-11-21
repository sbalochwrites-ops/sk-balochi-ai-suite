import React, { useEffect, useState } from 'react';
import {
  Fingerprint,
  KeyRound,
  Sun,
  Moon,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import {
  BiometricConfig,
  verifyBiometricPasskey,
  verifyRecoveryPin,
} from '../services/biometricAuth';

interface BiometricLockScreenProps {
  config: BiometricConfig;
  isDark: boolean;
  onToggleTheme: () => void;
  onUnlocked: () => void;
}

export const BiometricLockScreen: React.FC<BiometricLockScreenProps> = ({
  config,
  isDark,
  onToggleTheme,
  onUnlocked,
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPinMode, setShowPinMode] = useState(!config.webAuthnEnrolled);
  const [pinInput, setPinInput] = useState('');

  const handleBiometricUnlock = async () => {
    setIsVerifying(true);
    setErrorMessage(null);
    const result = await verifyBiometricPasskey();
    setIsVerifying(false);

    if (result.success) {
      onUnlocked();
    } else {
      setErrorMessage(
        result.error || 'Biometric authentication failed. Please try again.'
      );
    }
  };

  // Automatically trigger WebAuthn prompt once on mount when enrolled
  useEffect(() => {
    if (config.webAuthnEnrolled && !showPinMode) {
      // Short delay so the lock surface renders cleanly before OS biometric sheet appears
      const timer = window.setTimeout(() => {
        void handleBiometricUnlock();
      }, 250);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, []);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    setIsVerifying(true);
    setErrorMessage(null);

    const result = await verifyRecoveryPin(pinInput);
    setIsVerifying(false);

    if (result.success) {
      setPinInput('');
      onUnlocked();
    } else {
      setErrorMessage(result.error || 'Incorrect Recovery PIN.');
    }
  };

  const hasPinFallback = Boolean(config.recoveryPinHash);

  return (
    <div className="min-h-screen w-full bg-[var(--bg)] text-[var(--text)] flex flex-col">
      {/* Minimal Top Bar */}
      <header className="flex items-center justify-between px-6 h-16 border-b border-[var(--border)] bg-[var(--surface)]">
        <span className="text-lg font-bold tracking-tight text-[var(--primary)] whitespace-nowrap shrink-0">
          SK AI Studio
        </span>
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-pressed={isDark}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] rounded-lg border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--surface-2)] text-[var(--text)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Centered Biometric Gate */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-8 space-y-6 shadow-[var(--card-shadow)]">
          <div className="space-y-2 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-[var(--primary-light)] border border-[var(--border)] flex items-center justify-center">
              {showPinMode ? (
                <KeyRound className="w-7 h-7 text-[var(--primary)]" />
              ) : (
                <Fingerprint className="w-7 h-7 text-[var(--primary)]" />
              )}
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-sec)] pt-2">
              <span>Web Authentication API</span>
              <span aria-hidden="true">·</span>
              <span>{config.deviceLabel || 'Biometric Protection'}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">
              Session Locked
            </h1>
            <p
              dir="rtl"
              className="text-sm font-semibold text-[var(--primary)] urdu"
            >
              ایپ مقفل ہے — فنگر پرنٹ یا فیس آئی ڈی سے ان لاک کریں
            </p>
            <p className="text-xs text-[var(--text-sec)] leading-relaxed pt-1">
              Verify your identity to access Roznamcha cashbooks, Udhaar Khata
              ledgers, and AI Studio prompt workflows.
            </p>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {!showPinMode && config.webAuthnEnrolled ? (
            <div className="space-y-3">
              <button
                type="button"
                disabled={isVerifying}
                onClick={handleBiometricUnlock}
                className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-[#1B5E20] hover:bg-[#114216] disabled:opacity-60 text-white text-sm font-semibold transition-colors min-h-[46px] focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Waiting for Biometric Sensor...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-5 h-5" />
                    <span>Unlock with Fingerprint / Face ID</span>
                  </>
                )}
              </button>

              {hasPinFallback && (
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setShowPinMode(true);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--surface-2)] text-xs font-semibold text-[var(--text)] transition-colors min-h-[42px]"
                >
                  <KeyRound className="w-4 h-4 text-[var(--primary)]" />
                  <span>Unlock with Recovery PIN</span>
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="lock-recovery-pin"
                  className="block text-xs font-medium text-[var(--text-sec)] mb-1.5"
                >
                  Enter 4–6 Digit Recovery PIN (ریکوری پن درج کریں)
                </label>
                <input
                  id="lock-recovery-pin"
                  type="password"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) =>
                    setPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  placeholder="••••"
                  autoFocus
                  className="w-full h-12 px-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-center text-lg tracking-[0.4em] font-mono-num text-[var(--text)] focus:border-[var(--primary)] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying || pinInput.length < 4}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1B5E20] hover:bg-[#114216] disabled:opacity-60 text-white text-sm font-semibold transition-colors min-h-[46px]"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying PIN...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Unlock Session</span>
                  </>
                )}
              </button>

              {config.webAuthnEnrolled && (
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setShowPinMode(false);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--surface-2)] text-xs font-semibold text-[var(--text)] transition-colors min-h-[42px]"
                >
                  <Fingerprint className="w-4 h-4 text-[var(--primary)]" />
                  <span>Use Fingerprint / Face ID Instead</span>
                </button>
              )}
            </form>
          )}

          {config.lastAuthenticatedAt && (
            <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--text-ter)] font-mono-num">
              <span>Protected Ledger</span>
              <span>
                Last Verified:{' '}
                {new Date(config.lastAuthenticatedAt).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
