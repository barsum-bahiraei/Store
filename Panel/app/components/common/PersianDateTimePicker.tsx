import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import moment from "moment-jalali";
import type { JalaliMoment } from "moment-jalali";
import { persianNumber } from "react-persian-datepicker/lib/utils/persian";
import { PersianCalendar } from "./PersianCalendar";

export type PersianDateTimeMode = "date" | "datetime" | "time";

interface PersianDateTimePickerProps {
  mode?: PersianDateTimeMode;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  ariaLabel?: string;
  placeholder?: string;
  clearable?: boolean;
}

const hourOptions = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
const minuteOptions = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0"));

const selectClasses =
  "min-h-11 flex-1 rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white";

function formatDisplay(value: string, mode: PersianDateTimeMode): string | null {
  if (!value) return null;
  if (mode === "date") {
    const parsed = moment(value, "YYYY-MM-DD");
    return parsed.isValid() ? persianNumber(parsed.format("jYYYY/jMM/jDD")) : null;
  }
  if (mode === "time") {
    const parsed = moment(value, "HH:mm");
    return parsed.isValid() ? persianNumber(parsed.format("HH:mm")) : null;
  }
  const parsed = moment(value);
  return parsed.isValid() ? persianNumber(parsed.format("jYYYY/jMM/jDD HH:mm")) : null;
}

function splitValue(value: string): { date: string; time: string } {
  const parsed = value ? moment(value) : null;
  if (!parsed || !parsed.isValid()) {
    const now = moment();
    return { date: now.format("YYYY-MM-DD"), time: now.format("HH:mm") };
  }
  return { date: parsed.format("YYYY-MM-DD"), time: parsed.format("HH:mm") };
}

export function PersianDateTimePicker({
  mode = "date",
  value,
  onChange,
  className,
  ariaLabel,
  placeholder,
  clearable = true,
}: PersianDateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [draftDate, setDraftDate] = useState("");
  const [draftTime, setDraftTime] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  const display = useMemo(() => formatDisplay(value, mode), [value, mode]);
  const placeholderText =
    placeholder ?? (mode === "date" ? "انتخاب تاریخ" : mode === "datetime" ? "انتخاب تاریخ و ساعت" : "انتخاب ساعت");
  const selectedDay = useMemo<JalaliMoment | undefined>(
    () => (mode !== "time" && draftDate ? moment(draftDate) : undefined),
    [mode, draftDate],
  );

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const openPicker = () => {
    const parts = mode === "time" ? splitTime(value) : splitValue(value);
    setDraftDate(parts.date);
    setDraftTime(parts.time);
    setOpen(true);
  };

  const handleDaySelect = (day: JalaliMoment) => {
    if (mode === "date") {
      onChange(day.format("YYYY-MM-DD"));
      setOpen(false);
      return;
    }
    setDraftDate(day.format("YYYY-MM-DD"));
  };

  const handleConfirm = () => {
    onChange(mode === "time" ? draftTime : `${draftDate}T${draftTime}`);
    setOpen(false);
  };

  const timeRow =
    mode !== "date" ? (
      <div className={`flex items-center justify-center gap-2 ${mode === "datetime" ? "mt-4" : ""}`}>
        <select
          aria-label="ساعت"
          value={draftTime.slice(0, 2)}
          onChange={(event) => setDraftTime(`${event.target.value}:${draftTime.slice(3, 5)}`)}
          className={selectClasses}
        >
          {hourOptions.map((hour) => (
            <option key={hour} value={hour}>
              {persianNumber(hour)}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-400 dark:text-gray-500">:</span>
        <select
          aria-label="دقیقه"
          value={draftTime.slice(3, 5)}
          onChange={(event) => setDraftTime(`${draftTime.slice(0, 2)}:${event.target.value}`)}
          className={selectClasses}
        >
          {minuteOptions.map((minute) => (
            <option key={minute} value={minute}>
              {persianNumber(minute)}
            </option>
          ))}
        </select>
      </div>
    ) : null;

  const dialog = open
    ? createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 p-4 backdrop-blur-sm"
          onMouseDown={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel ?? placeholderText}
        >
          <div
            ref={dialogRef}
            tabIndex={-1}
            onMouseDown={(event) => event.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl outline-none dark:border-gray-800 dark:bg-gray-900"
          >
            {mode !== "time" && <PersianCalendar selectedDay={selectedDay} onSelect={handleDaySelect} />}
            {timeRow}
            {mode !== "date" && (
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="min-h-11 flex-1 rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  تایید
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="min-h-11 flex-1 rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  لغو
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={openPicker}
          aria-label={ariaLabel ?? placeholderText}
          aria-haspopup="dialog"
          className={`${className ?? ""} flex items-center gap-2 text-start ${display ? "" : "text-gray-500! dark:text-gray-400!"} ${clearable && value ? "pe-10!" : ""}`}
        >
          <span className="material-symbols-outlined shrink-0 text-xl text-gray-400 dark:text-gray-500">
            {mode === "date" ? "calendar_today" : mode === "datetime" ? "event" : "schedule"}
          </span>
          <span className="min-w-0 flex-1 truncate">{display ?? placeholderText}</span>
        </button>
        {clearable && value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="پاک کردن"
            className="absolute top-1/2 left-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        )}
      </div>
      {dialog}
    </>
  );
}

function splitTime(value: string): { date: string; time: string } {
  const parsed = value ? moment(value, "HH:mm") : null;
  if (!parsed || !parsed.isValid()) {
    return { date: "", time: moment().format("HH:mm") };
  }
  return { date: "", time: parsed.format("HH:mm") };
}
