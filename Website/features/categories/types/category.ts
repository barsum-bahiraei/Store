export type Category = {
  id: number;
  name: string;
  parentId: number | null;
  children: Category[];
};

export type BestSellingCategory = {
  id: number;
  name: string | null;
  parentId: number | null;
};
