import type { Client } from '@/features/clients/model/client.types';
import type { CatalogVariant } from '@/features/products/model/product.types';

export type OrderCreateItemPayload = {
  productId: number;
  variantId: number;
  quantity: number;
};

export type OrderDeliveryPayload = {
  provider: string;
  recipientName?: string;
  phone?: string;
  city?: string;
  cityRef?: string;
  warehouse?: string;
  warehouseRef?: string;
  address?: string;
  trackingNumber?: string;
  rawProviderPayload?: Record<string, unknown>;
};

export type OrderCreatePayload = {
  customerId: number;
  conversationId: number;
  source: string;
  currency: string;
  customerNote?: string;
  internalNote?: string;
  statusId?: number;
  items: OrderCreateItemPayload[];
  delivery: OrderDeliveryPayload;
};

export type OrderStatus = {
  id: number;
  workspaceId: number;
  name: string;
  category: string;
  color: string;
  sortOrder: number;
  isDefault: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OrderStatusUpdatePayload = {
  name: string;
  color: string;
  isDefault: boolean;
};

export type OrderCustomer = {
  id: number;
  firstName: string;
  lastName: string;
  createdAt: string;
  phone: string;
  deliveryInfo: string;
  instagramUserId: string | null;
  workspaceId: number;
};

export type OrderListItem = {
  id: number;
  workspaceId: number;
  customerId: number;
  customer: OrderCustomer;
  conversationId: number | null;
  source: string;
  statusId: number;
  status: OrderStatus;
  paymentStatus: string;
  deliveryStatus: string;
  currency: string;
  subtotalAmount: number;
  discountAmount: number;
  deliveryAmount: number;
  totalAmount: number;
  customerNote: string | null;
  internalNote: string | null;
  paidAt: string | null;
  paymentReference: string | null;
  createdById: number;
  updatedById: number;
  createdAt: string;
  updatedAt: string;
};

export type OrdersListResponse = {
  items: OrderListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type ClientOrderStats = {
  clientId: number;
  orderCount: number;
  totalSpent: number;
  averageOrderPrice: number;
  lastOrderAt: string | null;
};

export type OrderDraftLine = {
  variantId: number;
  quantity: number;
  variant: CatalogVariant;
};

export type OrderFormValues = {
  deliveryMethod?: string;
  postAddress?: string;
  billingMethod?: string;
  comment?: string;
};

export type BuildOrderCreatePayloadInput = {
  linkedClient: Client;
  conversationId: number;
  orderLines: OrderDraftLine[];
  formValues: OrderFormValues;
};
