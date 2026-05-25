export const instagramUserIdToApiString = (value: unknown): string => {
  if (value == null || value === '') {
    return '';
  }

  if (typeof value === 'string') {
    return value.slice(0, 255);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value).slice(0, 255);
  }

  try {
    return JSON.stringify(value).slice(0, 255);
  } catch {
    return '';
  }
};
