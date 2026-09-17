const htmlEntityMap: Record<string, string> = {
  "&lt;": "<",
  "&gt;": ">",
  "&amp;": "&",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

const htmlEntityPattern = /&lt;|&gt;|&amp;|&quot;|&#39;|&nbsp;/g;

export function unescapeHtmlEntities(value: string | null): string | null {
  if (!value || !htmlEntityPattern.test(value)) return value;
  return value.replace(htmlEntityPattern, (entity) => htmlEntityMap[entity] ?? entity);
}
