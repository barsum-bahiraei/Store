export interface CategoryListOutput {
  id: number;
  name: string;
  parentId: number | null;
  children: CategoryListOutput[] | null;
}
