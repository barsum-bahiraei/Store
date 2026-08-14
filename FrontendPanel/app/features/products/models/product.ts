export interface ProductAttributeInput {
  attributeId: number;
  value: string;
}

export interface ProductCreateInput {
  title: string;
  description: string;
  price: number;
  discount: number;
  categoryId: number;
  attributes: ProductAttributeInput[];
}

export interface ProductCreateOutput extends ProductCreateInput {
  id: number;
}

export interface ProductUpdateInput extends ProductCreateInput {}

export interface ProductUpdateOutput extends ProductUpdateInput {
  id: number;
}

export interface ProductListOutput {
  id: number;
  title: string;
  description: string;
  price: number;
  discount: number;
  categoryId: number;
  categoryTitle: string;
  image: ProductImage | string | null;
}

export interface ProductImage {
  id: number;
  title: string;
  url: string;
  isMain: boolean;
  fileType: number;
}

export interface ProductGetOutput extends Omit<ProductListOutput, "image"> {
  attributes: ProductAttributeInput[];
  images: ProductImage[];
}

export interface ProductImageUploadInput {
  file: File;
  title: string;
  productId: number;
  isMain: boolean;
  fileType: 0 | 3;
}

export interface ProductImageOutput {
  id: number;
  title: string;
  url: string;
  tableName: 0;
  targetId: number;
  targetName: 0;
  isMain: boolean;
  fileType: 0 | 3;
}
