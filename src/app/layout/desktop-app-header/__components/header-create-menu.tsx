import {
  CaretDownIcon,
  CubeIcon,
  PlusIcon,
  TagIcon,
  TruckIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { Button, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { getClientsCreatePath, pagesMap } from "@/app/router/pages-map";
import { StockSupplyModal } from "@/features/inventory/components/stock-supply-modal/stock-supply-modal";

export const HeaderCreateMenu = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stockSupplyModalOpen, setStockSupplyModalOpen] = useState(false);

  const handleCreateMenuClick: NonNullable<MenuProps["onClick"]> = ({
    key,
  }) => {
    switch (key) {
      case "product":
        navigate(pagesMap.productsListAdd);
        break;

      case "order":
        navigate(pagesMap.ordersNew);
        break;

      case "client":
        navigate(getClientsCreatePath());
        break;

      case "supply":
        setStockSupplyModalOpen(true);
        break;
    }
  };

  const createMenuItems: MenuProps["items"] = [
    {
      key: "product",
      label: t("appHeader.createProduct"),
      icon: <CubeIcon size={16} />,
    },
    {
      key: "order",
      label: t("appHeader.createOrder"),
      icon: <TagIcon size={16} />,
    },
    {
      key: "client",
      label: t("appHeader.createClient"),
      icon: <UsersThreeIcon size={16} />,
    },
    {
      key: "supply",
      label: t("appHeader.createSupply"),
      icon: <TruckIcon size={16} />,
    },
  ];

  return (
    <>
      <Dropdown
        trigger={["click"]}
        menu={{
          items: createMenuItems,
          onClick: handleCreateMenuClick,
        }}
      >
        <Button
          icon={<PlusIcon size={16} />}
          data-qa="layout-desktop-create-button"
        >
          {t("appHeader.create")}
          <CaretDownIcon size={12} />
        </Button>
      </Dropdown>

      <StockSupplyModal
        open={stockSupplyModalOpen}
        onClose={() => setStockSupplyModalOpen(false)}
      />
    </>
  );
};
