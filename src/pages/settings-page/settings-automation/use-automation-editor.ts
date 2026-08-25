import { useEffect, useState } from "react";
import { Form } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { getSettingsAutomationPath, pagesMap } from "@/app/router/pages-map";
import { useAutomationStore } from "@/features/automation/model/use-automation-store";
import { useNotification } from "@/shared/components/notification/use-notification";

import {
  buildAutomationRulePayload,
  createDefaultAutomationFormValues,
  mapRuleToFormValues,
  type AutomationRuleFormValues,
} from "./automation-rule-form.utils";

export const useAutomationEditor = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notification = useNotification();
  const store = useAutomationStore();
  const { ruleId } = useParams<{ ruleId?: string }>();
  const [form] = Form.useForm<AutomationRuleFormValues>();

  const isCreate = !ruleId;
  const parsedId = ruleId ? Number(ruleId) : NaN;
  const isInvalidId = !isCreate && !Number.isFinite(parsedId);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      setBootstrapped(false);
      form.resetFields();
      form.setFieldsValue(createDefaultAutomationFormValues());
      store.clearCurrentRule();

      try {
        await store.loadCriteria();

        if (isCreate) {
          if (!cancelled) {
            setBootstrapped(true);
          }
          return;
        }

        if (!Number.isFinite(parsedId)) {
          if (!cancelled) {
            setBootstrapped(true);
          }
          return;
        }

        const rule = await store.loadRule(parsedId);
        if (!cancelled && rule) {
          form.setFieldsValue(mapRuleToFormValues(rule));
        }
      } catch (error) {
        if (!cancelled) {
          notification.error({
            message: getApiErrorMessage(
              error,
              t(
                isCreate
                  ? "automation.loadCriteriaError"
                  : "automation.loadError",
              ),
            ),
          });
        }
      } finally {
        if (!cancelled) {
          setBootstrapped(true);
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [form, isCreate, notification, parsedId, store, t]);

  const handleSubmit = async (values: AutomationRuleFormValues) => {
    const payload = buildAutomationRulePayload(values);

    try {
      if (isCreate) {
        const created = await store.createRule(payload);
        notification.success({ message: t("automation.created") });
        navigate(getSettingsAutomationPath(created.id), { replace: true });
        return;
      }

      await store.updateRule(parsedId, payload);
      notification.success({ message: t("automation.updated") });
    } catch (error) {
      notification.error({
        message: getApiErrorMessage(
          error,
          t(isCreate ? "automation.createError" : "automation.updateError"),
        ),
      });
    }
  };

  const handleDelete = async () => {
    if (isCreate || !Number.isFinite(parsedId)) {
      return;
    }

    try {
      await store.deleteRule(parsedId);
      notification.success({ message: t("automation.deleted") });
      navigate(pagesMap.settingsAutomation);
    } catch (error) {
      notification.error({
        message: getApiErrorMessage(error, t("automation.deleteError")),
      });
    }
  };

  const navigateToList = () => navigate(pagesMap.settingsAutomation);

  const title = isCreate
    ? t("automation.newTitle")
    : (store.currentRule?.name ?? t("automation.editTitle"));

  const isLoading =
    !bootstrapped ||
    store.criteriaLoading ||
    (!isCreate && store.detailLoading);

  const isNotFound =
    !isCreate &&
    bootstrapped &&
    !store.detailLoading &&
    !store.currentRule &&
    !isInvalidId;

  return {
    form,
    isCreate,
    isInvalidId,
    isLoading,
    isNotFound,
    title,
    criteria: store.criteria,
    saveLoading: store.saveLoading,
    deleteLoading: store.deleteLoadingId === parsedId,
    handleSubmit,
    handleDelete,
    navigateToList,
    showFallback: isInvalidId || isLoading || isNotFound,
  };
};

export type AutomationEditor = ReturnType<typeof useAutomationEditor>;
