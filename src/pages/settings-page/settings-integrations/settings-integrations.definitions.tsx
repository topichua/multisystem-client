import { CreditCardIcon } from "@phosphor-icons/react";

import { InstagramLogoIcon } from "@/components/icons/instagram/instagram-logo-icon";
import { TelegramLogoIcon } from "@/components/icons/telegram/telegram-logo-icon";
import { NovaPostIcon } from "@/components/icons/nova-post/nova-post-icon";
import type { IntegrationItem } from "@/features/integrations/model/integration.types";

export const INTEGRATION_TYPE_GROUPS = [
  {
    key: "channels",
    labelKey: "integrations.groups.channels",
  },
  {
    key: "delivery",
    labelKey: "integrations.groups.delivery",
  },
  {
    key: "payment",
    labelKey: "integrations.groups.payment",
  },
] as const;

export type IntegrationTypeGroupKey =
  (typeof INTEGRATION_TYPE_GROUPS)[number]["key"];

export const INTEGRATION_TYPES = [
  {
    type: "instagram",
    groupKey: "channels",
    labelKey: "integrations.types.instagram.label",
    descriptionKey: "integrations.types.instagram.description",
    connectLabelKey: "integrations.types.instagram.connectLabel",
    emptyKey: "integrations.types.instagram.empty",
    icon: <InstagramLogoIcon size={40} />,
    allowMultiple: true,
  },
  {
    type: "telegram",
    groupKey: "channels",
    labelKey: "integrations.types.telegram.label",
    descriptionKey: "integrations.types.telegram.description",
    connectLabelKey: "integrations.types.telegram.connectLabel",
    emptyKey: "integrations.types.telegram.empty",
    icon: <TelegramLogoIcon size={40} />,
    allowMultiple: true,
  },
  {
    type: "novaposhta",
    groupKey: "delivery",
    labelKey: "integrations.types.novaposhta.label",
    descriptionKey: "integrations.types.novaposhta.description",
    connectLabelKey: "integrations.types.novaposhta.connectLabel",
    emptyKey: "integrations.types.novaposhta.empty",
    icon: <NovaPostIcon size={40} />,
    allowMultiple: true,
  },
  {
    type: "monobank",
    groupKey: "payment",
    labelKey: "integrations.types.monobank.label",
    descriptionKey: "integrations.types.monobank.description",
    connectLabelKey: "integrations.types.monobank.connectLabel",
    emptyKey: "integrations.types.monobank.empty",
    icon: <CreditCardIcon size={40} weight="duotone" />,
    allowMultiple: false,
  },
  {
    type: "manualpayment",
    groupKey: "payment",
    labelKey: "integrations.types.manualpayment.label",
    descriptionKey: "integrations.types.manualpayment.description",
    connectLabelKey: "integrations.types.manualpayment.connectLabel",
    emptyKey: "integrations.types.manualpayment.empty",
    icon: <CreditCardIcon size={40} weight="duotone" />,
    allowMultiple: true,
  },
] as const;

export type IntegrationType = (typeof INTEGRATION_TYPES)[number]["type"];
export type IntegrationDefinition = (typeof INTEGRATION_TYPES)[number];
export type IntegrationFilter = "all" | IntegrationType;

export const createEmptyIntegrationsByType = (): Record<
  IntegrationType,
  IntegrationItem[]
> => ({
  instagram: [],
  telegram: [],
  novaposhta: [],
  monobank: [],
  manualpayment: [],
});

export const isKnownIntegrationType = (
  type: IntegrationItem["type"],
): type is IntegrationType =>
  type === "instagram" ||
  type === "telegram" ||
  type === "novaposhta" ||
  type === "monobank" ||
  type === "manualpayment";
