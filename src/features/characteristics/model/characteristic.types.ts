export type CharacteristicFieldType = "options" | "text";

export type CharacteristicBase = {
  id: number;
  key: string;
  label: string;
  displayName?: string | null;
  type: CharacteristicFieldType;
  sortOrder: number;
  archivedAt: string | null;
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
  archivedAt: string | null;
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
  displayName?: string;
  type: CharacteristicFieldType;
  options?: string[];
  sortOrder: number;
};

export type CharacteristicUpdatePayload = {
  label?: string;
  displayName?: string | null;
  options?: string[];
  sortOrder?: number;
};

export type CharacteristicOptionPayload = {
  label: string;
};

export type CharacteristicLibraryField = {
  key: string;
  label: string;
  displayLabel: string;
  type: CharacteristicFieldType;
  typeLabel: string;
  options: string[];
  description?: string;
  sortOrder: number;
  alreadyInstalled: boolean;
  workspaceFieldId: number | null;
};

export type CharacteristicLibraryGroup = {
  key: string;
  label: string;
  icon: string;
  fieldCount: number;
  sortOrder: number;
  fields: CharacteristicLibraryField[];
};

export type CharacteristicLibraryResponse = {
  workspaceId: number;
  featured: CharacteristicLibraryField[];
  groups: CharacteristicLibraryGroup[];
};

export type CharacteristicLibraryInstallPayload = {
  key: string;
  groupKey: string;
};

export type CharacteristicLibraryInstallResponse = {
  field: Characteristic;
  groupKey: string;
};

export type CharacteristicLibraryInstallGroupPayload = {
  groupKey: string;
};

export type CharacteristicLibraryInstallGroupSkipped = {
  key: string;
  workspaceFieldId: number | null;
  reason: string;
};

export type CharacteristicLibraryInstallGroupResponse = {
  groupKey: string;
  installed: Characteristic[];
  skipped: CharacteristicLibraryInstallGroupSkipped[];
};
