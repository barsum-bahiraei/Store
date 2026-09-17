export type BookmarkProductImage = {
  id: number;
  name: string;
  url: string;
  isMain: boolean;
  fileType: number;
};

export type BookmarkProduct = {
  id: number;
  name: string;
  shortDescription: string | null;
  price: number;
  discount: number;
  categoryId: number;
  categoryTitle: string;
  image: BookmarkProductImage | null;
};

export type BookmarkItem = {
  id: number;
  productId: number;
  userId: number;
  createdAt: string;
  product: BookmarkProduct;
};
