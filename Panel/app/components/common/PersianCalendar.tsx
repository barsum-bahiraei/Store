import { useState } from "react";
import moment from "moment-jalali";
import type { JalaliMoment } from "moment-jalali";
import { getDaysOfMonth } from "react-persian-datepicker/lib/utils/moment-helper";
import { persianNumber } from "react-persian-datepicker/lib/utils/persian";

moment.loadPersian();

type CalendarMode = "days" | "monthSelector";

const monthNames = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const weekdayNames = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

const navButtonClasses =
  "flex size-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-400 dark:hover:bg-gray-800";

const titleClasses =
  "order-2 min-w-0 flex-1 truncate rounded-lg px-2 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white dark:hover:bg-gray-800";

const dayBaseClasses =
  "h-9 w-full rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500";

function dayClasses(isSelected: boolean, isCurrentMonth: boolean): string {
  if (isSelected) return `${dayBaseClasses} bg-primary-600 text-white hover:bg-primary-700`;
  if (isCurrentMonth)
    return `${dayBaseClasses} text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800`;
  return `${dayBaseClasses} text-gray-400 opacity-50 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-800`;
}

interface PersianCalendarProps {
  selectedDay?: JalaliMoment;
  onSelect: (day: JalaliMoment) => void;
}

export function PersianCalendar({ selectedDay, onSelect }: PersianCalendarProps) {
  const [month, setMonth] = useState<JalaliMoment>(() => selectedDay?.clone() ?? moment());
  const [mode, setMode] = useState<CalendarMode>("days");
  const [selectorYear, setSelectorYear] = useState<JalaliMoment>(() => selectedDay?.clone() ?? moment());

  const handleDayClick = (day: JalaliMoment) => {
    if (day.format("jYYYYjMM") !== month.format("jYYYYjMM")) {
      setMonth(day.clone());
    }
    onSelect(day);
  };

  const openMonthSelector = () => {
    setSelectorYear(month.clone());
    setMode("monthSelector");
  };

  const pickMonth = (index: number) => {
    const monthNumber = String(index + 1).padStart(2, "0");
    setMonth(moment(`${selectorYear.format("jYYYY")}/${monthNumber}/1`, "jYYYY/jMM/jDD"));
    setMode("days");
  };

  const isCurrentMonth = (index: number) =>
    month.format("jYYYYjMM") === `${selectorYear.format("jYYYY")}${String(index + 1).padStart(2, "0")}`;

  if (mode === "monthSelector") {
    return (
      <div>
        <div className="mb-3 flex items-center gap-2">
          <button type="button" onClick={() => setMode("days")} className={titleClasses}>
            {persianNumber(selectorYear.format("jYYYY"))}
          </button>
          <button
            type="button"
            title="سال قبل"
            aria-label="سال قبل"
            onClick={() => setSelectorYear((year) => year.clone().subtract(1, "year"))}
            className={`${navButtonClasses} order-1`}
          >
            <span className="material-symbols-outlined text-xl">chevron_right</span>
          </button>
          <button
            type="button"
            title="سال بعد"
            aria-label="سال بعد"
            onClick={() => setSelectorYear((year) => year.clone().add(1, "year"))}
            className={`${navButtonClasses} order-3`}
          >
            <span className="material-symbols-outlined text-xl">chevron_left</span>
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {monthNames.map((name, index) => (
            <button
              key={name}
              type="button"
              onClick={() => pickMonth(index)}
              className={`rounded-lg px-2 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                isCurrentMonth(index)
                  ? "bg-primary-600 text-white hover:bg-primary-700"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <button type="button" onClick={openMonthSelector} className={titleClasses}>
          {persianNumber(month.format("jMMMM jYYYY"))}
        </button>
        <button
          type="button"
          title="ماه قبل"
          aria-label="ماه قبل"
          onClick={() => setMonth((current) => current.clone().subtract(1, "jMonth"))}
          className={`${navButtonClasses} order-1`}
        >
          <span className="material-symbols-outlined text-xl">chevron_right</span>
        </button>
        <button
          type="button"
          title="ماه بعد"
          aria-label="ماه بعد"
          onClick={() => setMonth((current) => current.clone().add(1, "jMonth"))}
          className={`${navButtonClasses} order-3`}
        >
          <span className="material-symbols-outlined text-xl">chevron_left</span>
        </button>
      </div>
      <div className="mb-1 grid grid-cols-7 gap-1 border-b border-gray-100 pb-1.5 text-xs font-medium text-gray-400 dark:border-gray-800 dark:text-gray-500">
        {weekdayNames.map((name, index) => (
          <div key={index} className="text-center">
            {name}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {getDaysOfMonth(month).map((day) => (
          <button
            key={day.format("YYYYMMDD")}
            type="button"
            onClick={() => handleDayClick(day)}
            className={dayClasses(selectedDay?.isSame(day, "day") ?? false, day.format("jMM") === month.format("jMM"))}
          >
            {persianNumber(day.format("jD"))}
          </button>
        ))}
      </div>
    </div>
  );
}
