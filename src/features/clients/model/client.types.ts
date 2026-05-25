export type Client = {
  id: number;
  firstName: string;
  lastName: string;
  createdAt: string;
  phone: string;
  deliveryInfo: string;
  instagramUserId: unknown;
  workspaceId: number;
};

export type ClientInstagramAssociationResponse = {
  associated: boolean;
  status: string;
  client?: Client;
};

export type ClientCreatePayload = {
  first_name: string;
  last_name: string;
  phone: string;
  delivery_info: string;
  instagramId: string;
};

export type ClientUpdatePayload = Partial<ClientCreatePayload>;
