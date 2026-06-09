import type { TFunction } from "i18next";

const PREVIEW_MAX_LENGTH = 56;

export function getTemplatePreview(
  value: string,
  t: TFunction,
  maxLength = PREVIEW_MAX_LENGTH,
): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return t("templates.emptyPreview");
  }

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength)}…`;
}

export function getTemplateCharacterCount(value: string): number {
  return value.length;
}
