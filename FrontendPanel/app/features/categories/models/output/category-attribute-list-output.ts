import type { AttributeType } from "~/features/attributes/models/enums/attribute-type";
import type { AttributeUnit } from "~/features/attributes/models/enums/attribute-unit";

export interface CategoryAttributeListOutput {
  id: number;
  categoryId: number;
  categoryTitle: string;
  attributeId: number;
  attributeTitle: string;
  attributeUnit: AttributeUnit;
  attributeType: AttributeType;
}
