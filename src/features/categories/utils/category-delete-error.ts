import axios from "axios";

const HAS_CHILDREN_MESSAGE =
  "Cannot delete a category that has child categories";

export const isCategoryDeleteHasChildrenError = (error: unknown): boolean => {
  if (!axios.isAxiosError(error) || error.response?.status !== 409) {
    return false;
  }

  const data = error.response.data;

  if (typeof data === "string") {
    return data.includes(HAS_CHILDREN_MESSAGE);
  }

  if (!data || typeof data !== "object") {
    return false;
  }

  const message = (data as Record<string, unknown>).message;

  return typeof message === "string" && message.includes(HAS_CHILDREN_MESSAGE);
};
