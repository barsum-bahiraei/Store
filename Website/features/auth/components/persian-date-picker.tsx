"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar } from "react-multi-date-picker";
import DateObject from "react-date-object";
import gregorian from "react-date-object/calendars/gregorian";
import gregorianEn from "react-date-object/locales/gregorian_en";
import persian from "react-date-object/calendars/persian";
import persianFa from "react-date-object/locales/persian_fa";
import { formatPersianProfileDate, parseProfileDate } from "../utils/profile-date";

type PersianDatePickerProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
};

export function PersianDatePicker({ id, value, onChange, disabled, className }: PersianDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [draftDate, setDraftDate] = useState<DateObject | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const display = formatPersianProfileDate(value);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    dialog?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function openPicker() {
    setDraftDate((parseProfileDate(value) ?? new DateObject()).convert(persian, persianFa));
    setOpen(true);
  }

  function confirmDate() {
    if (!draftDate?.isValid || disabled) return;
    onChange(new DateObject(draftDate).convert(gregorian, gregorianEn).format("YYYY-MM-DD"));
    setOpen(false);
  }

  return (
    <>
      <div className="relative">
        <button id={id} type="button" disabled={disabled} onClick={openPicker} aria-haspopup="dialog" aria-expanded={open} aria-controls={`${id}-dialog`} className={`${className ?? ""} flex items-center gap-2 text-start ${value ? "pe-12" : "text-muted-foreground"}`}>
          <span className="material-symbols-rounded shrink-0 text-xl text-primary" aria-hidden="true">calendar_today</span>
          <span className="min-w-0 flex-1 truncate">{display ?? "انتخاب تاریخ"}</span>
        </button>
        {value && <button type="button" disabled={disabled} onClick={() => onChange("")} aria-label="پاک کردن تاریخ تولد" className="absolute end-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"><span className="material-symbols-rounded text-lg" aria-hidden="true">close</span></button>}
      </div>
      <dialog ref={dialogRef} id={`${id}-dialog`} aria-labelledby={`${id}-title`} onClose={() => setOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }} className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-sm overflow-y-auto rounded-2xl border border-border bg-surface p-4 text-foreground shadow-2xl shadow-primary-shadow backdrop:bg-foreground/60 backdrop:backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id={`${id}-title`} className="text-lg font-black">انتخاب تاریخ تولد</h2>
          <button type="button" onClick={() => setOpen(false)} aria-label="بستن انتخاب تاریخ" className="grid size-9 place-items-center rounded-lg text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"><span className="material-symbols-rounded" aria-hidden="true">close</span></button>
        </div>
        <div dir="rtl" className="flex justify-center [&_.rmdp-wrapper]:!bg-surface [&_.rmdp-wrapper]:!font-sans [&_.rmdp-calendar_:focus]:outline-ring [&_.rmdp-header-values]:!text-foreground [&_.rmdp-day]:!text-foreground [&_.rmdp-week-day]:!text-primary [&_.rmdp-arrow]:!border-primary [&_.rmdp-arrow-container:hover]:!bg-primary [&_.rmdp-arrow-container:hover_.rmdp-arrow]:!border-primary-foreground [&_.rmdp-month-picker]:!bg-surface [&_.rmdp-year-picker]:!bg-surface [&_.rmdp-day.rmdp-deactive]:!text-muted-foreground [&_.rmdp-day.rmdp-today_span]:!bg-muted [&_.rmdp-day.rmdp-today_span]:!text-primary [&_.rmdp-day:not(.rmdp-disabled,.rmdp-day-hidden)_span:hover]:!bg-primary-hover [&_.rmdp-day:not(.rmdp-disabled,.rmdp-day-hidden)_span:hover]:!text-primary-foreground [&_.rmdp-day.rmdp-selected_span:not(.highlight)]:!bg-primary [&_.rmdp-day.rmdp-selected_span:not(.highlight)]:!text-primary-foreground [&_.rmdp-day.rmdp-selected_span:not(.highlight)]:!shadow-none">
          {open && <Calendar className="rmdp-rtl" calendar={persian} locale={persianFa} format="YYYY/MM/DD" value={draftDate} onChange={setDraftDate} shadow={false} />}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button type="button" onClick={confirmDate} disabled={!draftDate?.isValid || disabled} className="min-h-11 rounded-xl bg-primary px-3 text-sm font-bold text-primary-foreground outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60">تأیید</button>
          <button type="button" onClick={() => setDraftDate(new DateObject().convert(persian, persianFa))} className="min-h-11 rounded-xl border border-border bg-muted px-3 text-sm font-bold text-primary outline-none hover:bg-accent/30 focus-visible:ring-2 focus-visible:ring-ring">امروز</button>
          <button type="button" onClick={() => setOpen(false)} className="min-h-11 rounded-xl border border-border bg-surface px-3 text-sm font-bold outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">لغو</button>
        </div>
      </dialog>
    </>
  );
}
