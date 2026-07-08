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
  delivery?: OrderDeliveryPayload;
  discountPercent?: number;
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
  workspaceId: number;
  groupId: number | null;
  responsibleMemberId: number | null;
  responsibleMemberSetAt: string | null;
};

export type OrderDeliveryInfo = {
  id: number;
  provider: string;
  providerId: number | null;
  deliveryStatus: string | null;
  recipientName: string | null;
  phone: string | null;
  city: string | null;
  cityRef: string | null;
  warehouse: string | null;
  warehouseRef: string | null;
  deliveryType: OrderDeliveryType | null;
  street: string | null;
  streetRef: string | null;
  building: string | null;
  flat: string | null;
  trackingNumber: string | null;
  providerStatusCode: string | null;
  providerStatusText: string | null;
  providerDocumentRef: string | null;
  isCashOnDelivery: boolean;
  cashOnDeliveryAmount: number | null;
  canRemoveTracking: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OrderDetailsItem = {
  id: number;
  workspaceId: number;
  orderId: number;
  productId: number | null;
  variantId: number | null;
  quantity: number;
  unitPriceAmount: number;
  totalPriceAmount: number;
  unitPriceSnapshot: number | null;
  unitCostSnapshot: number | null;
  totalSaleAmount: number | null;
  totalCostAmount: number | null;
  profitAmount: number | null;
  stockDeductedAt: string | null;
  productTitleSnapshot: string | null;
  variantTitleSnapshot: string | null;
  skuSnapshot: string | null;
  imageUrlSnapshot: string | null;
  variantAttributesSnapshot: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderDetailsEvent = {
  id: number;
  workspaceId: number;
  orderId: number;
  type: string;
  actorId: number | null;
  userId: number | null;
  payload: Record<string, unknown> | null;
  createdAt: string;
};

export type OrderDetails = OrderListItem & {
  conversation: OrderConversation | null;
  deliveryId: number | null;
  deliveryType: string | null;
  items: OrderDetailsItem[];
  deliveryInfo: OrderDeliveryInfo | null;
  canRemoveTracking: boolean;
  canEditItems: boolean;
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
  withoutDelivery?: boolean;
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
  discountPercent?: number;
};

export type BuildOrderCreatePayloadInput = {
  linkedClient: Client;
  conversationId: number;
  orderLines: OrderDraftLine[];
  formValues: OrderFormValues;
};
