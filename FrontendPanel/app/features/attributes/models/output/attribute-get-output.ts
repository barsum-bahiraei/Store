import type { AttributeType } from "../enums/attribute-type";
import type { AttributeUnit } from "../enums/attribute-unit";

export interface AttributeGetOutput {
  id: number;
  name: string;
  unit: AttributeUnit;
  type: AttributeType;
}
