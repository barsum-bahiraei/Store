import type { AttributeType } from "../enums/attribute-type";
import type { AttributeUnit } from "../enums/attribute-unit";

export interface AttributeUpdateInput {
  name: string;
  unit: AttributeUnit;
  type: AttributeType;
}
