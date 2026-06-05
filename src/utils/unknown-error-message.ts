import i18n from "@/i18n";

export const unknownErrorMessage = (error: unknown): string =>
  error instanceof Error && error.message.trim() !== ""
    ? error.message
    : i18n.t("errors.somethingWentWrong");
