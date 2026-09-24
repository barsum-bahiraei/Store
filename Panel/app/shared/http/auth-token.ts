export const AUTH_TOKEN_KEY = "store.auth.token";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function getCookieDomainSuffix(): string {
  if (typeof window === "undefined") return "";
  const host = window.location.hostname;
  if (!host || host === "localhost" || !host.includes(".")) return "";
  const labels = host.split(".");
  if (labels.length < 2) return "";
  return `; Domain=.${labels.slice(-2).join(".")}`;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return readCookie(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  document.cookie = `${AUTH_TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax${getCookieDomainSuffix()}`;
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  document.cookie = `${AUTH_TOKEN_KEY}=; path=/; max-age=0; samesite=lax${getCookieDomainSuffix()}`;
}
