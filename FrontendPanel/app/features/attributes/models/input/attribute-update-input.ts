import type { AttributeType } from "../enums/attribute-type";
import type { AttributeUnit } from "../enums/attribute-unit";

export interface AttributeUpdateInput {
  title: string;
  unit: AttributeUnit;
  type: AttributeType;
}
