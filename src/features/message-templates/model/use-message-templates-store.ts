import { useContext } from "react";

import { MessageTemplatesStoreContext } from "./message-templates-store-context";
import type { MessageTemplatesStore } from "./message-templates-store";

export const useMessageTemplatesStore = (): MessageTemplatesStore => {
  const store = useContext(MessageTemplatesStoreContext);

  if (!store) {
    throw new Error(
      "useMessageTemplatesStore must be used within MessageTemplatesProvider",
    );
  }

  return store;
};
