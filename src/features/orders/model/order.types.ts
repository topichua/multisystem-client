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

export type OrderDeliveryPayerType = "sender" | "recipient";

export type OrderDeliveryPayload = {
  provider?: string;
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
  payerType?: OrderDeliveryPayerType;
};

export type OrderDeliveryTrackingPayload = {
  provider: string;
  trackingNumber: string;
  providerId?: number;
  phone?: string;
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

export type OrderUpdatePayload = {
  items?: OrderCreateItemPayload[];
  discountAmount?: number;
  discountPercent?: number;
  customerNote?: string;
  internalNote?: string;
  delivery?: OrderDeliveryPayload;
};

export type OrderNovaPoshtaWaybillPayload = {
  default_weight_kg: number;
  default_width_cm: number;
  default_height_cm: number;
  default_length_cm: number;
  payer_type: OrderDeliveryPayerType;
  seats_amount: number;
};

export type OrderNovaPoshtaWaybillResponse = {
  orderId: number;
  trackingNumber: string;
  documentRef: string;
};

export type OrderStatusCategory =
  | "new"
  | "confirmed"
  | "delivery"
  | "completed"
  | "canceled";

export const ORDER_STATUS_CATEGORIES = [
  "new",
  "confirmed",
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
  deliveryStatus: string;
  deliveryStatusAt: string | null;
  trackingNumber: string | null;
  deliveryStatusCode: string | null;
  deliveryStatusText: string | null;
};

export const ORDER_PAYMENT_STATUSES = ["unpaid", "paid", "partial"] as const;

export type OrderPaymentStatus = (typeof ORDER_PAYMENT_STATUSES)[number];

export type OrderPaymentTransaction = {
  id: number;
  workspaceId?: number;
  orderId?: number;
  paymentId: number | null;
  provider: string | null;
  type: string | null;
  method: string | null;
  amount: number;
  currency: string;
  status: string;
  source: string | null;
  externalTransactionId: string | null;
  note: string | null;
  manualPaymentMethodId: number | null;
  manualPaymentKind?: string | null;
  confirmedById?: number | null;
  /** Payment page URL from acquiring provider (field name may vary by backend). */
  paymentUrl?: string | null;
  checkoutUrl?: string | null;
  pageUrl?: string | null;
  occurredAt: string | null;
  createdAt: string;
};

export type OrderManualPaymentPayload = {
  amount: number;
  note?: string | null;
  manualPaymentMethodId: number | null;
};

export type OrderDeliveryPaymentPayload = {
  amount: number;
  note: string;
};

export type OrderOnlinePaymentPayload = {
  amount: number;
  integrationId: number;
};

export type OrderRefundStatus =
  | "pending"
  | "approved"
  | "confirmed"
  | "succeeded"
  | "cancelled"
  | "canceled"
  | "rejected"
  | string;

export type OrderRefund = {
  id: number;
  orderId: number;
  amount: number;
  currency: string;
  status: OrderRefundStatus;
  note: string | null;
  createdById: number | null;
  reviewedById: number | null;
  reviewedAt: string | null;
  paymentTransactionId: number | null;
  occurredAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderRefundsListResponse = {
  orderId: number;
  refunds: OrderRefund[];
};

export type OrderRefundCreatePayload = {
  amount: number;
  note?: string | null;
  occurredAt?: string | null;
};

export type OrderRefundApprovePayload = {
  note?: string | null;
};

export type OrderRefundMutationResponse = {
  orderId: number;
  paymentStatus: OrderPaymentStatus;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  refund: OrderRefund;
};

export type OrderOnlinePayment = {
  id: number;
  orderId: number;
  integrationId: number;
  method: string;
  provider: string;
  amount: number;
  currency: string;
  status: string;
  externalPaymentId: string | null;
  paymentUrl: string | null;
  expiresAt: string | null;
  paidAt: string | null;
  failureReason: string | null;
  createdById: number | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderPaymentsSummary = {
  orderId: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: OrderPaymentStatus;
  payments: OrderOnlinePayment[];
  selectedManualPaymentMethod: unknown | null;
  selectedManualPaymentKind: string | null;
};

export type OrderConfirmPaymentTransactionPayload = {
  occurredAt?: string | null;
  note?: string | null;
};

export type OrderPaymentMutationResponse = {
  orderId: number;
  paymentStatus: OrderPaymentStatus;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  transaction: OrderPaymentTransaction;
};

export type OrderListPayment = {
  manualPaymentMethodId: string | null;
  paidAmount: number;
  paidAt: string | null;
  payments: OrderPaymentTransaction[] | null;
  reference: string | null;
  remainingAmount: number | null;
  status: OrderPaymentStatus;
  statusAt: string | null;
};

export type OrderListItem = {
  id: number;
  workspaceId: number;
  customerId: number;
  customer: OrderCustomer;
  conversationId: number | null;
  integrationId: number | null;
  source: string;
  statusId: number;
  status: OrderStatus;
  currency: string;
  subtotalAmount: number;
  discountAmount: number;
  discountPercent: number | null;
  deliveryAmount: number;
  totalAmount: number;
  itemsCount?: number;
  customerNote: string | null;
  internalNote: string | null;
  createdById: number;
  createdBy: OrderCreatedBy | null;
  updatedById: number;
  createdAt: string;
  updatedAt: string;
  deliveryId: number | null;
  deliveryType: string | null;
  delivery: OrderListDelivery | null;
  deliveryInfo: OrderDeliveryInfo | null;
  payment: OrderListPayment;
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
  canSyncPayment?: boolean;
  paymentId?: number | null;
  id: number;
  provider: string;
  providerId: number | null;
  deliveryStatus: string | null;
  deliveryStatusAt?: string | null;
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
  payerType?: OrderDeliveryPayerType | null;
  deliveryPrice?: number | null;
  syncedFromTrackingManually?: boolean;
  canRemoveTracking?: boolean;
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
  items: OrderDetailsItem[];
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
  color: string;
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
  payerType?: OrderDeliveryPayerType;
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
