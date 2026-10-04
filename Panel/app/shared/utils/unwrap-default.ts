export function unwrapDefault<T>(module: T): T {
  const wrapped = module as T & { default?: T };
  return typeof module === "object" && module !== null && wrapped.default
    ? wrapped.default
    : module;
}
