import { LockIcon, PlusIcon } from "@phosphor-icons/react";
import { Button, Flex } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { getOrdersNewPath } from "@/app/router/pages-map";

import {
  actionsStyle,
  actionsFullWidthStyle,
  actionButtonGrowStyle,
} from "./client-details-info.shared";

type ClientDetailsActionsProps = {
  clientId: number;
  canCreateOrder: boolean;
  canBlock: boolean;
  isBlockLoading: boolean;
  onBlock: () => void;
  fullWidth?: boolean;
};

export function ClientDetailsActions({
  clientId,
  canCreateOrder,
  canBlock,
  isBlockLoading,
  onBlock,
  fullWidth = false,
}: ClientDetailsActionsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const buttonStyle = fullWidth ? actionButtonGrowStyle : undefined;

  return (
    <Flex
      gap={8}
      wrap="wrap"
      style={fullWidth ? actionsFullWidthStyle : actionsStyle}
    >
      <Button
        type="primary"
        icon={<PlusIcon size={16} />}
        disabled={!canCreateOrder}
        style={buttonStyle}
        data-qa="clients-detail-create-order"
        onClick={() => {
          if (!canCreateOrder) {
            return;
          }

          navigate(getOrdersNewPath(clientId));
        }}
      >
        {t("clients.details.createOrder")}
      </Button>

      {canBlock && (
        <Button
          danger
          icon={<LockIcon size={16} />}
          loading={isBlockLoading}
          style={buttonStyle}
          data-qa="clients-detail-block"
          onClick={onBlock}
        >
          {t("clients.block")}
        </Button>
      )}
    </Flex>
  );
}
