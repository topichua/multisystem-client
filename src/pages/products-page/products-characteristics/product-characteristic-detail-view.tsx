import {
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Empty,
  Flex,
  Space,
  Typography,
} from "antd";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { PaneDetailLayout } from "@/components/layout/pane-detail-layout";
import { CenteredSpinner } from "@/components/loading/centered-spinner";
import type { CharacteristicTopTextValue } from "@/features/characteristics/model/characteristic.types";

import { CharacteristicDangerZone } from "./components/characteristic-danger-zone";
import { CharacteristicDetailHeader } from "./components/characteristic-detail-header";
import { CharacteristicOptionsSection } from "./components/characteristic-options-section";
import { useProductCharacteristicDetailController } from "./controllers/use-product-characteristic-detail-controller";

const { Title, Text } = Typography;

export const ProductCharacteristicDetailView = () => {
  const { characteristicId } = useParams<{ characteristicId: string }>();

  return (
    <ProductCharacteristicDetailContent key={characteristicId ?? "missing"} />
  );
};

type DetailMetricsProps = {
  productCount: number;
  productVariantCount: number;
};

const DetailMetrics = ({
  productCount,
  productVariantCount,
}: DetailMetricsProps) => {
  const { t } = useTranslation();

  return (
    <Space size={12} wrap>
      <Text type="secondary">
        {t("characteristics.productsCount", {
          count: productCount,
          defaultValue: "{{count}} products",
        })}
      </Text>
      <Text type="secondary">
        {t("characteristics.productVariantsCount", {
          count: productVariantCount,
          defaultValue: "{{count}} variants",
        })}
      </Text>
    </Space>
  );
};

type DetailSectionHeaderProps = {
  title: string;
  count: number;
  totalProducts: number;
};

const DetailSectionHeader = ({
  title,
  count,
  totalProducts,
}: DetailSectionHeaderProps) => {
  const { t } = useTranslation();

  return (
    <Flex justify="space-between" align="center" gap={16} wrap="wrap">
      <Space size={8} align="center">
        <Title level={5} style={{ margin: 0 }}>
          {title}
        </Title>
        <Badge
          count={count}
          color="rgba(0, 0, 0, 0.06)"
          style={{ color: "rgba(0, 0, 0, 0.65)" }}
          showZero
        />
      </Space>

      <Text type="secondary">
        {t("characteristics.totalProducts", {
          count: totalProducts,
          defaultValue: "{{count}} total products",
        })}
      </Text>
    </Flex>
  );
};

type TextDetailRendererProps = {
  rows: CharacteristicTopTextValue[];
  totalProducts: number;
};

export const CharacteristicTextValuesSection = ({
  rows,
  totalProducts,
}: TextDetailRendererProps) => {
  const { t } = useTranslation();

  return (
    <Card>
      <DetailSectionHeader
        title={t("characteristics.topTextValues", {
          defaultValue: "Top text values",
        })}
        count={rows.length}
        totalProducts={totalProducts}
      />

      {rows.length > 0 ? (
        <Flex vertical>
          {rows.map((row, index) => (
            <div key={`${row.value}-${index}`}>
              {index > 0 && <Divider style={{ margin: 0 }} />}
              <Flex
                align="center"
                justify="space-between"
                gap={16}
                style={{ padding: "14px 0" }}
              >
                <Text strong ellipsis={{ tooltip: row.value }}>
                  {row.value}
                </Text>

                <DetailMetrics
                  productCount={row.productCount}
                  productVariantCount={row.productVariantCount}
                />
              </Flex>
            </div>
          ))}
        </Flex>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("characteristics.noTextValues", {
            defaultValue: "No text values",
          })}
        />
      )}
    </Card>
  );
};

const ProductCharacteristicDetailContent = observer(() => {
  const { t } = useTranslation();
  const controller = useProductCharacteristicDetailController();

  if (controller.isInvalidCharacteristicId) {
    return (
      <Alert type="error" title={t("characteristics.invalidId")} showIcon />
    );
  }

  if (controller.isPageLoading) {
    return <CenteredSpinner />;
  }

  if (controller.isDetailUnavailable) {
    return (
      <Alert
        type="error"
        title={t("characteristics.detailLoadFailed")}
        description={controller.detailError}
        showIcon
        action={
          <Button size="small" onClick={controller.navigateToCharacteristics}>
            {t("characteristics.backToList")}
          </Button>
        }
      />
    );
  }

  if (controller.isNotFound) {
    return (
      <Alert
        type="warning"
        title={t("characteristics.notFoundTitle")}
        description={t("characteristics.notFoundDescription")}
        showIcon
        action={
          <Button size="small" onClick={controller.navigateToCharacteristics}>
            {t("characteristics.backToList")}
          </Button>
        }
      />
    );
  }

  if (!controller.characteristic) {
    return null;
  }

  return (
    <>
      <PaneDetailLayout.Root>
        <PaneDetailLayout.Header>
          <CharacteristicDetailHeader
            characteristic={controller.characteristic}
            totalProducts={controller.totalProducts}
            saveLoading={controller.saveLoading}
            labelEdit={controller.characteristicLabelEdit}
          />
        </PaneDetailLayout.Header>

        <PaneDetailLayout.Body>
          <Flex
            vertical
            gap={20}
            style={{ maxWidth: 780, margin: "20px auto" }}
          >
            {controller.characteristic.type === "options" ? (
              <CharacteristicOptionsSection
                options={controller.options}
                create={controller.optionCreate}
                rename={controller.optionRename}
                saveLoading={controller.saveLoading}
                optionDeleteLoadingId={controller.optionDeleteLoadingId}
                onDeleteOption={controller.onDeleteOption}
              />
            ) : (
              <CharacteristicTextValuesSection
                rows={controller.topTextValues}
                totalProducts={controller.totalProducts}
              />
            )}

            <CharacteristicDangerZone
              deleteLoading={
                controller.deleteLoadingId === controller.characteristic.id
              }
              onDelete={controller.onDeleteCharacteristic}
            />
          </Flex>
        </PaneDetailLayout.Body>
      </PaneDetailLayout.Root>
    </>
  );
});
