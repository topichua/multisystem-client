import { createContext } from "react";

import type { InstagramStore } from "./instagram-store";

export const InstagramStoreContext = createContext<InstagramStore | null>(null);
