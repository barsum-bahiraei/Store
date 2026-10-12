"use client";

import { useEffect } from "react";
import { useBookmarks } from "../hooks/use-bookmarks";
import { useGuestBookmarkStore } from "../stores/guest-bookmark-store";

export function BookmarkSession() {
  useBookmarks();

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === "store-guest-bookmarks" || event.key === null) {
        void useGuestBookmarkStore.persist.rehydrate();
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return null;
}
