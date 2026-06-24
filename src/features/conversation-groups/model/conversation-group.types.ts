export type ConversationGroup = {
  id: number;
  workspaceId: number;
  name: string;
  description: string;
  color: string;
  counter: number;
  createdAt: string;
  createdById: number;
  sortOrder: number;
};

export type ConversationGroupResponse = Omit<ConversationGroup, "counter"> & {
  counter?: number | null;
};

export type ConversationGroupsListResponse = {
  items: ConversationGroupResponse[];
};

export type ConversationGroupWritePayload = {
  name: string;
  description: string;
  color: string;
  sort_order: number;
};
