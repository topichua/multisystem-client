export type ConversationGroup = {
  id: number;
  workspaceId: number;
  name: string;
  description: string;
  color: string;
  counter: number;
  createdAt: string;
  createdById: number | null;
  sortOrder: number;
  systemKey?: string | null;
  isSystem?: boolean;
};

export type ConversationGroupResponse = Omit<
  ConversationGroup,
  "description" | "counter" | "createdById"
> & {
  description: string | null;
  createdById?: number | null;
  conversationCount?: number | null;
  counter?: number | null;
};

export type ConversationGroupsListResponse = {
  items: ConversationGroupResponse[];
  totalConversations?: number | null;
};

export type ConversationGroupsListResult = {
  groups: ConversationGroup[];
  totalConversations: number;
};

export type ConversationGroupWritePayload = {
  name: string;
  description: string;
  color: string;
  sort_order: number;
};
