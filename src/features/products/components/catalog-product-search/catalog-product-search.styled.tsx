import styled from "styled-components";

export const PickerRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .ant-select-selector {
    min-height: 34px;
    border-radius: 8px !important;
  }
`;

export const PickerAddLabel = styled.div`
  font-size: 11px;
  line-height: 1.3;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;

export const ProductSearchToolbar = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;

  .ant-segmented {
    padding: 2px;
    border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
    border-radius: 8px;
    background: ${({ theme }) => theme.colors.functional.background.elevated};
  }

  .ant-segmented-item {
    min-width: 38px;
    border-radius: 6px;
  }

  .ant-segmented-item-label {
    min-height: 28px;
    padding: 0 8px;
  }
`;

export const CategoryOption = styled.span<{ $level: number }>`
  display: block;
  padding-left: ${({ $level }) => $level * 14}px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SearchModeIconLabel = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 28px;
`;

export const ProductSearchVariantOption = styled.div<{ $disabled?: boolean }>`
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) auto 28px;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 50px;
  min-width: 0;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  opacity: ${({ $disabled }) => ($disabled ? 0.58 : 1)};
`;

export const GroupedProductSearchPopup = styled.div`
  max-height: 320px;
  overflow-y: auto;
  padding: 8px 0 6px;
`;

export const GroupedProductSearchSummary = styled.div`
  padding: 0 14px 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;

export const GroupedProductSearchGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

export const GroupedProductHeaderButton = styled.button`
  display: grid;
  grid-template-columns: 16px 32px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 50px;
  padding: 7px 14px 7px 10px;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.functional.background.hover};
  }
`;

export const GroupedProductCaret = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.functional.text.placeholder};
`;

export const GroupedProductImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: cover;
  background: ${({ theme }) => theme.colors.functional.background.natural};
`;

export const GroupedProductImagePlaceholder = styled.span`
  width: 32px;
  height: 32px;
  border: 1px solid ${({ theme }) => theme.colors.functional.border.base};
  border-radius: 6px;
  background:
    repeating-linear-gradient(
      45deg,
      rgba(139, 147, 180, 0.12) 0,
      rgba(139, 147, 180, 0.12) 2px,
      rgba(139, 147, 180, 0.04) 2px,
      rgba(139, 147, 180, 0.04) 7px
    ),
    ${({ theme }) => theme.colors.functional.background.base};
`;

export const GroupedProductCopy = styled.div`
  min-width: 0;
`;

export const GroupedProductName = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.3;
  color: ${({ theme }) => theme.colors.functional.text.heading};
`;

export const GroupedProductMeta = styled.div`
  margin-top: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  line-height: 1.3;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;

export const GroupedVariantButton = styled.button<{
  $disabled: boolean;
  $selected: boolean;
}>`
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) auto 28px;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 50px;
  padding: 7px 12px 7px 42px;
  border: 0;
  background: ${({ $selected, theme }) =>
    $selected ? theme.colors.functional.background.base : "transparent"};
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  opacity: ${({ $disabled, $selected }) =>
    $disabled && !$selected ? 0.58 : $selected ? 0.82 : 1};

  &:hover {
    background: ${({ $disabled, $selected, theme }) =>
      $disabled && !$selected
        ? "transparent"
        : $selected
          ? theme.colors.functional.background.base
          : theme.colors.functional.background.hover};
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

export const GroupedVariantImage = styled(GroupedProductImage)``;

export const GroupedVariantImagePlaceholder = styled(
  GroupedProductImagePlaceholder,
)``;

export const GroupedVariantCopy = styled.div`
  min-width: 0;
`;

export const GroupedVariantNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

export const GroupedVariantName = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.3;
  color: ${({ theme }) => theme.colors.functional.text.heading};
  min-width: 0;
`;

export const GroupedVariantMeta = styled.div`
  margin-top: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  line-height: 1.3;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;

export const GroupedVariantInventory = styled.div`
  min-width: 68px;
  text-align: right;
`;

export const GroupedVariantPrice = styled.div`
  font-size: 13px;
  font-weight: 700;
  line-height: 1.25;
  color: ${({ theme }) => theme.colors.functional.text.heading};
`;

export const GroupedVariantStock = styled.div<{
  $available: boolean;
  $muted?: boolean;
}>`
  margin-top: 3px;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.2;
  color: ${({ $available, $muted, theme }) =>
    $muted
      ? theme.colors.functional.text.subdued
      : $available
        ? theme.colors.functional.text.success
        : theme.colors.functional.text.subdued};
`;

export const GroupedVariantAction = styled.span<{
  $empty: boolean;
  $selected: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 7px;
  background: ${({ $empty, $selected, theme }) =>
    $empty || $selected
      ? "transparent"
      : theme.colors.functional.background.primary};
  color: ${({ $selected, theme }) =>
    $selected
      ? theme.colors.functional.text.success
      : theme.colors.semantic.primary};
`;

export const PopoverContent = styled.div<{ $width?: number }>`
  width: ${({ $width }) => ($width == null ? "100%" : `${$width}px`)};
`;
