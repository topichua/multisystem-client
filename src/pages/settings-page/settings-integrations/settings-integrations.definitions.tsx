import { InstagramLogoIcon } from "@/components/icons/instagram/instagram-logo-icon";
import { TelegramLogoIcon } from "@/components/icons/telegram/telegram-logo-icon";
import { NovaPostIcon } from "@/components/icons/nova-post/nova-post-icon";
import type { IntegrationItem } from "@/features/integrations/model/integration.types";

export const INTEGRATION_TYPES = [
  {
    type: "instagram",
    labelKey: "integrations.types.instagram.label",
    descriptionKey: "integrations.types.instagram.description",
    connectLabelKey: "integrations.types.instagram.connectLabel",
    emptyKey: "integrations.types.instagram.empty",
    icon: <InstagramLogoIcon size={40} />,
  },
  {
    type: "telegram",
    labelKey: "integrations.types.telegram.label",
    descriptionKey: "integrations.types.telegram.description",
    connectLabelKey: "integrations.types.telegram.connectLabel",
    emptyKey: "integrations.types.telegram.empty",
    icon: <TelegramLogoIcon size={40} />,
  },
  {
    type: "novaposhta",
    labelKey: "integrations.types.novaposhta.label",
    descriptionKey: "integrations.types.novaposhta.description",
    connectLabelKey: "integrations.types.novaposhta.connectLabel",
    emptyKey: "integrations.types.novaposhta.empty",
    icon: <NovaPostIcon size={40} />,
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
});

export const isKnownIntegrationType = (
  type: IntegrationItem["type"],
): type is IntegrationType =>
  type === "instagram" || type === "telegram" || type === "novaposhta";
