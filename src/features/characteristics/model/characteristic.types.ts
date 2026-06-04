export type CharacteristicFieldType = "options" | "text";

export type Characteristic = {
  id: number;
  key: string;
  label: string;
  type: CharacteristicFieldType;
  options?: string[];
  sortOrder: number;
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
