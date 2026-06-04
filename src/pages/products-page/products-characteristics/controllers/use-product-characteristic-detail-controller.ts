import { message } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { getProductCharacteristicPath, pagesMap } from "@/app/router/pages-map";
import type {
  CharacteristicBase,
  CharacteristicOption,
  CharacteristicTopTextValue,
} from "@/features/characteristics/model/characteristic.types";
import { useCharacteristicsStore } from "@/features/characteristics/model/use-characteristics-store";

import {
  CHARACTERISTIC_NAME_MAX_LENGTH,
  CHARACTERISTIC_OPTION_VALUE_MAX_LENGTH,
} from "../products-characteristics.constants";
import {
  hasDuplicateCharacteristicOptionValue,
  resolveNextCharacteristicIdAfterDelete,
} from "../products-characteristics.utils";

export const useProductCharacteristicDetailController = () => {
  const { t } = useTranslation();
  const { characteristicId } = useParams<{ characteristicId: string }>();
  const navigate = useNavigate();
  const store = useCharacteristicsStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [optionValue, setOptionValue] = useState("");
  const [renamingOptionId, setRenamingOptionId] = useState<number | null>(null);
  const [renamingOptionValue, setRenamingOptionValue] = useState("");
  const [isRenamingCharacteristic, setIsRenamingCharacteristic] =
    useState(false);
  const [renamingCharacteristicLabel, setRenamingCharacteristicLabel] =
    useState("");

  const characteristicIdNumber = useMemo(() => {
    const parsedId = characteristicId != null ? Number(characteristicId) : NaN;

    return Number.isFinite(parsedId) ? parsedId : null;
  }, [characteristicId]);

  const characteristicFromList = useMemo(
    () =>
      characteristicIdNumber != null
        ? store.items.find((item) => item.id === characteristicIdNumber)
        : undefined,
    [characteristicIdNumber, store.items],
  );

  const detailCharacteristic = useMemo(
    () =>
      store.activeCharacteristic?.id === characteristicIdNumber
        ? store.activeCharacteristic
        : null,
    [characteristicIdNumber, store.activeCharacteristic],
  );

  const characteristic = useMemo<CharacteristicBase | undefined>(() => {
    const matchedCharacteristic =
      detailCharacteristic ?? characteristicFromList;

    return matchedCharacteristic;
  }, [characteristicFromList, detailCharacteristic]);

  useEffect(() => {
    if (store.items.length > 0 || store.listLoading) {
      return;
    }

    void store.loadCharacteristics();
  }, [store, store.items.length, store.listLoading]);

  useEffect(() => {
    if (characteristicIdNumber == null) {
      return;
    }

    void store.loadCharacteristicById(characteristicIdNumber);
  }, [characteristicIdNumber, store]);

  const options = useMemo<CharacteristicOption[]>(
    () =>
      detailCharacteristic?.type === "options"
        ? (detailCharacteristic.options ?? [])
        : [],
    [detailCharacteristic],
  );

  const topTextValues = useMemo<CharacteristicTopTextValue[]>(
    () =>
      detailCharacteristic?.type === "text"
        ? (detailCharacteristic.topTextValues ?? [])
        : [],
    [detailCharacteristic],
  );

  const totalProducts = detailCharacteristic?.totalProducts ?? 0;

  const validateCharacteristicLabel = useCallback(
    (label: string): boolean => {
      if (!label) {
        messageApi.error(t("characteristics.nameRequired"));
        return false;
      }

      if (label.length > CHARACTERISTIC_NAME_MAX_LENGTH) {
        messageApi.error(t("characteristics.nameTooLong"));
        return false;
      }

      return true;
    },
    [messageApi, t],
  );

  const validateOptionValue = useCallback(
    (value: string, excludeIndex?: number): boolean => {
      if (!value) {
        messageApi.error(t("characteristics.optionValueRequired"));
        return false;
      }

      if (value.length > CHARACTERISTIC_OPTION_VALUE_MAX_LENGTH) {
        messageApi.error(t("characteristics.optionValueTooLong"));
        return false;
      }

      if (
        hasDuplicateCharacteristicOptionValue(
          options.map((option) => option.label),
          value,
          excludeIndex,
        )
      ) {
        messageApi.error(t("characteristics.duplicateOptionValue"));
        return false;
      }

      return true;
    },
    [messageApi, options, t],
  );

  const cancelRenameCharacteristic = useCallback(() => {
    setIsRenamingCharacteristic(false);
    setRenamingCharacteristicLabel("");
  }, []);

  const closeAddOption = useCallback(() => {
    setIsAddingOption(false);
    setOptionValue("");
  }, []);

  const cancelRenameOption = useCallback(() => {
    setRenamingOptionId(null);
    setRenamingOptionValue("");
  }, []);

  const openAddOption = useCallback(() => {
    cancelRenameCharacteristic();
    cancelRenameOption();
    setOptionValue("");
    setIsAddingOption(true);
  }, [cancelRenameCharacteristic, cancelRenameOption]);

  const openRenameOption = useCallback(
    (optionId: number, value: string) => {
      cancelRenameCharacteristic();
      closeAddOption();
      setRenamingOptionId(optionId);
      setRenamingOptionValue(value);
    },
    [cancelRenameCharacteristic, closeAddOption],
  );

  const openRenameCharacteristic = useCallback(() => {
    if (!characteristic) {
      return;
    }

    closeAddOption();
    cancelRenameOption();
    setIsRenamingCharacteristic(true);
    setRenamingCharacteristicLabel(characteristic.label);
  }, [cancelRenameOption, characteristic, closeAddOption]);

  const handleRenameCharacteristic = useCallback(async () => {
    if (!characteristic) {
      return;
    }

    const label = renamingCharacteristicLabel.trim();

    if (!validateCharacteristicLabel(label)) {
      return;
    }

    if (characteristic.label === label) {
      cancelRenameCharacteristic();
      return;
    }

    try {
      await store.updateCharacteristic(characteristic.id, { label });
      messageApi.success(t("characteristics.updated"));
      cancelRenameCharacteristic();
    } catch (error) {
      messageApi.error(
        getApiErrorMessage(error, t("characteristics.updateFailed")),
      );
    }
  }, [
    cancelRenameCharacteristic,
    characteristic,
    messageApi,
    renamingCharacteristicLabel,
    store,
    t,
    validateCharacteristicLabel,
  ]);

  const handleCreateOption = useCallback(async () => {
    if (!characteristic || characteristic.type !== "options") {
      return;
    }

    const value = optionValue.trim();

    if (!validateOptionValue(value)) {
      return;
    }

    try {
      await store.createCharacteristicOption(characteristic.id, {
        label: value,
      });
      messageApi.success(t("characteristics.valueAdded"));
      closeAddOption();
    } catch (error) {
      messageApi.error(
        getApiErrorMessage(error, t("characteristics.updateFailed")),
      );
    }
  }, [
    characteristic,
    closeAddOption,
    messageApi,
    optionValue,
    store,
    t,
    validateOptionValue,
  ]);

  const handleRenameOption = useCallback(
    async (optionId: number) => {
      if (!characteristic || characteristic.type !== "options") {
        return;
      }

      const value = renamingOptionValue.trim();
      const optionIndex = options.findIndex(
        (option) => option.optionId === optionId,
      );
      const currentValue = options[optionIndex]?.label;

      if (optionIndex === -1) {
        cancelRenameOption();
        return;
      }

      if (!validateOptionValue(value, optionIndex)) {
        return;
      }

      if (currentValue === value) {
        cancelRenameOption();
        return;
      }

      try {
        await store.updateCharacteristicOption(characteristic.id, optionId, {
          label: value,
        });
        messageApi.success(t("characteristics.valueUpdated"));
        cancelRenameOption();
      } catch (error) {
        messageApi.error(
          getApiErrorMessage(error, t("characteristics.updateFailed")),
        );
      }
    },
    [
      cancelRenameOption,
      characteristic,
      messageApi,
      options,
      renamingOptionValue,
      store,
      t,
      validateOptionValue,
    ],
  );

  const handleDeleteOption = useCallback(
    async (optionId: number) => {
      if (!characteristic || characteristic.type !== "options") {
        return;
      }

      try {
        await store.deleteCharacteristicOption(characteristic.id, optionId);

        if (renamingOptionId === optionId) {
          cancelRenameOption();
        }

        messageApi.success(t("characteristics.valueDeleted"));
      } catch (error) {
        messageApi.error(
          getApiErrorMessage(error, t("characteristics.updateFailed")),
        );
      }
    },
    [
      cancelRenameOption,
      characteristic,
      messageApi,
      renamingOptionId,
      store,
      t,
    ],
  );

  const handleDeleteCharacteristic = useCallback(async () => {
    if (!characteristic) {
      return;
    }

    const nextCharacteristicId = resolveNextCharacteristicIdAfterDelete(
      store.items,
      characteristic.id,
    );

    try {
      await store.deleteCharacteristic(characteristic.id);
      messageApi.success(t("characteristics.deleted"));

      if (nextCharacteristicId != null) {
        navigate(getProductCharacteristicPath(nextCharacteristicId));
        return;
      }

      navigate(pagesMap.productsCharacteristics);
    } catch (error) {
      messageApi.error(
        getApiErrorMessage(error, t("characteristics.deleteFailed")),
      );
    }
  }, [characteristic, messageApi, navigate, store, t]);

  const navigateToCharacteristics = useCallback(() => {
    navigate(pagesMap.productsCharacteristics);
  }, [navigate]);

  return {
    contextHolder,
    characteristic,
    options,
    topTextValues,
    totalProducts,
    isInvalidCharacteristicId: characteristicIdNumber == null,
    isPageLoading:
      (store.listLoading && !characteristic) ||
      (store.detailLoading && !detailCharacteristic),
    detailError: store.detailError,
    isDetailUnavailable: store.detailError != null && !detailCharacteristic,
    isNotFound: !store.listLoading && !store.detailLoading && !characteristic,
    saveLoading: store.saveLoading,
    deleteLoadingId: store.deleteLoadingId,
    optionDeleteLoadingId: store.optionDeleteLoadingId,
    navigateToCharacteristics,
    characteristicLabelEdit: {
      isEditing: isRenamingCharacteristic,
      value: renamingCharacteristicLabel,
      onChange: setRenamingCharacteristicLabel,
      onOpen: openRenameCharacteristic,
      onCancel: cancelRenameCharacteristic,
      onSave: handleRenameCharacteristic,
    },
    optionCreate: {
      isAdding: isAddingOption,
      value: optionValue,
      onChange: setOptionValue,
      onOpen: openAddOption,
      onCancel: closeAddOption,
      onCreate: handleCreateOption,
    },
    optionRename: {
      optionId: renamingOptionId,
      value: renamingOptionValue,
      onChange: setRenamingOptionValue,
      onOpen: openRenameOption,
      onCancel: cancelRenameOption,
      onSave: handleRenameOption,
    },
    onDeleteCharacteristic: handleDeleteCharacteristic,
    onDeleteOption: handleDeleteOption,
  };
};
