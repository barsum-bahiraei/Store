"use client";

import { useRef, useState } from "react";
import { normalizePriceDigits, priceToWords } from "../utils/price-input";
import { priceFormatter } from "../utils/product";

type PriceFilterInputProps = {
  id: string;
  name: "minPrice" | "maxPrice";
  label: string;
  defaultValue?: number;
};

export function PriceFilterInput({ id, name, label, defaultValue }: PriceFilterInputProps) {
  const [value, setValue] = useState(defaultValue === undefined ? "" : String(defaultValue));
  const inputRef = useRef<HTMLInputElement>(null);
  const formattedValue = value === "" ? "" : priceFormatter.format(Number(value));

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="text-sm font-bold">{label} (تومان)</label>
      <input type="hidden" name={name} value={value} />
      <input ref={inputRef} id={id} type="text" inputMode="numeric" dir="ltr" value={formattedValue} aria-describedby={`${id}-words`} onKeyDown={(event) => {
        const input = event.currentTarget;
        const caret = input.selectionStart;
        if (caret === null || caret !== input.selectionEnd || event.ctrlKey || event.metaKey || event.altKey) return;
        if (event.key === "Backspace" && input.value[caret - 1] === "٬") input.setSelectionRange(caret - 1, caret - 1);
        if (event.key === "Delete" && input.value[caret] === "٬") input.setSelectionRange(caret + 1, caret + 1);
      }} onChange={(event) => {
        const input = event.target;
        const digits = normalizePriceDigits(input.value);
        if (digits && !Number.isSafeInteger(Number(digits))) return;
        const nextValue = digits ? String(Number(digits)) : "";
        const caret = input.selectionStart ?? input.value.length;
        const digitsBeforeCaret = normalizePriceDigits(input.value.slice(0, caret)).length;
        const removedZeros = digits.length - nextValue.length;
        const targetDigits = Math.max(0, digitsBeforeCaret - removedZeros);
        setValue(nextValue);
        requestAnimationFrame(() => {
          const element = inputRef.current;
          if (!element || document.activeElement !== element) return;
          let position = 0;
          let count = 0;
          while (position < element.value.length && count < targetDigits) {
            if (normalizePriceDigits(element.value[position])) count += 1;
            position += 1;
          }
          element.setSelectionRange(position, position);
        });
      }} className="mt-2 h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
      <p id={`${id}-words`} className="mt-2 min-h-5 text-xs leading-5 text-muted-foreground">{value === "" ? "" : priceToWords(Number(value))}</p>
    </div>
  );
}
