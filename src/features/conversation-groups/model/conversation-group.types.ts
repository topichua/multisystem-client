export type ConversationGroup = {
  id: number;
  workspaceId: number;
  name: string;
  description: string;
  color: string;
  createdAt: string;
  createdById: number;
  sortOrder: number;
};

export type ConversationGroupsListResponse = {
  items: ConversationGroup[];
};

export type ConversationGroupWritePayload = {
  name: string;
  description: string;
  color: string;
  sort_order: number;
};
