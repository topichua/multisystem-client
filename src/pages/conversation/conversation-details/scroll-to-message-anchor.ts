export const MESSAGE_SCROLL_HIGHLIGHT_CLASS = 'conversation-message-scroll-highlight';

const HIGHLIGHT_MS = 2400;

export const scrollMessageAnchorIntoView = (
  scrollRoot: HTMLElement | null,
  messageId: string,
): boolean => {
  if (scrollRoot == null || messageId === '') {
    return false;
  }

  try {
    const escaped = CSS.escape(messageId);
    const el = scrollRoot.querySelector<HTMLElement>(`[data-message-anchor="${escaped}"]`);

    if (el == null) {
      return false;
    }

    const prev = scrollRoot.querySelector<HTMLElement>(`.${MESSAGE_SCROLL_HIGHLIGHT_CLASS}`);
    if (prev != null && prev !== el) {
      prev.classList.remove(MESSAGE_SCROLL_HIGHLIGHT_CLASS);
    }

    el.classList.add(MESSAGE_SCROLL_HIGHLIGHT_CLASS);
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    window.setTimeout(() => {
      el.classList.remove(MESSAGE_SCROLL_HIGHLIGHT_CLASS);
    }, HIGHLIGHT_MS);

    return true;
  } catch {
    return false;
  }
};
