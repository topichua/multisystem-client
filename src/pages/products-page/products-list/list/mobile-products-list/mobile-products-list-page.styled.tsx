import { Button, Card, Flex, Typography } from "antd";
import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Root = styled.div.attrs(() =>
  dataQaAttrs("products-mobile-list-page"),
)`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.functional.background.base};
`;

export const Header = styled.header`
  box-sizing: border-box;
  flex: 0 0 auto;
  min-width: 0;
  padding: 16px 16px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const ScrollRegion = styled.div`
  box-sizing: border-box;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding: 0 16px calc(32px + env(safe-area-inset-bottom, 0px));
`;

export const TitleCluster = styled.div`
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  align-items: center;
  gap: 4px;
`;

export const BackButton = styled(Button)`
  && {
    flex: 0 0 auto;
    width: 44px;
    height: 44px;
    padding: 0;
    margin-inline-start: -8px;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
  }

  &&:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.functional.border.selected};
    outline-offset: 2px;
  }
`;

export const PageTitle = styled(Typography.Title)`
  && {
    min-width: 0;
    margin: 0;
    flex: 1 1 auto;
    color: ${({ theme }) => theme.colors.functional.text.heading};
    font-size: ${({ theme }) => theme.fontSize.ultraLarge};
    line-height: 1.25;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const CreateButton = styled(Button)`
  && {
    flex: 0 0 auto;
  }
`;

export const CreateButtonLabel = styled.span`
  @media (max-width: 359px) {
    display: none;
  }
`;

export const ProductList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  margin-top: 4px;
`;

export const ProductCard = styled(Card)`
  && {
    overflow: hidden;
    border-color: ${({ theme }) => theme.colors.functional.border.cardBase};
    border-radius: ${({ theme }) => theme.radius.large};
    background: ${({ theme }) => theme.colors.functional.background.elevated};
    box-shadow: ${({ theme }) => theme.shadow.cardShadow};
    cursor: pointer;
  }

  && .ant-card-body {
    padding: 12px;
  }

  @media (hover: hover) and (pointer: fine) {
    &&:hover {
      border-color: ${({ theme }) => theme.colors.functional.border.selected};
    }
  }

  &&:active {
    background: ${({ theme }) => theme.colors.functional.background.active};
  }
`;

export const CardTopRow = styled(Flex)`
  && {
    width: 100%;
    min-width: 0;
    align-items: flex-start;
    gap: 10px;
  }
`;

export const ProductInfo = styled.div`
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  align-items: flex-start;
  gap: 10px;
`;

export const Thumbnail = styled.div<{ $src?: string | null }>`
  flex: 0 0 auto;
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radius.medium};
  background-color: ${({ theme }) => theme.colors.functional.background.active};
  background-image: ${({ $src }) => ($src ? `url(${$src})` : "none")};
  background-size: cover;
  background-position: center;
`;

export const ProductCopy = styled.div`
  min-width: 0;
  flex: 1 1 auto;
`;

export const ProductName = styled(Typography.Text)`
  && {
    display: block;
    color: ${({ theme }) => theme.colors.functional.text.heading};
    font-size: ${({ theme }) => theme.fontSize.medium};
    font-weight: 600;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const ProductMeta = styled(Typography.Text)`
  && {
    display: block;
    margin-top: 2px;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
    font-size: ${({ theme }) => theme.fontSize.small};
    line-height: 1.35;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const CardBottomRow = styled(Flex)`
  && {
    width: 100%;
    min-width: 0;
    margin-top: 10px;
    align-items: center;
    gap: 8px;
  }
`;

export const PriceQuantity = styled(Typography.Text)`
  && {
    min-width: 0;
    flex: 1 1 auto;
    color: ${({ theme }) => theme.colors.functional.text.heading};
    font-size: ${({ theme }) => theme.fontSize.small};
    line-height: 1.35;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const StatusWrap = styled.div`
  flex: 0 0 auto;
`;

export const ExpandButton = styled(Button)`
  && {
    flex: 0 0 auto;
  }
`;

export const VariantsSection = styled.div`
  min-width: 0;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.functional.border.split};
`;

export const VariantsSectionTitle = styled(Typography.Text)`
  && {
    display: block;
    margin-bottom: 8px;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
    font-size: ${({ theme }) => theme.fontSize.small};
    font-weight: 600;
    line-height: 1.25;
  }
`;

export const VariantRow = styled.div`
  min-width: 0;
  padding: 10px 0;

  &:not(:last-child) {
    border-bottom: 1px solid
      ${({ theme }) => theme.colors.functional.border.split};
  }
`;

export const VariantName = styled(Typography.Text)`
  && {
    display: block;
    margin-bottom: 4px;
    color: ${({ theme }) => theme.colors.functional.text.heading};
    font-size: ${({ theme }) => theme.fontSize.small};
    font-weight: 600;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }
`;

export const VariantDetails = styled(Typography.Text)`
  && {
    display: block;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
    font-size: ${({ theme }) => theme.fontSize.small};
    line-height: 1.4;
    overflow-wrap: anywhere;
  }
`;

export const ActionsWrap = styled.div`
  flex: 0 0 auto;
`;

export const StateContainer = styled.div`
  min-width: 0;
  margin-top: 16px;
  padding: 24px 0;
`;

export const PaginationWrap = styled.div`
  display: flex;
  justify-content: center;
  min-width: 0;
  margin-top: 16px;
  padding-top: 8px;
`;

export const ErrorText = styled(Typography.Text)`
  && {
    display: block;
    margin-bottom: 8px;
  }
`;
