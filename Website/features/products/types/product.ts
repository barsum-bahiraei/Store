export type ProductImage = {
  id: number;
  name: string;
  url: string;
  isMain: boolean;
  fileType: number;
};

export type ProductSearchItem = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  discount: number;
  averageRating: number;
  categoryId: number;
  categoryTitle: string;
  image: ProductImage | null;
};

export type ProductSearchInput = {
  page: number;
  pageSize: number;
  name?: string;
  categoryId?: number;
  hasDiscount: boolean;
  minPrice?: number;
  maxPrice?: number;
};

export type ProductSearchResult = {
  totalCount: number;
  items: ProductSearchItem[];
};

export type ProductCategory = {
  id: number;
  name: string;
  parentId: number | null;
};

export type ProductDetail = Omit<ProductSearchItem, "averageRating" | "image"> & {
  categories: ProductCategory[];
  seller: { id: number; name: string };
  images: ProductImage[];
  attributes: Array<{
    id: number;
    attributeId: number;
    attributeTitle: string | null;
    value: string;
    attributeUnit: number;
    attributeType: number;
  }>;
  comments: ProductComment[];
};

export type ProductComment = {
  id: number;
  text: string;
  rating: number | null;
  createdAt: string;
  user: { id: number; firstName: string; lastName: string };
};

export type CreateProductCommentInput = {
  text: string;
  rating: number;
};

export type CreatedProductComment = {
  id: number;
  text: string;
  rating: number | null;
  isShow: boolean | null;
  userId: number;
  productId: number;
  createdAt: string;
};
