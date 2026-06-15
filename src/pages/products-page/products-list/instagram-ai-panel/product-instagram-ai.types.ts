import type { InstagramPostAiExtractionResponse } from "@/features/instagram/model/instagram.types";

export type ProductInstagramAiCategoryOption = {
  value: number;
  label: string;
};

export type ProductInstagramAiFillHandler = (
  extraction: InstagramPostAiExtractionResponse,
) => void | Promise<void>;
