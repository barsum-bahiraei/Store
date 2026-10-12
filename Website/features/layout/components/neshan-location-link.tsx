"use client";

import { useSyncExternalStore } from "react";
import { getNeshanLocationUrl, neshanWebUrl } from "../utils/store-location";

const subscribe = () => () => {};
const getSnapshot = () => getNeshanLocationUrl(navigator.userAgent);
const getServerSnapshot = () => neshanWebUrl;

export function NeshanLocationLink() {
  const href = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return (
    <a href={href} target={href === neshanWebUrl ? "_blank" : undefined} rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground shadow-lg shadow-primary-shadow transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
      <span className="material-symbols-rounded" aria-hidden="true">map</span>
      باز کردن در نشان
    </a>
  );
}
