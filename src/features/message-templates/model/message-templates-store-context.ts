import { createContext } from "react";

import type { MessageTemplatesStore } from "./message-templates-store";

export const MessageTemplatesStoreContext =
  createContext<MessageTemplatesStore | null>(null);
