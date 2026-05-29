import { PlusIcon } from "@phosphor-icons/react";
import { Button, Flex } from "antd";
import { ProductPublicationSidebar } from "./product-publication-sidebar";

export type ProductSidePanelProps = {
  isSubmitting: boolean;
  isSubmitDisabled: boolean;
  submitLabel: string;
  requiredMessage: string;
  statusLabel: string;
};

export const ProductSidePanel = ({
  isSubmitting,
  isSubmitDisabled,
  submitLabel,
  requiredMessage,
  statusLabel,
}: ProductSidePanelProps) => (
  <Flex vertical gap={16} flex="0 0 360px">
    <ProductPublicationSidebar
      requiredMessage={requiredMessage}
      statusLabel={statusLabel}
    />

    <div style={{ padding: 16 }}>
      <Button
        type="primary"
        htmlType="submit"
        block
        loading={isSubmitting}
        disabled={isSubmitDisabled}
        icon={<PlusIcon size={18} />}
      >
        {submitLabel}
      </Button>
    </div>
  </Flex>
);
