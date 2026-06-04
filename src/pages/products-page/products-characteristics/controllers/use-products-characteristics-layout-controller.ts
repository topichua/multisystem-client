import { Form, message } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { matchPath, useLocation, useNavigate } from "react-router";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { getProductCharacteristicPath, pagesMap } from "@/app/router/pages-map";
import type { CharacteristicFieldType } from "@/features/characteristics/model/characteristic.types";
import { useCharacteristicsStore } from "@/features/characteristics/model/use-characteristics-store";

import {
  buildUniqueCharacteristicKey,
  getNextCharacteristicSortOrder,
  sortCharacteristicsByOrder,
} from "../products-characteristics.utils";

export type CharacteristicCreateFormValues = {
  label: string;
  type: CharacteristicFieldType;
};

export const defaultCreateValues: CharacteristicCreateFormValues = {
  label: "",
  type: "options",
};

export const useProductsCharacteristicsLayoutController = () => {
  const { t } = useTranslation();
  const store = useCharacteristicsStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<CharacteristicCreateFormValues>();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    void store.loadCharacteristics();
  }, [store]);

  const activeCharacteristicId = useMemo(() => {
    const match = matchPath(
      {
        path: `${pagesMap.productsCharacteristics}/:characteristicId`,
        end: true,
      },
      location.pathname,
    );
    const parsedId = match?.params.characteristicId
      ? Number(match.params.characteristicId)
      : NaN;

    return Number.isFinite(parsedId) ? parsedId : null;
  }, [location.pathname]);

  const sortedCharacteristics = useMemo(
    () => sortCharacteristicsByOrder(store.items),
    [store.items],
  );

  const visibleCharacteristics = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return sortedCharacteristics;
    }

    return sortedCharacteristics.filter((characteristic) =>
      `${characteristic.label} ${characteristic.key}`
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [searchValue, sortedCharacteristics]);

  const openCreate = useCallback(() => {
    form.setFieldsValue(defaultCreateValues);
    setCreateModalOpen(true);
  }, [form]);

  const closeCreate = useCallback(() => {
    setCreateModalOpen(false);
    form.resetFields();
  }, [form]);

  const handleCreate = useCallback(async () => {
    let values: CharacteristicCreateFormValues;

    try {
      values = await form.validateFields();
    } catch {
      return Promise.reject();
    }

    const label = values.label.trim();

    try {
      const createdCharacteristic = await store.createCharacteristic({
        key: buildUniqueCharacteristicKey(label, store.items),
        label,
        type: values.type,
        options: values.type === "options" ? [] : undefined,
        sortOrder: getNextCharacteristicSortOrder(store.items),
      });

      messageApi.success(t("characteristics.createSuccess"));
      closeCreate();
      navigate(getProductCharacteristicPath(createdCharacteristic.id));
    } catch (error) {
      messageApi.error(
        getApiErrorMessage(error, t("characteristics.createFailed")),
      );
      return Promise.reject();
    }
  }, [closeCreate, form, messageApi, navigate, store, t]);

  const navigateToCharacteristic = useCallback(
    (characteristicId: number) => {
      navigate(getProductCharacteristicPath(characteristicId));
    },
    [navigate],
  );

  return {
    contextHolder,
    store,
    form,
    createModalOpen,
    searchValue,
    activeCharacteristicId,
    visibleCharacteristics,
    openCreate,
    closeCreate,
    setSearchValue,
    handleCreate,
    navigateToCharacteristic,
  };
};
