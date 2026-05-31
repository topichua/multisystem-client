const PRODUCT_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

const PRODUCT_IMAGE_ACCEPTED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);

type ProductImageValidationMessages = {
  invalidType: string;
  tooLarge: string;
};

const DEFAULT_MESSAGES: ProductImageValidationMessages = {
  invalidType: "Only PNG, JPG, and WEBP images are allowed",
  tooLarge: "Image must be less than 10MB",
};

export function validateProductImageFile(
  file: File,
  messages: Partial<ProductImageValidationMessages> = {},
): string | null {
  const resolvedMessages = { ...DEFAULT_MESSAGES, ...messages };

  if (!PRODUCT_IMAGE_ACCEPTED_MIME_TYPES.has(file.type)) {
    return resolvedMessages.invalidType;
  }

  if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
    return resolvedMessages.tooLarge;
  }

  return null;
}
