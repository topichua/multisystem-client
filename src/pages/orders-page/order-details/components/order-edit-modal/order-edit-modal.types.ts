import type {
  OrderDetails,
  OrderUpdatePayload,
} from "@/features/orders/model/order.types";

import type { OrderEditMode } from "@/pages/orders-page/order-details/order-details.types";

export type { OrderEditMode };

export type OrderEditModalProps = {
  order: OrderDetails;
  open: boolean;
  mode: OrderEditMode;
  onClose: () => void;
  onUpdateOrder: (payload: OrderUpdatePayload) => Promise<void>;
};

export type OrderEditModalSessionProps = Omit<OrderEditModalProps, "open">;

export type OrderEditFormValues = {
  customerNote?: string;
  internalNote?: string;
  discountAmount?: number | null;
  discountPercent?: number | null;
};

export type EditableOrderLine = {
  key: string;
  productId: number | null;
  variantId: number | null;
  title: string;
  meta: string;
  imageUrl: string | null;
  quantity: number;
  unitPriceAmount: number;
  discountAmount: number;
  discountPercent: number;
};

export type DiscountType = "amount" | "percent";
