import { Button } from "antd";
import styled, { css } from "styled-components";

type InstagramPostDetailVariant = "desktop" | "mobile";

export const Content = styled.div`
  width: 100%;
  height: 100%;
  min-height: 0;
  margin: 0 auto;
`;

export const Layout = styled.div<{
  $commentsOpen: boolean;
  $variant?: InstagramPostDetailVariant;
}>`
  display: grid;
  grid-template-columns: ${({ $commentsOpen }) =>
    $commentsOpen ? "minmax(0, 1fr) minmax(360px, 500px)" : "minmax(0, 1fr)"};
  grid-template-rows: auto minmax(0, 1fr);
  grid-template-areas: ${({ $commentsOpen }) =>
    $commentsOpen
      ? `"header-main header-comments" "main comments"`
      : `"header-main" "main"`};
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.functional.background.elevated};

  @media (max-width: 1180px) {
    grid-template-columns: minmax(0, 1060px);
    grid-template-areas: ${({ $commentsOpen }) =>
      $commentsOpen
        ? `"header-main" "main" "header-comments" "comments"`
        : `"header-main" "main"`};
    min-height: auto;
  }

  ${({ $variant, theme }) =>
    $variant === "mobile" &&
    css`
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
      background: ${theme.colors.functional.background.base};
    `}
`;

export const HeaderMain = styled.div`
  grid-area: header-main;
  min-width: 0;
  min-height: 56px;
  display: flex;
  align-items: center;
  padding: 10px 20px;
  border-bottom: 1px solid
    ${({ theme }) => theme.colors.functional.border.cardBase};
`;

export const HeaderComments = styled.div`
  grid-area: header-comments;
  min-width: 0;
  min-height: 56px;
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid
    ${({ theme }) => theme.colors.functional.border.cardBase};
  border-left: 1px solid
    ${({ theme }) => theme.colors.functional.border.cardBase};

  @media (max-width: 1180px) {
    border-left: 0;
  }
`;

export const Main = styled.div<{ $variant?: InstagramPostDetailVariant }>`
  grid-area: main;
  min-width: 0;
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
  padding: 24px;
  overflow: auto;
  background: ${({ theme }) => theme.colors.functional.background.base};

  ${({ $variant }) =>
    $variant === "mobile" &&
    css`
      flex: 1 1 auto;
      padding: 12px 16px calc(32px + env(safe-area-inset-bottom, 0px));
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
    `}
`;

export const WarningAlert = styled.div`
  margin-bottom: 16px;
`;

export const AccountTitle = styled.div`
  .ant-typography {
    margin: 0;
  }
`;

export const SummaryHeader = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 767px) {
    align-items: flex-start;
    gap: 10px;
  }
`;

export const SummaryAccount = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const SummaryAccountCopy = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const ExternalButton = styled(Button)`
  && {
    flex: 0 0 auto;
  }

  @media (max-width: 374px) {
    && {
      padding-inline: 8px;
    }
  }
`;

export const SummaryBody = styled.div`
  min-width: 0;
  display: flex;
  align-items: flex-start;
  gap: 24px;

  @media (max-width: 767px) {
    flex-direction: column;
    gap: 16px;
  }
`;

export const SummaryMediaColumn = styled.div`
  min-width: 0;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: 767px) {
    width: 100%;
  }
`;

export const SummaryMetaRow = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;

  @media (max-width: 767px) {
    gap: 12px;
  }
`;

export const MetricsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const MediaPreview = styled.div`
  position: relative;
  width: 300px;
  max-width: 100%;
  aspect-ratio: 1;
  height: auto;
  flex: 0 0 auto;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radius.semiLarge};
  background: ${({ theme }) => theme.colors.functional.background.natural};

  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .ant-carousel,
  .slick-slider,
  .slick-list,
  .slick-track,
  .slick-slide,
  .slick-slide > div {
    height: 100%;
  }

  .slick-dots {
    z-index: 2;
  }

  @media (max-width: 767px) {
    width: 100%;
    border-radius: ${({ theme }) => theme.radius.large};
  }
`;

export const Metric = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.functional.text.primary};
`;

export const MetricButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  padding: 0;
  border: 0;
  border-radius: ${({ theme }) => theme.radius.small};
  background: transparent;
  color: ${({ theme }) => theme.colors.functional.text.primary};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.semantic.primary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.functional.border.selected};
    outline-offset: 3px;
  }
`;

export const SectionTitle = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

export const CountBadge = styled.span`
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.functional.background.primary};
  color: ${({ theme }) => theme.colors.functional.text.primary};
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 700;
  line-height: 1;
`;

export const DescriptionBox = styled.div`
  /* min-height: 90px; */
  /* padding: 14px; */
  /* border: 1px solid ${({ theme }) =>
    theme.colors.functional.border.cardBase}; */
  /* border-radius: ${({ theme }) => theme.radius.large}; */
  /* background: ${({ theme }) =>
    theme.colors.functional.background.elevated}; */
  color: ${({ theme }) => theme.colors.functional.text.primary};

  .ant-typography {
    margin: 0;
  }
`;

export const ProductsBody = styled.div`
  min-height: 120px;
`;

export const CommentsPanel = styled.aside`
  grid-area: comments;
  min-width: 0;
  min-height: 0;
  box-sizing: border-box;
  overflow: auto;
  border-left: 1px solid
    ${({ theme }) => theme.colors.functional.border.cardBase};
  background: ${({ theme }) => theme.colors.functional.background.base};
  padding: 0 16px 36px 16px;

  @media (max-width: 1180px) {
    min-height: 420px;
    border-left: 0;
  }
`;

export const MobileCommentsDrawerBody = styled.div`
  min-width: 0;
  height: 100%;
  overflow: auto;
  background: ${({ theme }) => theme.colors.functional.background.base};
  -webkit-overflow-scrolling: touch;
`;
