import type { AttributeType } from "~/features/attributes/models/enums/attribute-type";
import type { AttributeUnit } from "~/features/attributes/models/enums/attribute-unit";

export interface CategoryAttributeAddOutput {
  id: number;
  attributeId: number;
  attributeTitle: string | null;
  attributeUnit: AttributeUnit;
  attributeType: AttributeType;
}
