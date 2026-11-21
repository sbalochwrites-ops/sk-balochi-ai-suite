/**
 * Web Authentication API (WebAuthn) Biometric Security Layer
 * Supports platform authenticators (Touch ID, Face ID, Windows Hello, Android Biometrics)
 * with a Web Crypto SHA-256 salted Recovery PIN fallback for unsupported/sandboxed browsers.
 */

const BIOMETRIC_CONFIG_KEY = 'sk_ai_studio_biometric_config_v1';
const SESSION_UNLOCKED_KEY = 'sk_ai_studio_session_unlocked_v1';

export interface BiometricConfig {
  enabled: boolean;
  requireOnLaunch: boolean;
  webAuthnEnrolled: boolean;
  credentialId?: string; // Base64URL encoded PublicKeyCredential.rawId
  rpId?: string;
  userDisplayName?: string;
  deviceLabel?: string;
  enrolledAt?: string;
  lastAuthenticatedAt?: string;
  recoveryPinHash?: string; // Hex SHA-256 hash of salted PIN
  recoveryPinSalt?: string;
}

export interface BiometricCapabilities {
  isSecureContext: boolean;
  isWebAuthnSupported: boolean;
  isPlatformAuthenticatorAvailable: boolean;
  isEmbeddedIframe: boolean;
  platformLabel: string;
}

export interface BiometricResult {
  success: boolean;
  method?: 'webauthn' | 'pin';
  error?: string;
  errorCode?: string;
}

const DEFAULT_CONFIG: BiometricConfig = {
  enabled: false,
  requireOnLaunch: true,
  webAuthnEnrolled: false,
};

// Base64URL encoding/decoding helpers for ArrayBuffer <-> localStorage
function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBuffer(base64Url: string): Uint8Array {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    out[i] = raw.charCodeAt(i);
  }
  return out;
}

function detectPlatformLabel(): string {
  if (typeof navigator === 'undefined') return 'Platform Authenticator';
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return 'Face ID / Touch ID (iOS)';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'Touch ID (macOS)';
  if (/Android/i.test(ua)) return 'Fingerprint / Face Unlock (Android)';
  if (/Windows/i.test(ua)) return 'Windows Hello';
  return 'Platform Biometric Sensor';
}

export function getBiometricConfig(): BiometricConfig {
  try {
    const raw = localStorage.getItem(BIOMETRIC_CONFIG_KEY);
    if (!raw) return { ...DEFAULT_CONFIG };
    const parsed = JSON.parse(raw) as Partial<BiometricConfig>;
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
    };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveBiometricConfig(config: BiometricConfig): void {
  try {
    localStorage.setItem(BIOMETRIC_CONFIG_KEY, JSON.stringify(config));
  } catch {
    // Ignore storage quota restrictions
  }
}

export function isSessionUnlocked(): boolean {
  try {
    return sessionStorage.getItem(SESSION_UNLOCKED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markSessionUnlocked(): void {
  try {
    sessionStorage.setItem(SESSION_UNLOCKED_KEY, 'true');
  } catch {
    // Ignore
  }
}

export function lockCurrentSession(): void {
  try {
    sessionStorage.removeItem(SESSION_UNLOCKED_KEY);
  } catch {
    // Ignore
  }
}

export async function checkBiometricCapabilities(): Promise<BiometricCapabilities> {
  const isSecureContext =
    typeof window !== 'undefined' && Boolean(window.isSecureContext);
  const isWebAuthnSupported =
    typeof window !== 'undefined' &&
    typeof window.PublicKeyCredential !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    typeof navigator.credentials !== 'undefined';

  let isEmbeddedIframe = false;
  try {
    isEmbeddedIframe = typeof window !== 'undefined' && window.self !== window.top;
  } catch {
    isEmbeddedIframe = true;
  }

  let isPlatformAuthenticatorAvailable = false;
  if (
    isWebAuthnSupported &&
    typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable ===
      'function'
  ) {
    try {
      isPlatformAuthenticatorAvailable =
        await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      isPlatformAuthenticatorAvailable = false;
    }
  }

  return {
    isSecureContext,
    isWebAuthnSupported,
    isPlatformAuthenticatorAvailable,
    isEmbeddedIframe,
    platformLabel: detectPlatformLabel(),
  };
}

function mapWebAuthnError(err: unknown): { message: string; code: string } {
  const domErr = err as { name?: string; message?: string };
  const name = domErr?.name || 'UnknownError';
  const msg = domErr?.message || '';

  if (name === 'NotAllowedError') {
    if (msg.toLowerCase().includes('publickey-credentials')) {
      return {
        code: 'IFRAME_POLICY_BLOCKED',
        message:
          'WebAuthn biometric prompts are restricted inside embedded preview frames. Open the app directly in a top-level browser tab for Touch ID / Face ID, or configure a Recovery PIN below.',
      };
    }
    return {
      code: 'NotAllowedError',
      message:
        'Biometric prompt was cancelled or timed out. Tap retry to authenticate again.',
    };
  }

  if (name === 'SecurityError') {
    return {
      code: 'SecurityError',
      message:
        'WebAuthn requires a secure HTTPS origin or localhost without cross-origin iframe restrictions.',
    };
  }

  if (name === 'NotSupportedError') {
    return {
      code: 'NotSupportedError',
      message:
        'No compatible fingerprint or facial recognition authenticator was detected on this device.',
    };
  }

  if (name === 'InvalidStateError') {
    return {
      code: 'InvalidStateError',
      message:
        'A biometric passkey is already registered on this device.',
    };
  }

  return {
    code: name,
    message: msg || 'Biometric authentication could not be completed.',
  };
}

/**
 * Enrolls a real platform biometric passkey using navigator.credentials.create()
 */
export async function enrollBiometricPasskey(
  userDisplayName = 'SK AI Studio Owner'
): Promise<BiometricResult> {
  if (
    typeof window === 'undefined' ||
    typeof window.PublicKeyCredential === 'undefined' ||
    !navigator.credentials
  ) {
    return {
      success: false,
      errorCode: 'UNSUPPORTED',
      error:
        'The Web Authentication API is not supported in this browser. Use a modern browser or configure a Recovery PIN.',
    };
  }

  try {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const userId = new Uint8Array(16);
    crypto.getRandomValues(userId);

    const rpId = window.location.hostname;

    const publicKey: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'SK AI Studio',
        id: rpId,
      },
      user: {
        id: userId,
        name: 'owner@sk-ai-studio.local',
        displayName: userDisplayName,
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' }, // ES256 (ECDSA w/ SHA-256)
        { alg: -257, type: 'public-key' }, // RS256 (RSASSA-PKCS1-v1_5 w/ SHA-256)
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'preferred',
      },
      timeout: 60000,
      attestation: 'none',
    };

    const credential = (await navigator.credentials.create({
      publicKey,
    })) as PublicKeyCredential | null;

    if (!credential || !credential.rawId) {
      return {
        success: false,
        errorCode: 'NO_CREDENTIAL',
        error: 'No biometric credential was returned by the authenticator.',
      };
    }

    const encodedCredentialId = bufferToBase64Url(credential.rawId);
    const nowIso = new Date().toISOString();
    const existing = getBiometricConfig();

    const updated: BiometricConfig = {
      ...existing,
      enabled: true,
      requireOnLaunch: true,
      webAuthnEnrolled: true,
      credentialId: encodedCredentialId,
      rpId,
      userDisplayName,
      deviceLabel: detectPlatformLabel(),
      enrolledAt: nowIso,
      lastAuthenticatedAt: nowIso,
    };

    saveBiometricConfig(updated);
    markSessionUnlocked();

    return {
      success: true,
      method: 'webauthn',
    };
  } catch (err) {
    const mapped = mapWebAuthnError(err);
    return {
      success: false,
      errorCode: mapped.code,
      error: mapped.message,
    };
  }
}

/**
 * Verifies user presence & identity via navigator.credentials.get()
 */
export async function verifyBiometricPasskey(): Promise<BiometricResult> {
  const config = getBiometricConfig();

  if (!config.webAuthnEnrolled || !config.credentialId) {
    return {
      success: false,
      errorCode: 'NOT_ENROLLED',
      error: 'No biometric credential is enrolled on this device yet.',
    };
  }

  if (
    typeof window === 'undefined' ||
    typeof window.PublicKeyCredential === 'undefined' ||
    !navigator.credentials
  ) {
    return {
      success: false,
      errorCode: 'UNSUPPORTED',
      error: 'Web Authentication API is unavailable in this browser.',
    };
  }

  try {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);
    const expectedChallengeB64 = bufferToBase64Url(challenge.buffer);

    const credentialIdBytes = base64UrlToBuffer(config.credentialId);

    const publicKey: PublicKeyCredentialRequestOptions = {
      challenge,
      rpId: config.rpId || window.location.hostname,
      allowCredentials: [
        {
          id: credentialIdBytes.buffer as ArrayBuffer,
          type: 'public-key',
          transports: ['internal'],
        },
      ],
      userVerification: 'required',
      timeout: 60000,
    };

    const assertion = (await navigator.credentials.get({
      publicKey,
    })) as PublicKeyCredential | null;

    if (!assertion) {
      return {
        success: false,
        errorCode: 'NO_ASSERTION',
        error: 'Biometric verification returned an empty assertion.',
      };
    }

    // Verify clientDataJSON challenge and operation type
    const response = assertion.response as AuthenticatorAssertionResponse;
    if (response?.clientDataJSON) {
      const clientDataText = new TextDecoder().decode(response.clientDataJSON);
      const clientData = JSON.parse(clientDataText) as {
        type?: string;
        challenge?: string;
      };
      if (
        clientData.type !== 'webauthn.get' ||
        clientData.challenge !== expectedChallengeB64
      ) {
        return {
          success: false,
          errorCode: 'CHALLENGE_MISMATCH',
          error: 'Cryptographic challenge verification failed. Please try again.',
        };
      }
    }

    saveBiometricConfig({
      ...config,
      lastAuthenticatedAt: new Date().toISOString(),
    });
    markSessionUnlocked();

    return {
      success: true,
      method: 'webauthn',
    };
  } catch (err) {
    const mapped = mapWebAuthnError(err);
    return {
      success: false,
      errorCode: mapped.code,
      error: mapped.message,
    };
  }
}

async function hashPin(pin: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${pin}:sk-ai-studio`);
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Minimal deterministic fallback if crypto.subtle is unavailable on non-HTTPS dev
  let hash = 2166136261;
  for (let i = 0; i < data.length; i++) {
    hash ^= data[i];
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

export async function configureRecoveryPin(
  pin: string,
  enableLockIfDisabled = true
): Promise<BiometricResult> {
  const cleaned = pin.trim();
  if (!/^\d{4,6}$/.test(cleaned)) {
    return {
      success: false,
      error: 'Recovery PIN must be 4 to 6 numeric digits.',
    };
  }

  const saltBytes = new Uint8Array(12);
  crypto.getRandomValues(saltBytes);
  const salt = bufferToBase64Url(saltBytes.buffer);
  const pinHash = await hashPin(cleaned, salt);

  const existing = getBiometricConfig();
  const nowIso = new Date().toISOString();

  saveBiometricConfig({
    ...existing,
    enabled: enableLockIfDisabled ? true : existing.enabled,
    requireOnLaunch: existing.requireOnLaunch,
    recoveryPinSalt: salt,
    recoveryPinHash: pinHash,
    enrolledAt: existing.enrolledAt || nowIso,
    lastAuthenticatedAt: nowIso,
  });

  markSessionUnlocked();
  return { success: true, method: 'pin' };
}

export async function verifyRecoveryPin(pin: string): Promise<BiometricResult> {
  const config = getBiometricConfig();
  if (!config.recoveryPinHash || !config.recoveryPinSalt) {
    return {
      success: false,
      error: 'No Recovery PIN is configured.',
    };
  }

  const candidateHash = await hashPin(pin.trim(), config.recoveryPinSalt);
  if (candidateHash !== config.recoveryPinHash) {
    return {
      success: false,
      error: 'Incorrect Recovery PIN. Please try again.',
    };
  }

  saveBiometricConfig({
    ...config,
    lastAuthenticatedAt: new Date().toISOString(),
  });
  markSessionUnlocked();

  return { success: true, method: 'pin' };
}

export function setRequireLockOnLaunch(requireOnLaunch: boolean): BiometricConfig {
  const updated: BiometricConfig = {
    ...getBiometricConfig(),
    requireOnLaunch,
  };
  saveBiometricConfig(updated);
  return updated;
}

export function disableBiometricProtection(): BiometricConfig {
  const cleared: BiometricConfig = { ...DEFAULT_CONFIG };
  saveBiometricConfig(cleared);
  markSessionUnlocked();
  return cleared;
}
