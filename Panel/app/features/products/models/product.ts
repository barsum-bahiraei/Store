import type { AttributeType } from "~/features/attributes/models/enums/attribute-type";
import type { AttributeUnit } from "~/features/attributes/models/enums/attribute-unit";
import type { Brand } from "~/features/brands/models/brand";

export interface ProductAttributeInput {
  attributeId: number;
  value: string;
}

export interface ProductAttributeDefinition {
  attributeId: number;
  attributeTitle: string | null;
  attributeUnit: AttributeUnit;
  attributeType: AttributeType;
}

export interface ProductAttributeOutput extends ProductAttributeInput {
  id: number;
}

export interface ProductAttributeGetOutput
  extends ProductAttributeOutput,
    ProductAttributeDefinition {}

export interface ProductVariantValueInput {
  size: string;
  name: string;
  code: string;
}

export interface ProductVariantValueOutput extends ProductVariantValueInput {
  id: number;
}

export interface ProductVariantInput {
  id?: number | null;
  price: number;
  stock: number;
  values: ProductVariantValueInput[];
}

export interface ProductVariantOutput {
  id: number;
  price: number;
  stock: number;
  values: ProductVariantValueOutput[];
}

export interface ProductCreateInput {
  name: string;
  shortDescription: string | null;
  longDescription: string | null;
  discount: number;
  categoryId: number;
  sellerId: number;
  productBrandId: number;
  attributes: ProductAttributeInput[];
  variants: ProductVariantInput[];
}

export interface ProductCreateOutput
  extends Omit<ProductCreateInput, "attributes" | "variants"> {
  id: number;
  attributes: ProductAttributeOutput[];
  variants: ProductVariantOutput[];
}

export interface ProductUpdateInput extends ProductCreateInput {}

export interface ProductUpdateOutput
  extends Omit<ProductUpdateInput, "attributes" | "variants"> {
  id: number;
  categoryTitle: string;
  attributes: ProductAttributeOutput[];
  variants: ProductVariantOutput[];
}

export interface ProductListOutput {
  id: number;
  name: string;
  shortDescription: string | null;
  price: number;
  discount: number;
  categoryId: number;
  categoryTitle: string;
  seller: ProductSeller;
  image: ProductImage | null;
  isAvailable: boolean;
}

export interface ProductSeller {
  id: number;
  name: string;
}

export interface ProductImage {
  id: number;
  name: string;
  url: string;
  isMain: boolean;
  fileType: number;
}

export interface ProductGetOutput extends Omit<ProductListOutput, "image"> {
  longDescription: string | null;
  brand: Brand | null;
  variants: ProductVariantOutput[];
  attributes: ProductAttributeGetOutput[];
  images: ProductImage[];
}

export interface ProductListParams {
  name?: string;
  categoryId?: number;
  sellerId?: number;
  minPrice?: number;
  maxPrice?: number;
  isAvailable?: boolean;
}

export interface ProductImageUploadInput {
  file: File;
  name: string;
  productId: number;
  isMain: boolean;
  fileType: 0 | 3;
}

export interface ProductImageOutput {
  id: number;
  name: string;
  url: string;
  tableName: 0;
  targetId: number;
  targetName: 0;
  isMain: boolean;
  fileType: 0 | 3;
}
