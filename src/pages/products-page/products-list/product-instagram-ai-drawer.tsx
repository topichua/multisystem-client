import { InstagramLogoIcon } from "@phosphor-icons/react";
import { Drawer, Flex } from "antd";
import { useTranslation } from "react-i18next";

import { InstagramAiPanelConnected } from "./instagram-ai-panel";

type ProductInstagramAiDrawerProps = {
  open: boolean;
  onClose: () => void;
  analyzeBusy: boolean;
  submitLoading: boolean;
  onAnalyzeAndFill: () => void | Promise<void>;
};

export const ProductInstagramAiDrawer = ({
  open,
  onClose,
  analyzeBusy,
  submitLoading,
  onAnalyzeAndFill,
}: ProductInstagramAiDrawerProps) => {
  const { t } = useTranslation();

  return (
    <Drawer
      title={
        <Flex align="center" gap={12}>
          <InstagramLogoIcon size={24} />
          {t("products.instagram.drawerTitle")}
        </Flex>
      }
      open={open}
      onClose={onClose}
      width={Math.min(
        960,
        typeof window !== "undefined" ? window.innerWidth - 24 : 960,
      )}
      destroyOnClose
      styles={{
        body: { padding: 16 },
      }}
    >
      <InstagramAiPanelConnected
        analyzeBusy={analyzeBusy}
        submitLoading={submitLoading}
        onAnalyzeAndFill={onAnalyzeAndFill}
      />
    </Drawer>
  );
};
