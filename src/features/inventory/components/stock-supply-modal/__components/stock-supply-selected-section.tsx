import { Alert, Button, Checkbox, Empty, Flex, Input, Typography } from "antd";

import type { SupplyLine } from "../stock-supply-modal.types";
import * as S from "../stock-supply-modal.styled";
import { SupplySelectedLine } from "./supply-selected-line";

const { Text } = Typography;

type StockSupplySelectedSectionProps = {
  t: ReturnType<typeof import("react-i18next").useTranslation>["t"];
  selectedLines: SupplyLine[];
  name: string;
  comment: string;
  immediatelyApply: boolean;
  submitError: string | null;
  onNameChange: (value: string) => void;
  onCommentChange: (value: string) => void;
  onImmediatelyApplyChange: (value: boolean) => void;
  onClear: () => void;
  onUpdateLine: (
    variantId: number,
    patch: Partial<Omit<SupplyLine, "variant">>,
  ) => void;
  onRemoveLine: (variantId: number) => void;
};

export const StockSupplySelectedSection = ({
  t,
  selectedLines,
  name,
  comment,
  immediatelyApply,
  submitError,
  onNameChange,
  onCommentChange,
  onImmediatelyApplyChange,
  onClear,
  onUpdateLine,
  onRemoveLine,
}: StockSupplySelectedSectionProps) => (
  <S.SupplyColumn>
    <Flex align="center" justify="space-between" gap={12}>
      <Text strong>
        {t("products.stockSupply.inSupply")}{" "}
        <S.CountPill>{selectedLines.length}</S.CountPill>
      </Text>
      {selectedLines.length > 0 && (
        <Button type="link" size="small" onClick={onClear}>
          {t("products.stockSupply.clear")}
        </Button>
      )}
    </Flex>

    <S.SelectedHeader>
      <span>{t("products.stockSupply.variantColumn")}</span>
      <span>{t("products.stockSupply.availableColumn")}</span>
      <span>{t("products.stockSupply.quantityColumn")}</span>
      <span>{t("products.stockSupply.buyPriceColumn")}</span>
      <span />
    </S.SelectedHeader>

    <S.SelectedLinesList>
      {selectedLines.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("products.stockSupply.emptySelected")}
        />
      ) : (
        selectedLines.map((line) => (
          <SupplySelectedLine
            key={line.variant.id}
            line={line}
            onUpdate={onUpdateLine}
            onRemove={onRemoveLine}
          />
        ))
      )}
    </S.SelectedLinesList>

    <Flex vertical gap={8}>
      <Text>{t("products.stockSupply.nameLabel")}</Text>
      <Input
        value={name}
        placeholder={t("products.stockSupply.namePlaceholder")}
        onChange={(event) => onNameChange(event.target.value)}
      />
    </Flex>

    <Flex vertical gap={8}>
      <Text>{t("products.stockSupply.commentLabel")}</Text>
      <Input.TextArea
        value={comment}
        rows={3}
        placeholder={t("products.stockSupply.commentPlaceholder")}
        onChange={(event) => onCommentChange(event.target.value)}
      />
    </Flex>

    <Checkbox
      checked={immediatelyApply}
      onChange={(event) => onImmediatelyApplyChange(event.target.checked)}
    >
      {t("products.stockSupply.immediatelyApplyLabel")}
    </Checkbox>

    {submitError && <Alert type="error" title={submitError} showIcon />}
  </S.SupplyColumn>
);
