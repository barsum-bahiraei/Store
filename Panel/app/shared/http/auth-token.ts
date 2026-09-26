export const AUTH_TOKEN_KEY = "store.auth.token";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const AUTH_TOKEN_CLEARED_EVENT = "store:auth-token-cleared";

function readTokenCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${AUTH_TOKEN_KEY}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return readTokenCookie();
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  document.cookie = `${AUTH_TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem("store.panel.auth.token");
  document.cookie = `${AUTH_TOKEN_KEY}=; path=/; max-age=0; samesite=lax`;
  window.dispatchEvent(new Event(AUTH_TOKEN_CLEARED_EVENT));
}

export function onAuthTokenCleared(listener: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(AUTH_TOKEN_CLEARED_EVENT, listener);
  return () => window.removeEventListener(AUTH_TOKEN_CLEARED_EVENT, listener);
}
