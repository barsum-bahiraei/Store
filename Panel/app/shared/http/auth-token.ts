export const AUTH_TOKEN_KEY = "store.auth.token";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const AUTH_TOKEN_CLEARED_EVENT = "store:auth-token-cleared";
const SHARED_COOKIE_ATTRIBUTES = import.meta.env.PROD
  ? "; domain=zaryvan.com; secure"
  : "";

function readTokenCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${AUTH_TOKEN_KEY}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function getAuthTokenExpiresAt(token: string): number | null {
  const payloadPart = token.split(".")[1];
  if (!payloadPart) return null;

  try {
    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const payload = JSON.parse(window.atob(padded)) as { exp?: unknown };
    return typeof payload.exp === "number" && Number.isFinite(payload.exp)
      ? payload.exp * 1000
      : null;
  } catch {
    return null;
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = readTokenCookie();
  const expiresAt = token ? getAuthTokenExpiresAt(token) : null;
  if (token && expiresAt !== null && expiresAt <= Date.now()) {
    clearAuthToken();
    return null;
  }
  return token;
}

export function clearAuthTokenIfExpired(): void {
  if (typeof window === "undefined") return;
  const token = readTokenCookie();
  if (!token) return;
  const expiresAt = getAuthTokenExpiresAt(token);
  if (expiresAt !== null && expiresAt <= Date.now()) clearAuthToken();
}

export function setAuthToken(token: string, expiresAt?: string): void {
  if (typeof window === "undefined") return;
  const provided = expiresAt ? new Date(expiresAt).getTime() : Number.NaN;
  const expiresAtMs = Number.isFinite(provided) ? provided : getAuthTokenExpiresAt(token);
  const maxAge = expiresAtMs === null
    ? COOKIE_MAX_AGE_SECONDS
    : Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000));
  const expires = expiresAtMs === null ? "" : `; expires=${new Date(expiresAtMs).toUTCString()}`;
  document.cookie = `${AUTH_TOKEN_KEY}=; path=/; max-age=0; samesite=lax`;
  document.cookie = `${AUTH_TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}${expires}; samesite=lax${SHARED_COOKIE_ATTRIBUTES}`;
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem("store.panel.auth.token");
  document.cookie = `${AUTH_TOKEN_KEY}=; path=/; max-age=0; samesite=lax`;
  document.cookie = `${AUTH_TOKEN_KEY}=; path=/; max-age=0; samesite=lax${SHARED_COOKIE_ATTRIBUTES}`;
  window.dispatchEvent(new Event(AUTH_TOKEN_CLEARED_EVENT));
}

export function onAuthTokenCleared(listener: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(AUTH_TOKEN_CLEARED_EVENT, listener);
  return () => window.removeEventListener(AUTH_TOKEN_CLEARED_EVENT, listener);
}
