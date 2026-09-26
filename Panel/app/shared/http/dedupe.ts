const pendingRequests = new Map<string, Promise<unknown>>();

export function dedupe<T>(key: string, request: () => Promise<T>): Promise<T> {
  const pending = pendingRequests.get(key) as Promise<T> | undefined;
  if (pending) return pending;

  const next = request().finally(() => {
    if (pendingRequests.get(key) === next) pendingRequests.delete(key);
  });
  pendingRequests.set(key, next);
  return next;
}
