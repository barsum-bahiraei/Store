function parseDateTime(value: string | null | undefined): Date | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function localDateTimeToUtcIso(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(trimmed);
  if (!match) return null;

  const date = new Date(trimmed);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== Number(match[1]) ||
    date.getMonth() !== Number(match[2]) - 1 ||
    date.getDate() !== Number(match[3]) ||
    date.getHours() !== Number(match[4]) ||
    date.getMinutes() !== Number(match[5])
  ) {
    return null;
  }

  return date.toISOString();
}

export function dateTimeToUtcIso(value: string | null | undefined): string | null {
  return parseDateTime(value)?.toISOString() ?? null;
}

export function utcDateTimeToLocalInput(value: string | null | undefined): string {
  const date = parseDateTime(value);
  if (!date) return "";

  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  ].join("T");
}

export function localDateBoundaryToUtcIso(value: string, endOfDay = false): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(
    year,
    month - 1,
    day,
    endOfDay ? 23 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 999 : 0,
  );

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date.toISOString();
}

export function formatLocalDateTime(
  value: string | null | undefined,
  locale = "fa-IR",
): string {
  const date = parseDateTime(value);
  return date ? date.toLocaleString(locale) : "—";
}

export function formatLocalDate(
  value: string | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = parseDateTime(value);
  return date ? date.toLocaleDateString("fa-IR", options) : "—";
}

export function secondsUntil(value: string | null | undefined): number {
  const date = parseDateTime(value);
  return date ? Math.max(0, Math.ceil((date.getTime() - Date.now()) / 1000)) : 0;
}
