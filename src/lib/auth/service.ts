// Auth Service - OTP-based authentication
import type { AuthSession } from './types';

const SESSION_KEY = 'auth_session';
const TOKEN_KEY = 'auth_token';
const listeners = new Set<(session: AuthSession | null) => void>();

function getBaseUrl(): string {
  const url = import.meta.env.VITE_API_URL || '';
  const projectId = import.meta.env.VITE_PROJECT_ID || '';
  return `${url}/functions/v1/shop/${projectId}`;
}

function notify(session: AuthSession | null) {
  listeners.forEach((fn) => fn(session));
}

export function getSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    if (session.expires_at && Date.now() / 1000 > session.expires_at) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function saveSession(session: AuthSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(TOKEN_KEY, session.access_token);
  notify(session);
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
  notify(null);
}

export async function requestOtp(phone: string): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`${getBaseUrl()}/auth/otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
  return data;
}

export async function verifyOtp(phone: string, token: string): Promise<AuthSession> {
  const res = await fetch(`${getBaseUrl()}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, token }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Verification failed');

  const session: AuthSession = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    user: data.user,
    expires_at: data.expires_at,
  };
  saveSession(session);
  return session;
}

export function logout() {
  clearSession();
}

export function onAuthChange(callback: (session: AuthSession | null) => void): () => void {
  listeners.add(callback);
  return () => { listeners.delete(callback); };
}
