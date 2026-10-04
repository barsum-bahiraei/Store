import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar } from "react-multi-date-picker";
import TimePickerModule from "react-multi-date-picker/plugins/time_picker";
import DateObject from "react-date-object";
import gregorian from "react-date-object/calendars/gregorian";
import gregorianEn from "react-date-object/locales/gregorian_en";
import persian from "react-date-object/calendars/persian";
import persianFa from "react-date-object/locales/persian_fa";
import { unwrapDefault } from "~/shared/utils/unwrap-default";

const TimePicker = unwrapDefault(TimePickerModule);

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

const formats: Record<PersianDateTimeMode, string> = {
  date: "YYYY/MM/DD",
  datetime: "YYYY/MM/DD HH:mm",
  time: "HH:mm",
};

const placeholders: Record<PersianDateTimeMode, string> = {
  date: "انتخاب تاریخ",
  datetime: "انتخاب تاریخ و ساعت",
  time: "انتخاب ساعت",
};

function parseValue(value: string, mode: PersianDateTimeMode): DateObject | null {
  if (!value) return null;

  if (mode === "time") {
    const [hour, minute] = value.split(":");
    const parsedHour = Number(hour);
    const parsedMinute = Number(minute);
    if (!Number.isFinite(parsedHour) || !Number.isFinite(parsedMinute)) return null;
    return new DateObject({
      calendar: gregorian,
      locale: gregorianEn,
      year: 2000,
      month: 1,
      day: 1,
      hour: parsedHour,
      minute: parsedMinute,
    });
  }

  const [datePart, timePart] = value.trim().split(/[T ]/);
  const [year, month, day] = datePart.split("-").map(Number);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;

  const [hour, minute] = (timePart ?? "00:00").split(":");
  return new DateObject({
    calendar: gregorian,
    locale: gregorianEn,
    year,
    month,
    day,
    hour: Number(hour) || 0,
    minute: Number(minute) || 0,
  });
}

function formatValue(date: DateObject, mode: PersianDateTimeMode): string {
  const gregorianDate = new DateObject(date).convert(gregorian, gregorianEn);
  if (mode === "time") return gregorianDate.format("HH:mm");

  const day = gregorianDate.format("YYYY-MM-DD");
  return mode === "date" ? day : `${day}T${gregorianDate.format("HH:mm")}`;
}

function formatDisplay(date: DateObject | null, mode: PersianDateTimeMode): string | null {
  return date
    ? new DateObject(date).convert(persian, persianFa).format(formats[mode])
    : null;
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
  const [draftDate, setDraftDate] = useState<DateObject | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const selectedDate = parseValue(value, mode);
  const display = formatDisplay(selectedDate, mode);
  const placeholderText = placeholder ?? placeholders[mode];
  const showClear = Boolean(clearable && value);

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
    const initialDate = selectedDate ?? new DateObject();
    setDraftDate(new DateObject(initialDate).convert(persian, persianFa));
    setOpen(true);
  };

  const handleConfirm = () => {
    if (!draftDate) return;
    onChange(formatValue(draftDate, mode));
    setOpen(false);
  };

  const handleToday = () => {
    const today = new DateObject().convert(persian, persianFa);
    setDraftDate(today);
  };

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
            <div className="rmdp-container flex justify-center">
              <Calendar
                className="rmdp-rtl"
                calendar={persian}
                locale={persianFa}
                format={formats[mode]}
                value={draftDate}
                disableDayPicker={mode === "time"}
                plugins={mode === "date" ? undefined : [<TimePicker key="time" hideSeconds />]}
                onChange={setDraftDate}
              />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleConfirm}
                className="min-h-11 rounded-xl bg-primary-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                تأیید
              </button>
              <button
                type="button"
                onClick={handleToday}
                className="min-h-11 rounded-xl border border-primary-200 bg-primary-50 px-3 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-primary-800 dark:bg-primary-950 dark:text-primary-300 dark:hover:bg-primary-900"
              >
                امروز
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-11 rounded-xl border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                لغو
              </button>
            </div>
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
          className={`${className ?? ""} flex items-center gap-2 text-start ${display ? "" : "text-gray-500! dark:text-gray-400!"} ${showClear ? "pe-10!" : ""}`}
        >
          <span className="material-symbols-outlined shrink-0 text-xl text-gray-400 dark:text-gray-500">
            {mode === "date" ? "calendar_today" : mode === "datetime" ? "event" : "schedule"}
          </span>
          <span className="min-w-0 flex-1 truncate">{display ?? placeholderText}</span>
        </button>
        {showClear && (
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
