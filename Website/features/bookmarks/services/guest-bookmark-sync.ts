import { getAuthToken } from "@/lib/auth-token";
import { useGuestBookmarkStore } from "../stores/guest-bookmark-store";
import type { BookmarkItem } from "../types/bookmark";
import { addBookmark, getBookmarks } from "./bookmark-service";

const transfers = new Map<string, Promise<BookmarkItem[]>>();

export function loadBookmarksWithGuestItems(token: string, signal?: AbortSignal): Promise<BookmarkItem[]> {
  const pending = transfers.get(token);
  if (pending) return pending;
  if (useGuestBookmarkStore.getState().items.length === 0) return getBookmarks(signal);

  function checkSession() {
    if (getAuthToken() !== token) throw new Error("نشست شما تغییر کرده است. لطفاً علاقه‌مندی‌ها را دوباره بارگذاری کنید.");
  }

  async function transfer() {
    checkSession();
    let bookmarks = await getBookmarks();
    const existingIds = new Set(bookmarks.map((item) => item.productId));
    for (const guest of useGuestBookmarkStore.getState().items) {
      checkSession();
      if (!existingIds.has(guest.productId)) {
        try {
          await addBookmark(guest.productId);
        } catch (error) {
          checkSession();
          // Another tab may have added it, or the successful response may have been lost.
          bookmarks = await getBookmarks();
          if (!bookmarks.some((item) => item.productId === guest.productId)) throw error;
        }
        existingIds.add(guest.productId);
      }
      checkSession();
      useGuestBookmarkStore.getState().completeTransfer(guest.productId, guest.addedAt);
    }
    checkSession();
    return getBookmarks();
  }

  const promise = (async () => {
    if (typeof navigator !== "undefined" && navigator.locks) {
      return navigator.locks.request("store-guest-bookmark-transfer", async () => {
        await useGuestBookmarkStore.persist.rehydrate();
        return transfer();
      });
    }
    return transfer();
  })().finally(() => transfers.delete(token));
  transfers.set(token, promise);
  return promise;
}
