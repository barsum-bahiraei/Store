import type { Attribute } from "./attribute";

export type AttributeDto = Omit<Attribute, "id">;
