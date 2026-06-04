import { createContext } from "react";

import type { CharacteristicsStore } from "./characteristics-store";

export const CharacteristicsStoreContext =
  createContext<CharacteristicsStore | null>(null);
