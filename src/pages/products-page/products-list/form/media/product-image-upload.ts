const PRODUCT_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

const PRODUCT_IMAGE_ACCEPTED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);

export function validateProductImageFile(file: File): string | null {
  if (!PRODUCT_IMAGE_ACCEPTED_MIME_TYPES.has(file.type)) {
    return "Only PNG, JPG, and WEBP images are allowed";
  }

  if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
    return "Image must be less than 10MB";
  }

  return null;
}
