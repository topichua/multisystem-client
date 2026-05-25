export const normalizeWebhookReactionEmoji = (raw: string): string => {
  const s = raw.trim().replace(/\uFE0E/g, '');
  if (s.length === 0) {
    return '';
  }

  const cp = s.codePointAt(0);
  if (cp === 0x2764) {
    return '❤️';
  }
  if (cp === 0x2665) {
    return '❤️';
  }
  if (cp === 0x2763) {
    return '❤️';
  }

  return s;
};
