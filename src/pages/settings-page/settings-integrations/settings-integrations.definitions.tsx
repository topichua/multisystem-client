import { InstagramLogoIcon, TelegramLogoIcon } from "@phosphor-icons/react";

import type { IntegrationItem } from "@/features/integrations/model/integration.types";

export const INTEGRATION_TYPES = [
  {
    type: "instagram",
    labelKey: "integrations.types.instagram.label",
    descriptionKey: "integrations.types.instagram.description",
    connectLabelKey: "integrations.types.instagram.connectLabel",
    emptyKey: "integrations.types.instagram.empty",
    icon: <InstagramLogoIcon />,
  },
  {
    type: "telegram",
    labelKey: "integrations.types.telegram.label",
    descriptionKey: "integrations.types.telegram.description",
    connectLabelKey: "integrations.types.telegram.connectLabel",
    emptyKey: "integrations.types.telegram.empty",
    icon: <TelegramLogoIcon />,
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
});

export const isKnownIntegrationType = (
  type: IntegrationItem["type"],
): type is IntegrationType => type === "instagram" || type === "telegram";
