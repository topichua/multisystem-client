import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Root = styled.div.attrs(() =>
  dataQaAttrs("layout-conversation-details-product-suggestions"),
)`
  border-bottom: 1px solid
    ${({ theme }) => theme.colors.functional.border.cardBase};
`;

export const Header = styled.div`
  padding: 8px 24px;

  &:hover {
    background: ${({ theme }) => theme.colors.functional.background.elevated};
    cursor: pointer;
  }
`;

export const Caret = styled.span<{ $open: boolean }>`
  display: inline-flex;
  margin-left: 4px;
  transform: rotate(${({ $open }) => ($open ? "180deg" : "0deg")});
  transition: transform 0.3s ease;
`;

export const Body = styled.div<{ $open: boolean }>`
  display: grid;
  grid-template-rows: ${({ $open }) => ($open ? "1fr" : "0fr")};
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  pointer-events: ${({ $open }) => ($open ? "auto" : "none")};

  transition:
    grid-template-rows 0.24s ease,
    opacity 0.18s ease;
`;

export const BodyContent = styled.div`
  min-height: 0;
  overflow: hidden;
`;

export const BodyInner = styled.div`
  padding: 8px 24px;
`;

export const ProductCollapse = styled.div`
  .ant-collapse {
    background: ${({ theme }) => theme.colors.functional.background.elevated};
    border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};

    &:has(.ant-collapse-item-active) {
      border-color: ${({ theme }) => theme.colors.functional.border.selected};
    }
  }

  .ant-collapse-body {
    border-top: 1px solid
      ${({ theme }) => theme.colors.functional.border.cardBase};
  }
`;

export const ProductMeta = styled.span`
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: 12px;
  line-height: 1.35;
`;

export const VariantRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;

  & + & {
    border-top: 1px solid ${({ theme }) => theme.colors.functional.border.split};
  }

  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr);
    align-items: stretch;
  }
`;

export const VariantCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

export const VariantActions = styled.div`
  display: flex;
  justify-content: flex-end;

  .ant-btn {
    min-width: 132px;
  }

  @media (max-width: 640px) {
    justify-content: stretch;

    .ant-btn {
      width: 100%;
    }
  }
`;
