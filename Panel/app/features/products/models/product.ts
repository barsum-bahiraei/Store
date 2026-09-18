import type { AttributeType } from "~/features/attributes/models/enums/attribute-type";
import type { AttributeUnit } from "~/features/attributes/models/enums/attribute-unit";
import type { Brand } from "~/features/brands/models/brand";
import type { ProductVariant } from "~/features/variants/models/variant";

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

export interface ProductCreateInput {
  name: string;
  shortDescription: string | null;
  longDescription: string | null;
  price: number;
  discount: number;
  categoryId: number;
  sellerId: number;
  productBrandId: number;
  productVariantIds: number[];
  attributes: ProductAttributeInput[];
}

export interface ProductCreateOutput
  extends Omit<ProductCreateInput, "attributes" | "productVariantIds"> {
  id: number;
  attributes: ProductAttributeOutput[];
  variants: ProductVariant[];
}

export interface ProductUpdateInput extends ProductCreateInput {}

export interface ProductUpdateOutput
  extends Omit<ProductUpdateInput, "attributes" | "productVariantIds"> {
  id: number;
  categoryTitle: string;
  attributes: ProductAttributeOutput[];
  variants: ProductVariant[];
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
  variants: ProductVariant[];
  attributes: ProductAttributeGetOutput[];
  images: ProductImage[];
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
