import { useState, type ReactNode } from "react";

import { MessageTemplatesStoreContext } from "./message-templates-store-context";
import { MessageTemplatesStore } from "./message-templates-store";

type MessageTemplatesProviderProps = {
  children: ReactNode;
};

export const MessageTemplatesProvider = ({
  children,
}: MessageTemplatesProviderProps) => {
  const [store] = useState(() => new MessageTemplatesStore());

  return (
    <MessageTemplatesStoreContext.Provider value={store}>
      {children}
    </MessageTemplatesStoreContext.Provider>
  );
};
