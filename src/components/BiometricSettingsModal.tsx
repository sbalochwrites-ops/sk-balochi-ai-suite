import React, { useEffect, useState } from 'react';
import {
  X,
  Fingerprint,
  ShieldCheck,
  Lock,
  KeyRound,
  Check,
  AlertCircle,
  Loader2,
  Trash2,
} from 'lucide-react';
import {
  BiometricCapabilities,
  BiometricConfig,
  checkBiometricCapabilities,
  configureRecoveryPin,
  disableBiometricProtection,
  enrollBiometricPasskey,
  getBiometricConfig,
  setRequireLockOnLaunch,
  verifyBiometricPasskey,
} from '../services/biometricAuth';

interface BiometricSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BiometricConfig;
  onConfigChange: (next: BiometricConfig) => void;
  onLockNow: () => void;
}

export const BiometricSettingsModal: React.FC<BiometricSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
  onLockNow,
}) => {
  const [capabilities, setCapabilities] =
    useState<BiometricCapabilities | null>(null);
  const [busyAction, setBusyAction] = useState<
    'enroll' | 'verify' | 'pin' | null
  >(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [pinValue, setPinValue] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setFeedback(null);
    let active = true;
    void checkBiometricCapabilities().then((caps) => {
      if (active) setCapabilities(caps);
    });
    return () => {
      active = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEnrollWebAuthn = async () => {
    setBusyAction('enroll');
    setFeedback(null);
    const result = await enrollBiometricPasskey('SK AI Studio Owner');
    setBusyAction(null);

    if (result.success) {
      const updated = getBiometricConfig();
      onConfigChange(updated);
      setFeedback({
        type: 'success',
        text: 'Biometric passkey enrolled successfully via Web Authentication API.',
      });
    } else {
      setFeedback({
        type: 'error',
        text: result.error || 'Biometric enrollment failed.',
      });
    }
  };

  const handleTestVerification = async () => {
    setBusyAction('verify');
    setFeedback(null);
    const result = await verifyBiometricPasskey();
    setBusyAction(null);

    if (result.success) {
      const updated = getBiometricConfig();
      onConfigChange(updated);
      setFeedback({
        type: 'success',
        text: 'Fingerprint / Face ID assertion verified with cryptographic challenge match.',
      });
    } else {
      setFeedback({
        type: 'error',
        text: result.error || 'Biometric verification failed.',
      });
    }
  };

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4,6}$/.test(pinValue)) {
      setFeedback({
        type: 'error',
        text: 'Recovery PIN must be 4 to 6 numeric digits.',
      });
      return;
    }
    if (pinValue !== pinConfirm) {
      setFeedback({
        type: 'error',
        text: 'PIN confirmation does not match.',
      });
      return;
    }

    setBusyAction('pin');
    setFeedback(null);
    const result = await configureRecoveryPin(pinValue, true);
    setBusyAction(null);

    if (result.success) {
      setPinValue('');
      setPinConfirm('');
      onConfigChange(getBiometricConfig());
      setFeedback({
        type: 'success',
        text: 'SHA-256 Recovery PIN saved and session lock protection enabled.',
      });
    } else {
      setFeedback({
        type: 'error',
        text: result.error || 'Could not save Recovery PIN.',
      });
    }
  };

  const handleToggleRequireOnLaunch = () => {
    const updated = setRequireLockOnLaunch(!config.requireOnLaunch);
    onConfigChange(updated);
  };

  const handleDisableAll = () => {
    const cleared = disableBiometricProtection();
    onConfigChange(cleared);
    setFeedback({
      type: 'success',
      text: 'Biometric lock and credentials removed from this browser.',
    });
  };

  const handleLockSession = () => {
    onClose();
    onLockNow();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="biometric-settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div className="w-full max-w-xl my-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--border)]">
          <div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-sec)]">
              <span>Web Authentication API</span>
              <span aria-hidden="true">·</span>
              <span>
                {config.enabled ? 'Protection Active' : 'Not Configured'}
              </span>
            </div>
            <h2
              id="biometric-settings-title"
              className="text-lg font-bold text-[var(--text)] mt-1"
            >
              Biometric Session Security
            </h2>
            <p
              dir="rtl"
              className="text-xs text-[var(--primary)] font-semibold urdu mt-0.5"
            >
              فنگر پرنٹ اور فیس آئی ڈی سیکیورٹی لاک سیٹنگز
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close security settings"
            className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg text-[var(--text-sec)] hover:bg-[var(--surface-2)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hardware / Browser Capability Summary (Zero-Pill Metadata) */}
        <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--text)]">
              Authenticator Environment
            </span>
            <span className="font-mono-num text-[var(--text-sec)]">
              {capabilities?.platformLabel ?? 'Detecting...'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-sec)]">
            <span>
              WebAuthn API:{' '}
              <strong className="text-[var(--text)]">
                {capabilities?.isWebAuthnSupported ? 'Supported' : 'Unavailable'}
              </strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Platform Biometrics:{' '}
              <strong className="text-[var(--text)]">
                {capabilities?.isPlatformAuthenticatorAvailable
                  ? 'Available'
                  : 'Not Detected'}
              </strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Secure Context:{' '}
              <strong className="text-[var(--text)]">
                {capabilities?.isSecureContext ? 'HTTPS / Local' : 'Insecure'}
              </strong>
            </span>
          </div>
          {capabilities?.isEmbeddedIframe && (
            <p className="text-[11px] text-[var(--text-sec)] pt-1 leading-relaxed">
              Note: Some embedded preview iframes restrict browser passkey
              sheets. If your browser blocks WebAuthn here, open the app in a
              standalone tab or set a SHA-256 Recovery PIN below to test locking
              immediately.
            </p>
          )}
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            role="status"
            className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed">{feedback.text}</span>
          </div>
        )}

        {/* Section 1: WebAuthn Biometric Credential Enrollment */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--text)]">
                Fingerprint &amp; Facial Recognition (WebAuthn)
              </h3>
              <p className="text-xs text-[var(--text-sec)] mt-0.5">
                {config.webAuthnEnrolled && config.credentialId
                  ? `Passkey registered (${config.credentialId.slice(0, 12)}…) · Enrolled ${
                      config.enrolledAt
                        ? new Date(config.enrolledAt).toLocaleDateString()
                        : ''
                    }`
                  : 'Register your device sensor (Touch ID, Face ID, Windows Hello, or Android Biometrics).'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={busyAction !== null}
              onClick={handleEnrollWebAuthn}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#1B5E20] hover:bg-[#114216] disabled:opacity-60 text-white text-xs font-semibold transition-colors min-h-[40px]"
            >
              {busyAction === 'enroll' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Waiting for Sensor...</span>
                </>
              ) : (
                <>
                  <Fingerprint className="w-4 h-4" />
                  <span>
                    {config.webAuthnEnrolled
                      ? 'Re-Enroll Biometric Passkey'
                      : 'Enroll Fingerprint / Face ID'}
                  </span>
                </>
              )}
            </button>

            {config.webAuthnEnrolled && (
              <button
                type="button"
                disabled={busyAction !== null}
                onClick={handleTestVerification}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--surface-2)] text-xs font-semibold text-[var(--text)] transition-colors min-h-[40px]"
              >
                {busyAction === 'verify' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[var(--primary)]" />
                    <span>Test Biometric Prompt</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Section 2: Recovery PIN Fallback */}
        <form
          onSubmit={handleSavePin}
          className="pt-4 border-t border-[var(--border)] space-y-3"
        >
          <div>
            <h3 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[var(--primary)]" />
              <span>
                {config.recoveryPinHash
                  ? 'Update Recovery PIN Fallback'
                  : 'Configure Recovery PIN Fallback (Optional)'}
              </span>
            </h3>
            <p className="text-xs text-[var(--text-sec)] mt-0.5">
              Stored locally as a salted SHA-256 hash so you can always unlock
              if a biometric sensor is unavailable.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pinValue}
              onChange={(e) =>
                setPinValue(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              placeholder="4–6 digit PIN"
              aria-label="New 4 to 6 digit Recovery PIN"
              className="h-10 px-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs font-mono-num text-[var(--text)] focus:border-[var(--primary)] outline-none"
            />
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pinConfirm}
              onChange={(e) =>
                setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              placeholder="Confirm PIN"
              aria-label="Confirm Recovery PIN"
              className="h-10 px-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs font-mono-num text-[var(--text)] focus:border-[var(--primary)] outline-none"
            />
            <button
              type="submit"
              disabled={busyAction !== null || pinValue.length < 4}
              className="h-10 px-4 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--primary-light)] disabled:opacity-50 text-xs font-semibold text-[var(--text)] transition-colors whitespace-nowrap"
            >
              {busyAction === 'pin' ? 'Saving...' : 'Save PIN'}
            </button>
          </div>
        </form>

        {/* Section 3: Session Controls when enabled */}
        {config.enabled && (
          <div className="pt-4 border-t border-[var(--border)] space-y-4">
            <label className="flex items-center justify-between gap-4 cursor-pointer">
              <div>
                <div className="text-xs font-semibold text-[var(--text)]">
                  Require Unlock on New Browser Session
                </div>
                <div className="text-[11px] text-[var(--text-sec)]">
                  Automatically present the biometric lock screen when opening a
                  new tab.
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.requireOnLaunch}
                onChange={handleToggleRequireOnLaunch}
                className="w-4 h-4 accent-[#1B5E20] rounded cursor-pointer"
              />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleLockSession}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1B5E20] hover:bg-[#114216] text-white text-xs font-semibold min-h-[40px]"
              >
                <Lock className="w-4 h-4" />
                <span>Lock Session Now</span>
              </button>

              <button
                type="button"
                onClick={handleDisableAll}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-[var(--expense)] hover:bg-[var(--surface-2)] min-h-[40px]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Disable Biometric Lock</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
