import type { AttributeType } from "~/features/attributes/models/enums/attribute-type";
import type { AttributeUnit } from "~/features/attributes/models/enums/attribute-unit";

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
  title: string;
  description: string;
  price: number;
  discount: number;
  categoryId: number;
  attributes: ProductAttributeInput[];
}

export interface ProductCreateOutput extends Omit<ProductCreateInput, "attributes"> {
  id: number;
  attributes: ProductAttributeOutput[];
}

export interface ProductUpdateInput extends ProductCreateInput {}

export interface ProductUpdateOutput extends Omit<ProductUpdateInput, "attributes"> {
  id: number;
  categoryTitle: string;
  attributes: ProductAttributeOutput[];
}

export interface ProductListOutput {
  id: number;
  title: string;
  description: string;
  price: number;
  discount: number;
  categoryId: number;
  categoryTitle: string;
  image: ProductImage | null;
}

export interface ProductImage {
  id: number;
  title: string;
  url: string;
  isMain: boolean;
  fileType: number;
}

export interface ProductGetOutput extends Omit<ProductListOutput, "image"> {
  attributes: ProductAttributeGetOutput[];
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
