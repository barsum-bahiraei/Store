export interface CategoryListOutput {
  id: number;
  title: string;
  parentId: number | null;
  children: CategoryListOutput[] | null;
}
