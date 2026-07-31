import type { AttributeType, AttributeUnit } from "./attribute";

export interface CreateAttributeInput {
  title: string;
  unit: AttributeUnit;
  type: AttributeType;
}

export interface UpdateAttributeInput {
  title: string;
  unit: AttributeUnit;
  type: AttributeType;
}
