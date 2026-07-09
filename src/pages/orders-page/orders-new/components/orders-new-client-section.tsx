import { UserIcon } from "@phosphor-icons/react";
import { Form, Segmented } from "antd";
import type { Rule } from "antd/es/form";
import { useTranslation } from "react-i18next";

import type { Client } from "@/features/clients/model/client.types";

import * as S from "../orders-new-page.styled";
import type { ClientMode, NewClientFormValues } from "../orders-new.types";
import { SectionHeading } from "./section-heading";
import { ExistingClientBlock } from "./orders-new-client-section/existing-client-block";
import { NewClientFields } from "./orders-new-client-section/new-client-fields";

export type OrdersNewClientSectionProps = {
  clientForm: ReturnType<typeof Form.useForm<NewClientFormValues>>[0];
  clientMode: ClientMode;
  clientModeOptions: Array<{ label: string; value: ClientMode }>;
  clientSearchValue: string;
  clientsListError: string | null;
  clientsListLoading: boolean;
  clientsRequested: boolean;
  onClientClear: () => void;
  onClientModeChange: (mode: ClientMode) => void;
  onClientSearchChange: (value: string) => void;
  onClientSelect: (client: Client) => void;
  onExistingClientSearchFocus: () => void;
  phoneRules: Rule[];
  selectedClient: Client | null;
  visibleClients: Client[];
};

export function OrdersNewClientSection({
  clientForm,
  clientMode,
  clientModeOptions,
  clientSearchValue,
  clientsListError,
  clientsListLoading,
  clientsRequested,
  onClientClear,
  onClientModeChange,
  onClientSearchChange,
  onClientSelect,
  onExistingClientSearchFocus,
  phoneRules,
  selectedClient,
  visibleClients,
}: OrdersNewClientSectionProps) {
  const { t } = useTranslation();

  return (
    <S.SectionCard>
      <S.CardHeader justify="space-between" align="center" gap={12}>
        <SectionHeading icon={<UserIcon size={18} />}>
          {t("orders.create.client.title")}
        </SectionHeading>

        <Segmented<ClientMode>
          value={clientMode}
          options={clientModeOptions}
          onChange={onClientModeChange}
        />
      </S.CardHeader>

      <Form form={clientForm} layout="vertical" requiredMark>
        {clientMode === "existing" ? (
          <ExistingClientBlock
            selectedClient={selectedClient}
            clientSearchValue={clientSearchValue}
            clientsListError={clientsListError}
            clientsListLoading={clientsListLoading}
            clientsRequested={clientsRequested}
            visibleClients={visibleClients}
            onClientClear={onClientClear}
            onClientSelect={onClientSelect}
            onClientSearchChange={onClientSearchChange}
            onExistingClientSearchFocus={onExistingClientSearchFocus}
          />
        ) : (
          <NewClientFields phoneRules={phoneRules} />
        )}
      </Form>
    </S.SectionCard>
  );
}
