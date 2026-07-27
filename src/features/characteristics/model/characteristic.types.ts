export type CharacteristicFieldType = "options" | "text";

export type CharacteristicBase = {
  id: number;
  key: string;
  label: string;
  type: CharacteristicFieldType;
  sortOrder: number;
};

/** Option shape returned by the characteristics list endpoint. */
export type CharacteristicListOption = {
  id: number;
  label: string;
  archivedAt: string | null;
};

export type Characteristic = CharacteristicBase & {
  options?: CharacteristicListOption[];
};

export type CharacteristicOption = {
  optionId: number;
  label: string;
  productCount: number;
  productVariantCount: number;
};

export type CharacteristicTopTextValue = {
  value: string;
  productCount: number;
  productVariantCount: number;
};

export type CharacteristicDetail = CharacteristicBase & {
  totalProducts?: number;
  options?: CharacteristicOption[];
  topTextValues?: CharacteristicTopTextValue[];
};

export type CharacteristicsListResponse = {
  workspaceId: number;
  items: Characteristic[];
};

export type CharacteristicCreatePayload = {
  key: string;
  label: string;
  type: CharacteristicFieldType;
  options?: string[];
  sortOrder: number;
};

export type CharacteristicUpdatePayload = {
  label?: string;
  options?: string[];
  sortOrder?: number;
};

export type CharacteristicOptionPayload = {
  label: string;
};
