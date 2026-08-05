import type { FormInstance } from "antd";
import { Form } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router";

import { getOrderDetailsPath } from "@/app/router/pages-map";
import { getApiErrorMessage } from "@/api/get-api-error-message";
import { clientsApi } from "@/features/clients/api/clients-api";
import type { Client } from "@/features/clients/model/client.types";
import { useClientsStore } from "@/features/clients/model/use-clients-store";
import {
  ORDER_SOURCE_VALUES,
  type OrderSource,
} from "@/features/orders/model/order-list.constants";
import type {
  OrderDeliveryType,
  OrderFormValues,
} from "@/features/orders/model/order.types";
import { useOrdersStore } from "@/features/orders/model/use-orders-store";
import type { CatalogVariant } from "@/features/products/model/product.types";
import { useCatalogProductSearch } from "@/features/products/components/catalog-product-search";
import { getCatalogVariantUnitPrice } from "@/features/products/utils/catalog-variant-display";
import { formatClientDisplayName } from "@/pages/clients-page/clients-list/client-display.utils";
import { useClientOrderNovaPoshtaDelivery } from "@/pages/conversation/conversation-details/components/client-order-drawer/use-client-order-nova-poshta-delivery";
import { phoneFieldRules } from "@/utils/phone-input";
import { useNotification } from "@/shared/components/notification/use-notification";

import { SUMMARY_DELIVERY_AMOUNT, drawerKey } from "./orders-new.constants";
import type {
  ClientMode,
  NewClientFormValues,
  OrderNewLine,
  PaymentMethodValue,
} from "./orders-new.types";
import {
  formatClientContact,
  normalizeClientPhoneSearchText,
  normalizeClientSearchText,
} from "./orders-new.utils.tsx";

export function useOrdersNewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const notification = useNotification();
  const clientsStore = useClientsStore();
  const ordersStore = useOrdersStore();
  const [clientForm] = Form.useForm<NewClientFormValues>();
  const [deliveryForm] = Form.useForm<OrderFormValues>();
  const lastAutoCashOnDeliveryAmountRef = useRef<number | null>(null);
  const [clientMode, setClientMode] = useState<ClientMode>("existing");
  const [clientsRequested, setClientsRequested] = useState(false);
  const [clientSearchValue, setClientSearchValue] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const catalogSearch = useCatalogProductSearch({
    enabled: productSearchOpen,
    loadCategories: true,
  });
  const [orderLines, setOrderLines] = useState<OrderNewLine[]>([]);
  const [orderSource, setOrderSource] = useState<OrderSource>("manual");
  const [orderDiscountPercent, setOrderDiscountPercent] = useState(0);
  const novaPoshtaDelivery = useClientOrderNovaPoshtaDelivery({
    form: deliveryForm,
  });
  const withoutDelivery =
    Form.useWatch("withoutDelivery", deliveryForm) === true;
  const deliveryType =
    (Form.useWatch("deliveryType", deliveryForm) as OrderDeliveryType) ??
    "warehouse";
  const isCashOnDelivery = Form.useWatch("isCashOnDelivery", deliveryForm);
  const cashOnDeliveryAmount = Form.useWatch(
    "cashOnDeliveryAmount",
    deliveryForm,
  );
  const selectedCityRef = Form.useWatch("cityRef", deliveryForm);
  const selectedWarehouseRef = Form.useWatch("warehouseRef", deliveryForm);
  const selectedStreetRef = Form.useWatch("streetRef", deliveryForm);
  const newClientFirstName = Form.useWatch("clientFirstName", clientForm);
  const newClientLastName = Form.useWatch("clientLastName", clientForm);
  const newClientPhone = Form.useWatch("clientPhone", clientForm);
  const isAddressDelivery = deliveryType === "address";
  const paymentMethodValue: PaymentMethodValue =
    isCashOnDelivery === false ? "prepayment" : "cash_on_delivery";

  const clientModeOptions = useMemo<
    Array<{ label: string; value: ClientMode }>
  >(
    () => [
      {
        label: t("orders.create.client.existingMode"),
        value: "existing",
      },
      {
        label: t("orders.create.client.newMode"),
        value: "new",
      },
    ],
    [t],
  );

  const phoneRules = useMemo(
    () =>
      phoneFieldRules({
        required: true,
        requiredMessage: t("orders.create.client.required"),
        invalidMessage: t("clients.phoneInvalid"),
      }),
    [t],
  );

  const deliveryPhoneRules = useMemo(
    () =>
      phoneFieldRules({
        required: false,
        invalidMessage: t("clients.phoneInvalid"),
      }),
    [t],
  );

  const deliveryTypeOptions = useMemo<
    Array<{ label: string; value: OrderDeliveryType }>
  >(
    () => [
      {
        value: "warehouse",
        label: t(drawerKey("deliveryTypeWarehouse")),
      },
      {
        value: "address",
        label: t(drawerKey("deliveryTypeAddress")),
      },
    ],
    [t],
  );

  const paymentMethodOptions = useMemo<
    Array<{ disabled?: boolean; label: string; value: PaymentMethodValue }>
  >(
    () => [
      {
        value: "cash_on_delivery",
        label: t(drawerKey("cashOnDelivery")),
        disabled: withoutDelivery,
      },
      {
        value: "prepayment",
        label: t("orders.create.payment.prepaymentCard"),
      },
    ],
    [t, withoutDelivery],
  );

  const orderSourceOptions = useMemo<
    Array<{ label: string; value: OrderSource }>
  >(
    () =>
      ORDER_SOURCE_VALUES.map((source) => ({
        value: source,
        label: t(`orders.sources.${source}`, { defaultValue: source }),
      })),
    [t],
  );

  const prefillClientId = useMemo(() => {
    const raw = searchParams.get("clientId");

    if (raw == null || raw.trim() === "") {
      return null;
    }

    const parsed = Number(raw);

    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }, [searchParams]);

  const clearPrefillClientId = useCallback(() => {
    if (!searchParams.has("clientId")) {
      return;
    }

    const next = new URLSearchParams(searchParams);
    next.delete("clientId");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const visibleClients = useMemo(() => {
    const normalizedSearch = normalizeClientSearchText(clientSearchValue);
    const normalizedPhoneSearch =
      normalizeClientPhoneSearchText(clientSearchValue);

    if (!normalizedSearch) {
      return clientsStore.clients;
    }

    return clientsStore.clients.filter((client) => {
      const name = normalizeClientSearchText(formatClientDisplayName(client));
      const phone = normalizeClientSearchText(client.phone);
      const normalizedPhone = normalizeClientPhoneSearchText(client.phone);
      const contact = normalizeClientSearchText(formatClientContact(client));

      return (
        name.includes(normalizedSearch) ||
        phone.includes(normalizedSearch) ||
        contact.includes(normalizedSearch) ||
        (normalizedPhoneSearch.length > 0 &&
          normalizedPhone.includes(normalizedPhoneSearch))
      );
    });
  }, [clientSearchValue, clientsStore.clients]);

  const selectedVariantIds = useMemo(
    () => new Set(orderLines.map((line) => line.variantId)),
    [orderLines],
  );

  const orderProductsSubtotal = useMemo(
    () =>
      orderLines.reduce(
        (sum, line) =>
          sum + getCatalogVariantUnitPrice(line.variant) * line.quantity,
        0,
      ),
    [orderLines],
  );

  const orderProductsTotal = useMemo(
    () =>
      orderLines.reduce((sum, line) => {
        const lineTotal =
          getCatalogVariantUnitPrice(line.variant) * line.quantity;
        const discountedTotal =
          line.discountPercent > 0
            ? lineTotal * (1 - line.discountPercent / 100)
            : lineTotal;

        return sum + discountedTotal;
      }, 0),
    [orderLines],
  );

  const orderPositionDiscountTotal = Math.max(
    0,
    orderProductsSubtotal - orderProductsTotal,
  );
  const orderSummaryDeliveryAmount =
    withoutDelivery || orderLines.length === 0 ? 0 : SUMMARY_DELIVERY_AMOUNT;
  const orderDiscountBase = orderProductsTotal + orderSummaryDeliveryAmount;
  const orderDiscountAmount =
    orderDiscountPercent > 0
      ? orderDiscountBase * (orderDiscountPercent / 100)
      : 0;
  const orderSummaryTotal = Math.max(
    0,
    orderDiscountBase - orderDiscountAmount,
  );
  const hasNewClientDraft =
    typeof newClientFirstName === "string" &&
    newClientFirstName.trim().length > 0 &&
    typeof newClientLastName === "string" &&
    newClientLastName.trim().length > 0 &&
    typeof newClientPhone === "string" &&
    newClientPhone.trim().length > 0;
  const hasClientSelection =
    clientMode === "new" ? hasNewClientDraft : selectedClient != null;
  const hasDeliveryTarget =
    withoutDelivery ||
    (Boolean(selectedCityRef) &&
      (isAddressDelivery
        ? Boolean(selectedStreetRef)
        : Boolean(selectedWarehouseRef)));
  const canCreateOrder =
    hasClientSelection && orderLines.length > 0 && hasDeliveryTarget;

  const cachedPrefillClient =
    prefillClientId == null
      ? null
      : (clientsStore.clients.find((client) => client.id === prefillClientId) ??
        null);

  // Apply URL prefill from the in-memory clients list during render.
  // Async fetch (when the client is not cached) stays in an effect below.
  if (
    prefillClientId != null &&
    cachedPrefillClient != null &&
    selectedClient?.id !== prefillClientId
  ) {
    setClientMode("existing");
    setSelectedClient(cachedPrefillClient);
    setClientSearchValue("");
  }

  useEffect(() => {
    deliveryForm.setFieldsValue({
      deliveryMethod: "nova_poshta",
      deliveryType: "warehouse",
      withoutDelivery: false,
      isCashOnDelivery: true,
    });
  }, [deliveryForm]);

  useEffect(() => {
    if (prefillClientId == null) {
      return;
    }

    if (selectedClient?.id === prefillClientId) {
      return;
    }

    if (cachedPrefillClient != null) {
      return;
    }

    let cancelled = false;

    const loadPrefillClient = async () => {
      try {
        const client = await clientsApi.getById(prefillClientId);

        if (cancelled) {
          return;
        }

        setClientMode("existing");
        setSelectedClient(client);
        setClientSearchValue("");
      } catch {
        if (!cancelled) {
          clearPrefillClientId();
        }
      }
    };

    void loadPrefillClient();

    return () => {
      cancelled = true;
    };
  }, [
    cachedPrefillClient,
    clearPrefillClientId,
    prefillClientId,
    selectedClient?.id,
  ]);

  useEffect(() => {
    if (!withoutDelivery) {
      return;
    }

    lastAutoCashOnDeliveryAmountRef.current = null;
    deliveryForm.setFieldsValue({
      isCashOnDelivery: false,
      cashOnDeliveryAmount: undefined,
    });
  }, [deliveryForm, withoutDelivery]);

  useEffect(() => {
    if (withoutDelivery || isCashOnDelivery === false) {
      return;
    }

    const nextAmount = Math.round(orderProductsTotal);
    const currentAmount =
      typeof cashOnDeliveryAmount === "number"
        ? cashOnDeliveryAmount
        : Number(cashOnDeliveryAmount);
    const shouldUpdate =
      cashOnDeliveryAmount == null ||
      Number.isNaN(currentAmount) ||
      currentAmount === lastAutoCashOnDeliveryAmountRef.current;

    if (!shouldUpdate) {
      return;
    }

    lastAutoCashOnDeliveryAmountRef.current = nextAmount;
    deliveryForm.setFieldValue("cashOnDeliveryAmount", nextAmount);
  }, [
    cashOnDeliveryAmount,
    deliveryForm,
    isCashOnDelivery,
    orderProductsTotal,
    withoutDelivery,
  ]);

  const handleClientModeChange = useCallback(
    (nextMode: ClientMode) => {
      setClientMode(nextMode);
      setClientSearchValue("");
      setSelectedClient(null);
      clientForm.resetFields();
      clearPrefillClientId();
    },
    [clearPrefillClientId, clientForm],
  );

  const handleExistingClientSearchFocus = useCallback(() => {
    if (clientsRequested) {
      return;
    }

    setClientsRequested(true);
    void clientsStore
      .loadClients({ page: 1, pageSize: 50, include_order_stat: true })
      .catch(() => {
        setClientsRequested(false);
      });
  }, [clientsRequested, clientsStore]);

  const handleClientSelect = useCallback(
    (client: Client) => {
      setSelectedClient(client);
      setClientSearchValue("");
      clearPrefillClientId();
    },
    [clearPrefillClientId],
  );

  const handleClientClear = useCallback(() => {
    setSelectedClient(null);
    setClientSearchValue("");
    clearPrefillClientId();
  }, [clearPrefillClientId]);

  const handleProductSearchClose = useCallback(() => {
    setProductSearchOpen(false);
    catalogSearch.reset();
  }, [catalogSearch]);

  const handleProductSearchOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        setProductSearchOpen(true);
        return;
      }

      handleProductSearchClose();
    },
    [handleProductSearchClose],
  );

  const handleVariantSelect = useCallback(
    (variant: CatalogVariant) => {
      if (!variant.inStock || selectedVariantIds.has(variant.id)) {
        return;
      }

      setOrderLines((current) => [
        ...current,
        {
          variantId: variant.id,
          quantity: 1,
          variant,
          discountOpen: false,
          discountPercent: 0,
        },
      ]);
    },
    [selectedVariantIds],
  );

  const handleQuantityChange = useCallback(
    (variantId: number, quantity: number) => {
      setOrderLines((current) =>
        current.map((line) =>
          line.variantId === variantId
            ? { ...line, quantity: Math.max(1, quantity) }
            : line,
        ),
      );
    },
    [],
  );

  const handleRemoveLine = useCallback((variantId: number) => {
    setOrderLines((current) =>
      current.filter((line) => line.variantId !== variantId),
    );
  }, []);

  const handleToggleDiscount = useCallback((variantId: number) => {
    setOrderLines((current) =>
      current.map((line) =>
        line.variantId === variantId
          ? { ...line, discountOpen: !line.discountOpen }
          : line,
      ),
    );
  }, []);

  const handleDiscountChange = useCallback(
    (variantId: number, value: number | null) => {
      const nextValue = Math.max(0, Math.min(99, Number(value) || 0));

      setOrderLines((current) =>
        current.map((line) =>
          line.variantId === variantId
            ? { ...line, discountPercent: nextValue }
            : line,
        ),
      );
    },
    [],
  );

  const handleOrderDiscountChange = useCallback((value: number | null) => {
    setOrderDiscountPercent(Math.max(0, Math.min(99, Number(value) || 0)));
  }, []);

  const handleCreateOrder = useCallback(async () => {
    if (!canCreateOrder || ordersStore.createLoading) {
      return;
    }

    let newClient:
      | {
          firstName: string;
          lastName: string;
          phone: string;
        }
      | undefined;

    if (clientMode === "new") {
      try {
        const clientValues = await clientForm.validateFields();
        newClient = {
          firstName: clientValues.clientFirstName?.trim() ?? "",
          lastName: clientValues.clientLastName?.trim() ?? "",
          phone: clientValues.clientPhone?.trim() ?? "",
        };
      } catch {
        return;
      }
    } else if (!selectedClient) {
      return;
    }

    let formValues: OrderFormValues;
    try {
      formValues = await deliveryForm.validateFields();
    } catch {
      return;
    }

    try {
      const created = await ordersStore.createStandaloneOrder({
        clientMode,
        existingClient: selectedClient,
        newClient,
        orderLines,
        formValues: {
          ...formValues,
          discountPercent: orderDiscountPercent,
        },
        source: orderSource,
        orderDiscountPercent,
      });

      notification.success({
        title: t("orders.create.summary.createSuccess"),
      });
      navigate(getOrderDetailsPath(created.id));
    } catch (error) {
      notification.error({
        title: getApiErrorMessage(
          error,
          t("orders.create.summary.createFailed"),
        ),
      });
    }
  }, [
    canCreateOrder,
    clientForm,
    clientMode,
    deliveryForm,
    navigate,
    notification,
    orderDiscountPercent,
    orderLines,
    orderSource,
    ordersStore,
    selectedClient,
    t,
  ]);

  const handleWithoutDeliveryChange = useCallback(
    (checked: boolean) => {
      deliveryForm.setFieldValue("withoutDelivery", checked);

      if (checked) {
        lastAutoCashOnDeliveryAmountRef.current = null;
        deliveryForm.setFieldsValue({
          isCashOnDelivery: false,
          cashOnDeliveryAmount: undefined,
        });
        novaPoshtaDelivery.clearSelects();
      }
    },
    [deliveryForm, novaPoshtaDelivery],
  );

  const handlePaymentMethodChange = useCallback(
    (value: PaymentMethodValue) => {
      const nextIsCashOnDelivery = value === "cash_on_delivery";

      if (nextIsCashOnDelivery && withoutDelivery) {
        return;
      }

      deliveryForm.setFieldValue("isCashOnDelivery", nextIsCashOnDelivery);

      if (nextIsCashOnDelivery) {
        const nextAmount = Math.round(orderProductsTotal);
        lastAutoCashOnDeliveryAmountRef.current = nextAmount;
        deliveryForm.setFieldValue("cashOnDeliveryAmount", nextAmount);
      } else {
        lastAutoCashOnDeliveryAmountRef.current = null;
        deliveryForm.setFieldValue("cashOnDeliveryAmount", undefined);
      }
    },
    [deliveryForm, orderProductsTotal, withoutDelivery],
  );

  return {
    canCreateOrder,
    catalogSearch,
    clientForm,
    clientMode,
    clientModeOptions,
    clientSearchValue,
    clientsListError: clientsStore.listError,
    clientsListLoading: clientsStore.listLoading,
    clientsRequested,
    createLoading: ordersStore.createLoading,
    deliveryForm: deliveryForm as FormInstance<OrderFormValues>,
    deliveryPhoneRules,
    deliveryTypeOptions,
    handleClientClear,
    handleClientModeChange,
    handleClientSelect,
    handleCreateOrder,
    handleDiscountChange,
    handleExistingClientSearchFocus,
    handleOrderDiscountChange,
    handlePaymentMethodChange,
    handleProductSearchClose,
    handleProductSearchOpenChange,
    handleQuantityChange,
    handleRemoveLine,
    handleToggleDiscount,
    handleVariantSelect,
    handleWithoutDeliveryChange,
    isAddressDelivery,
    novaPoshtaDelivery,
    orderDiscountPercent,
    orderLines,
    orderPositionDiscountTotal,
    orderProductsSubtotal,
    orderSource,
    orderSourceOptions,
    orderSummaryDeliveryAmount,
    orderSummaryTotal,
    paymentMethodOptions,
    paymentMethodValue,
    phoneRules,
    productSearchOpen,
    selectedClient,
    selectedVariantIds,
    setClientSearchValue,
    setOrderSource,
    visibleClients,
    withoutDelivery,
  };
}

export type OrdersNewPageController = ReturnType<typeof useOrdersNewPage>;
