import { useEffect, useState } from "react";

interface TooltipState {
  text: string;
  top: number;
  left: number;
  placeAbove: boolean;
}

const GAP = 8;
const MARGIN = 8;
const MAX_WIDTH = 320;

function isOverflowing(element: HTMLElement): boolean {
  return element.scrollWidth > element.clientWidth + 1;
}

export function TruncateTooltipLayer() {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  useEffect(() => {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let active: HTMLElement | null = null;

    const hide = () => {
      active = null;
      setTooltip(null);
    };

    const show = (element: HTMLElement) => {
      const text = element.textContent?.trim();
      if (!text) {
        hide();
        return;
      }

      const rect = element.getBoundingClientRect();
      const half = Math.min(MAX_WIDTH, window.innerWidth - MARGIN * 2) / 2;
      const center = rect.left + rect.width / 2;
      const left = Math.min(Math.max(center, MARGIN + half), window.innerWidth - MARGIN - half);
      const placeAbove = rect.bottom + GAP + 64 > window.innerHeight && rect.top > 64;

      active = element;
      setTooltip({
        text,
        left,
        top: placeAbove ? rect.top - GAP : rect.bottom + GAP,
        placeAbove,
      });
    };

    const resolve = (target: EventTarget | null): HTMLElement | null => {
      if (!(target instanceof Element)) return null;
      const element = target.closest<HTMLElement>(".truncate");
      if (!element || !isOverflowing(element)) return null;
      return element;
    };

    const handleOver = (event: MouseEvent) => {
      if (!canHover) return;
      const element = resolve(event.target);
      if (element && element !== active) show(element);
    };

    const handleOut = (event: MouseEvent) => {
      if (!canHover) return;
      const element = resolve(event.target);
      if (!element || element !== active) return;
      if (!(event.relatedTarget instanceof Node) || !element.contains(event.relatedTarget)) hide();
    };

    const handleClick = (event: MouseEvent) => {
      const element = resolve(event.target);
      if (!element) {
        hide();
        return;
      }
      if (element === active) hide();
      else show(element);
    };

    const handleScroll = () => hide();

    document.addEventListener("mouseover", handleOver);
    document.addEventListener("mouseout", handleOut);
    if (!canHover) document.addEventListener("click", handleClick);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", hide);

    return () => {
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseout", handleOut);
      document.removeEventListener("click", handleClick);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", hide);
    };
  }, []);

  if (!tooltip) return null;

  return (
    <div
      role="tooltip"
      dir="auto"
      className="pointer-events-none fixed z-[70] w-max max-w-[min(20rem,calc(100vw-1rem))] rounded-xl border border-gray-200/90 bg-white/95 px-3 py-2 text-center text-xs font-medium leading-5 text-gray-700 shadow-xl ring-1 ring-black/5 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/95 dark:text-gray-100 dark:ring-white/10"
      style={{
        top: tooltip.top,
        left: tooltip.left,
        transform: tooltip.placeAbove ? "translate(-50%, -100%)" : "translate(-50%, 0)",
      }}
    >
      <span className="block break-words">{tooltip.text}</span>
      <span
        className={`absolute left-1/2 size-2.5 -translate-x-1/2 rotate-45 border-gray-200/90 bg-white dark:border-gray-700 dark:bg-gray-800 ${
          tooltip.placeAbove
            ? "-bottom-[5px] border-b border-r"
            : "-top-[5px] border-l border-t"
        }`}
        aria-hidden="true"
      />
    </div>
  );
}
