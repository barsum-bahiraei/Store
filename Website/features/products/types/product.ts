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
  shortDescription: string | null;
  price: number;
  discount: number;
  averageRating: number;
  categoryId: number;
  categoryTitle: string;
  image: ProductImage | null;
  isAvailable: boolean;
};

export type ProductSearchInput = {
  page: number;
  pageSize: number;
  name?: string;
  categoryId?: number;
  productBrandId?: number;
  hasDiscount: boolean;
  isAvailable?: boolean;
  minPrice?: number;
  maxPrice?: number;
  isPriceDec?: boolean;
  isIdDec?: boolean;
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

export type ProductBrand = {
  id: number;
  name: string;
  image: Omit<ProductImage, "isMain"> | null;
};

export type ProductBrandListItem = {
  id: number;
  name: string;
  image: ProductImage | null;
};

export type ProductVariant = {
  id: number;
  colorName: string;
  colorCode: string;
};

export enum ProductAttributeType {
  String,
  Int,
  Bool,
  LongText,
  Date,
  DateTime,
  Time,
  Select,
  MultiSelect,
  Url,
  Email,
  Phone,
}

export enum ProductAttributeUnit {
  Geram,
  Kilo,
  Meter,
  None,
  Milligram,
  Millimeter,
  Centimeter,
  Milliliter,
  Liter,
  Piece,
  Pair,
  Pack,
  Box,
  Set,
}

export type ProductDetail = Omit<ProductSearchItem, "averageRating" | "image"> & {
  longDescription: string | null;
  categories: ProductCategory[];
  brand: ProductBrand | null;
  seller: { id: number; name: string };
  images: ProductImage[];
  variants: ProductVariant[];
  attributes: Array<{
    id: number;
    attributeId: number;
    attributeTitle: string | null;
    value: string;
    attributeUnit: ProductAttributeUnit;
    attributeType: ProductAttributeType;
  }>;
  comments: ProductComment[];
  similarProducts: ProductSearchItem[];
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
