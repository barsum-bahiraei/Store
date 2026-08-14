import type { CategoryListOutput } from "../models/output/category-list-output";

export interface FlatCategory {
  category: CategoryListOutput;
  depth: number;
  path: string;
}

export function flattenCategories(
  categories: CategoryListOutput[],
  depth = 0,
  parentPath = ""
): FlatCategory[] {
  return categories.flatMap((category) => {
    const path = parentPath ? `${parentPath} / ${category.title}` : category.title;
    return [
      { category, depth, path },
      ...flattenCategories(category.children ?? [], depth + 1, path),
    ];
  });
}

export function findCategory(
  categories: CategoryListOutput[],
  id: number
): CategoryListOutput | null {
  for (const category of categories) {
    if (category.id === id) return category;
    const child = findCategory(category.children ?? [], id);
    if (child) return child;
  }
  return null;
}

export function getDescendantIds(category: CategoryListOutput): Set<number> {
  const ids = new Set<number>();
  const visit = (children: CategoryListOutput[]) => {
    children.forEach((child) => {
      ids.add(child.id);
      visit(child.children ?? []);
    });
  };
  visit(category.children ?? []);
  return ids;
}
