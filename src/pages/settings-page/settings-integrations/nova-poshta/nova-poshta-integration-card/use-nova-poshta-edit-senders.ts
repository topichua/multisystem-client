import type { FormInstance } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/api/get-api-error-message";
import { integrationsApi } from "@/features/integrations/api/integrations-api";
import type { NovaPoshtaIntegrationDetails } from "@/features/integrations/model/integration.types";

import { firstOption } from "../helpers";
import { sendersToOptions } from "../options";
import type { SenderOption } from "../types";
import {
  buildCurrentSenderOption,
  mergeCurrentOption,
} from "./nova-poshta-integration-card.helpers";
import type { NovaPoshtaIntegrationEditFormValues } from "./nova-poshta-integration-card.types";

type UseNovaPoshtaEditSendersParams = {
  details: NovaPoshtaIntegrationDetails | null;
  form: FormInstance<NovaPoshtaIntegrationEditFormValues>;
  isEditing: boolean;
};

export function useNovaPoshtaEditSenders({
  details,
  form,
  isEditing,
}: UseNovaPoshtaEditSendersParams) {
  const { t } = useTranslation();
  const [senderOptions, setSenderOptions] = useState<SenderOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditing || details?.id == null) {
      return;
    }

    const abortController = new AbortController();
    const integrationId = details.id;

    setLoading(true);
    setError(null);

    void integrationsApi
      .discoverNovaPoshtaSenders(
        { auth: { novaPoshtaIntegrationId: integrationId } },
        { signal: abortController.signal },
      )
      .then((senders) => {
        if (abortController.signal.aborted) {
          return;
        }

        setSenderOptions(
          mergeCurrentOption(
            buildCurrentSenderOption(details),
            sendersToOptions(senders),
          ),
        );
      })
      .catch((requestError) => {
        if (abortController.signal.aborted) {
          return;
        }

        setSenderOptions(
          mergeCurrentOption(buildCurrentSenderOption(details), []),
        );
        setError(
          getApiErrorMessage(
            requestError,
            t("integrations.novaPoshtaWizard.discoverFailed"),
          ),
        );
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [details, isEditing, t]);

  const handleSenderChange = useCallback(
    (_value: string, option?: SenderOption | SenderOption[]) => {
      const selectedOption = firstOption(option);

      if (!selectedOption) {
        return;
      }

      form.setFieldsValue({
        sender_contact_ref: selectedOption.senderContactRef,
        sender_ref: selectedOption.senderRef,
        sender_name: selectedOption.senderName,
        sender_phone: selectedOption.senderPhone,
      });
    },
    [form],
  );

  const clear = useCallback(() => {
    setSenderOptions([]);
    setError(null);
    setLoading(false);
  }, []);

  return {
    clear,
    error,
    loading,
    onSenderChange: handleSenderChange,
    senderOptions,
  };
}
