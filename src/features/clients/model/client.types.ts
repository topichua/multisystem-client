export type ClientOrderStats = {
  orderCount: number;
  totalSpent: number;
  averageOrderPrice: number;
  lastOrderAt: string | null;
};

export type Client = {
  id: number;
  firstName: string;
  lastName: string;
  createdAt: string;
  phone: string;
  instagramUserIds: string[];
  telegramUserIds: string[];
  workspaceId: number;
  avatar_src?: string | null;
  orderStats?: ClientOrderStats;
};

export type ClientsListQueryParams = {
  page?: number;
  pageSize?: number;
  include_order_stat?: boolean;
  id?: never;
  instagramUserId?: never;
  instagramId?: never;
  telegramUserId?: never;
};

export type ClientsLookupByIdParams = {
  id: number;
  instagramUserId?: never;
  instagramId?: never;
  telegramUserId?: never;
  page?: never;
  pageSize?: never;
  include_order_stat?: never;
};

export type ClientsLookupByInstagramUserIdParams = {
  instagramUserId: string;
  id?: never;
  instagramId?: never;
  telegramUserId?: never;
  page?: never;
  pageSize?: never;
  include_order_stat?: never;
};

export type ClientsLookupByInstagramIdParams = {
  instagramId: string;
  id?: never;
  instagramUserId?: never;
  telegramUserId?: never;
  page?: never;
  pageSize?: never;
  include_order_stat?: never;
};

export type ClientsLookupByTelegramUserIdParams = {
  telegramUserId: string;
  id?: never;
  instagramUserId?: never;
  instagramId?: never;
  page?: never;
  pageSize?: never;
  include_order_stat?: never;
};

export type ClientsLookupParams =
  | ClientsLookupByIdParams
  | ClientsLookupByInstagramUserIdParams
  | ClientsLookupByInstagramIdParams
  | ClientsLookupByTelegramUserIdParams;

export type ClientsGetParams = ClientsListQueryParams | ClientsLookupParams;

export type ClientsListResponse = {
  items: Client[];
  total: number;
  page: number;
  pageSize: number;
};

export type ClientLookupResponse = {
  associated: boolean;
  status: string;
  client?: Client;
};

/** @deprecated Use ClientLookupResponse */
export type ClientInstagramAssociationResponse = ClientLookupResponse;

export type ClientCreatePayload = {
  first_name: string;
  last_name: string;
  phone: string;
  instagramUserIds: string[];
  telegramUserIds: string[];
};

export type ClientUpdatePayload = Partial<ClientCreatePayload>;
