export const AUTH_TOKEN_KEY = "store.auth.token";
export const AUTH_TOKEN_EVENT = "store-auth-token-change";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function readTokenCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${AUTH_TOKEN_KEY}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeTokenCookie(token: string | null) {
  if (typeof document === "undefined") return;
  document.cookie = token
    ? `${AUTH_TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax`
    : `${AUTH_TOKEN_KEY}=; path=/; max-age=0; samesite=lax`;
}

export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY) ?? readTokenCookie();
}

export function setAuthToken(token: string) {
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  writeTokenCookie(token);
  window.dispatchEvent(new Event(AUTH_TOKEN_EVENT));
}

export function clearAuthToken() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  writeTokenCookie(null);
  window.dispatchEvent(new Event(AUTH_TOKEN_EVENT));
}
