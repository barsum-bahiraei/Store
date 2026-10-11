export const AUTH_TOKEN_KEY = "store.auth.token";
export const AUTH_TOKEN_EVENT = "store-auth-token-change";

const FALLBACK_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

type JwtPayload = {
  exp?: unknown;
};

function removeLegacyStoredToken() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    // Storage can be unavailable in private browsing or restricted contexts.
  }
}

export function getAuthTokenExpiresAt(token: string): number | null {
  const payloadPart = token.split(".")[1];
  if (!payloadPart) return null;

  try {
    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = window.atob(padded);
    const bytes = Uint8Array.from(decoded, (character) => character.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes)) as JwtPayload;
    if (typeof payload.exp !== "number" || !Number.isFinite(payload.exp)) return null;
    return payload.exp * 1000;
  } catch {
    return null;
  }
}

function readTokenCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${AUTH_TOKEN_KEY}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeTokenCookie(token: string | null) {
  if (typeof document === "undefined") return;
  if (!token) {
    document.cookie = `${AUTH_TOKEN_KEY}=; path=/; max-age=0; samesite=lax`;
    return;
  }

  const expiresAt = getAuthTokenExpiresAt(token);
  const maxAge = expiresAt === null
    ? FALLBACK_COOKIE_MAX_AGE_SECONDS
    : Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  const expires = expiresAt === null ? "" : `; expires=${new Date(expiresAt).toUTCString()}`;
  document.cookie = `${AUTH_TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}${expires}; samesite=lax`;
}

export function getAuthToken() {
  if (typeof window === "undefined") return null;
  removeLegacyStoredToken();
  const token = readTokenCookie();
  if (!token) return null;

  const expiresAt = getAuthTokenExpiresAt(token);
  if (expiresAt !== null && expiresAt <= Date.now()) {
    writeTokenCookie(null);
    return null;
  }

  return token;
}

export function setAuthToken(token: string) {
  removeLegacyStoredToken();
  writeTokenCookie(token);
  window.dispatchEvent(new Event(AUTH_TOKEN_EVENT));
}

export function clearAuthToken() {
  removeLegacyStoredToken();
  writeTokenCookie(null);
  window.dispatchEvent(new Event(AUTH_TOKEN_EVENT));
}
