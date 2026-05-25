import axios from 'axios';

const pickMessage = (data: unknown): string | null => {
  if (typeof data === 'string' && data.trim() !== '') {
    return data;
  }

  if (!data || typeof data !== 'object') {
    return null;
  }

  const o = data as Record<string, unknown>;

  if (typeof o.message === 'string' && o.message.trim() !== '') {
    return o.message;
  }

  if (Array.isArray(o.message) && o.message.every((x) => typeof x === 'string')) {
    return o.message.join(', ');
  }

  if (typeof o.error === 'string' && o.error.trim() !== '') {
    return o.error;
  }

  return null;
};

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const fromBody = pickMessage(error.response?.data);

    if (fromBody) {
      return fromBody;
    }

    const status = error.response?.status;
    const statusText = error.response?.statusText;

    if (status != null) {
      return [String(status), statusText].filter(Boolean).join(' ');
    }
  }

  if (error instanceof Error && error.message.trim() !== '') {
    return error.message;
  }

  return fallback;
};
