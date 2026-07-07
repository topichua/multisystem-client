import type { Client } from "@/features/clients/model/client.types";
import type { CatalogVariant } from "@/features/products/model/product.types";

export type OrderCreateItemPayload = {
  productId: number;
  variantId: number;
  quantity: number;
};

export type OrderDeliveryType = "warehouse" | "address";

export type OrderDeliveryPayload = {
  provider: string;
  providerId?: number;
  deliveryStatus?: string;
  recipientName?: string;
  phone?: string;
  city?: string;
  cityRef?: string;
  warehouse?: string;
  warehouseRef?: string;
  deliveryType?: OrderDeliveryType;
  address?: string;
  street?: string;
  streetRef?: string;
  building?: string;
  flat?: string;
  trackingNumber?: string;
  isCashOnDelivery?: boolean;
  cashOnDeliveryAmount?: number;
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
  itemsCount?: number;
  customerNote: string | null;
  internalNote: string | null;
  paidAt: string | null;
  paymentReference: string | null;
  createdById: number;
  updatedById: number;
  createdAt: string;
  updatedAt: string;
};

export type OrderConversation = {
  id: number;
  externalSourceId: string | null;
  externalId: string | null;
  instUpdatedAt: string | null;
  readAt: string | null;
  participantId: string | null;
  source: number | null;
  managerId: number | null;
  groupId: number | null;
};

export type OrderDeliveryInfo = {
  id: number;
  orderId: number;
  provider: string;
  recipientName: string | null;
  phone: string | null;
  city: string | null;
  cityRef: string | null;
  warehouse: string | null;
  warehouseRef: string | null;
  address: string | null;
  trackingNumber: string | null;
  rawProviderPayload: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderDetailsItem = {
  id: number;
  orderId: number;
  productId: number | null;
  variantId: number | null;
  productTitleSnapshot: string | null;
  variantTitleSnapshot: string | null;
  variantAttributesSnapshot: Record<string, unknown> | null;
  imageUrlSnapshot: string | null;
  skuSnapshot: string | null;
  quantity: number;
  unitPriceAmount: number;
  totalPriceAmount: number;
  createdAt: string;
  updatedAt: string;
};

export type OrderDetailsEvent = {
  id: number;
  orderId: number;
  type: string;
  payload: Record<string, unknown> | null;
  actorId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderDetails = OrderListItem & {
  conversation: OrderConversation | null;
  items: OrderDetailsItem[];
  deliveryInfos: OrderDeliveryInfo[];
  events: OrderDetailsEvent[];
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
  firstName?: string;
  lastName?: string;
  phone?: string;
  deliveryMethod?: string;
  novaPoshtaIntegrationId?: number;
  deliveryType?: OrderDeliveryType;
  city?: string;
  cityRef?: string;
  settlementRef?: string;
  warehouse?: string;
  warehouseRef?: string;
  street?: string;
  streetRef?: string;
  building?: string;
  flat?: string;
  postAddress?: string;
  billingMethod?: string;
  isCashOnDelivery?: boolean;
  cashOnDeliveryAmount?: number;
  comment?: string;
};

export type BuildOrderCreatePayloadInput = {
  linkedClient: Client;
  conversationId: number;
  orderLines: OrderDraftLine[];
  formValues: OrderFormValues;
};
