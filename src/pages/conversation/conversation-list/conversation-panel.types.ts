import type { ReactNode } from "react";

export type ConversationPanelProps = {
  collapsed?: boolean;
  variant?: "desktop" | "mobile";
  listHeaderSlot?: ReactNode;
  onCollapse?: () => void;
  onExpand?: () => void;
  onSelect?: () => void;
};
