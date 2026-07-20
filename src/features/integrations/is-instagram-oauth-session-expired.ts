import axios from "axios";

import { getApiErrorMessage } from "@/api/get-api-error-message";

export function isInstagramOAuthSessionExpiredError(error: unknown): boolean {
  if (!axios.isAxiosError(error) || error.response?.status !== 400) {
    return false;
  }

  const message = getApiErrorMessage(error, "").toLowerCase();
  const data = error.response?.data;
  const code =
    data && typeof data === "object" && "code" in data
      ? String((data as { code?: unknown }).code ?? "").toLowerCase()
      : "";
  const errorField =
    data && typeof data === "object" && "error" in data
      ? String((data as { error?: unknown }).error ?? "").toLowerCase()
      : "";

  return (
    message.includes("expired") ||
    code.includes("expired") ||
    errorField.includes("expired")
  );
}
