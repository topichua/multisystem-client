/** URLs suitable for `fetch` as product images (excludes Instagram HTML permalinks). */
export const isDownloadableProductImageUrl = (url: string): boolean => {
  if (!/^https?:\/\//i.test(url)) return false;
  const lower = url.toLowerCase();
  if (lower.includes('instagram.com/p/')) return false;
  if (lower.includes('instagram.com/reel/')) return false;
  if (lower.includes('instagram.com/tv/')) return false;
  if (lower.includes('cdninstagram.com')) return true;
  if (/\.(jpe?g|png|webp|gif)(\?|$)/i.test(url)) return true;
  return false;
};

const extensionFromMime = (mime: string): string => {
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
  if (mime.includes('png')) return 'png';
  if (mime.includes('webp')) return 'webp';
  if (mime.includes('gif')) return 'gif';
  return 'jpg';
};

export const fetchUrlAsImageFile = async (
  url: string,
  filenameBase: string,
): Promise<File | null> => {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.size) return null;
    const type = blob.type || '';
    if (type && !type.startsWith('image/')) return null;
    const ext = extensionFromMime(type || 'image/jpeg');
    const safeBase = filenameBase.replace(/[^\w.-]+/g, '_').slice(0, 80) || 'image';
    return new File([blob], `${safeBase}.${ext}`, { type: type || 'image/jpeg' });
  } catch {
    return null;
  }
};
