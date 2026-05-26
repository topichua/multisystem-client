import type { ConversationMessage } from "@/features/conversations/model/types";

function collectAttachmentUrls(message: ConversationMessage): string[] {
  const data = message.attachments?.data ?? [];
  const urls: string[] = [];

  for (const entry of data) {
    const u =
      entry.image_data?.url ??
      entry.video_data?.preview_url ??
      entry.video_data?.url;
    if (u) {
      urls.push(u);
    }
  }

  return urls;
}

export const getMessageClipboardText = (
  message: ConversationMessage,
): string => {
  const lines: string[] = [];
  const body = (message.message ?? "").trim();

  if (body) {
    lines.push(body);
  }

  lines.push(...collectAttachmentUrls(message));

  return lines.join("\n").trim();
};

export const copyTextToClipboard = async (text: string): Promise<boolean> => {
  if (text === "") {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    /* try legacy below */
  }

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();

    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
};
