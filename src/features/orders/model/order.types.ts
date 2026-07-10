import type { Client } from "@/features/clients/model/client.types";
import type { CatalogVariant } from "@/features/products/model/product.types";

export type OrderCreateItemPayload = {
  productId: number;
  variantId: number;
  quantity: number;
  discountAmount?: number;
  discountPercent?: number;
};

export type OrderCustomerNewPayload = {
  firstName: string;
  lastName: string;
  phone: string;
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
  street?: string;
  streetRef?: string;
  building?: string;
  flat?: string;
  trackingNumber?: string;
  providerStatusCode?: string;
  providerStatusText?: string;
  providerDocumentRef?: string;
  isCashOnDelivery?: boolean;
  cashOnDeliveryAmount?: number;
};

export type OrderCreatePayload = {
  customerId?: number;
  customerNew?: OrderCustomerNewPayload;
  conversationId: number;
  source: string;
  currency: string;
  customerNote?: string;
  internalNote?: string;
  discountAmount?: number;
  discountPercent?: number;
  items: OrderCreateItemPayload[];
  delivery?: OrderDeliveryPayload;
};

export type OrderNovaPoshtaWaybillPayload = {
  weightGrams: number;
  seatsAmount: number;
  seatsCount: number;
  description: string;
  declaredCost: number;
};

export type OrderNovaPoshtaWaybillResponse = {
  orderId: number;
  trackingNumber: string;
  documentRef: string;
};

export type OrderStatusCategory =
  | "new"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivery"
  | "completed"
  | "canceled";

export const ORDER_STATUS_CATEGORIES = [
  "new",
  "confirmed",
  "packed",
  "shipped",
  "delivery",
  "completed",
  "canceled",
] as const satisfies readonly OrderStatusCategory[];

export type OrderStatus = {
  id: number;
  workspaceId: number;
  name: string;
  category: OrderStatusCategory;
  color: string;
  sortOrder: number;
  isDefault: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OrderStatusCreatePayload = {
  name: string;
  category: OrderStatusCategory;
  color: string;
  isDefault: boolean;
};

export type OrderStatusUpdatePayload = {
  name: string;
  color: string;
  category: OrderStatusCategory;
  isDefault: boolean;
};

export type OrderStatusReorderPayload = {
  ids: number[];
};

export type OrderCustomer = {
  id: number;
  firstName: string;
  lastName: string;
  createdAt: string;
  phone: string;
  workspaceId: number;
};

export type OrderCreatedBy = {
  id: number;
  firstName: string;
  lastName: string;
  avatar: string | null;
};

export type OrderListDelivery = {
  id: number;
  provider: string;
  deliveryType: OrderDeliveryType | string | null;
  city: string | null;
  warehouse: string | null;
  trackingNumber: string | null;
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
  deliveryStatus?: string;
  currency: string;
  subtotalAmount: number;
  discountAmount: number;
  discountPercent: number | null;
  deliveryAmount: number;
  totalAmount: number;
  itemsCount?: number;
  customerNote: string | null;
  internalNote: string | null;
  paidAt: string | null;
  paymentReference: string | null;
  createdById: number;
  createdBy: OrderCreatedBy | null;
  updatedById: number;
  createdAt: string;
  updatedAt: string;
  deliveryId: number | null;
  deliveryType: string | null;
  delivery: OrderListDelivery | null;
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

export type ClientLastOrderStatus = {
  id: number;
  name: string;
  category: OrderStatusCategory;
};

export type ClientLastOrder = {
  id: number;
  totalPrice: number;
  status: ClientLastOrderStatus;
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

export type OrderCreateLineInput = OrderDraftLine & {
  discountPercent?: number;
};

export type BuildStandaloneOrderCreatePayloadInput = {
  clientMode: "existing" | "new";
  existingClient: Client | null;
  newClient?: OrderCustomerNewPayload;
  orderLines: OrderCreateLineInput[];
  formValues: OrderFormValues;
  source: string;
  orderDiscountPercent?: number;
};
