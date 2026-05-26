import { createContext } from "react";

import type { ConversationsSocketStore } from "./conversations-socket-store";

export const ConversationsSocketStoreContext =
  createContext<ConversationsSocketStore | null>(null);
