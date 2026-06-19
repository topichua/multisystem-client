import { Card } from "antd";
import styled, { css } from "styled-components";

export const CenteredState = styled.div`
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const SidebarCenteredState = styled(CenteredState)`
  min-height: 160px;
`;

export const Content = styled.div`
  width: 100%;
  max-width: 1060px;
  margin: 0 auto;
  padding: 20px 12px 32px;
`;

export const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 22px;

  @media (max-width: 767px) {
    align-items: flex-start;
  }
`;

export const ProfileAvatar = styled.div`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  flex: 0 0 auto;
  border: 3px solid
    ${({ theme }) => theme.colors.functional.background.elevated};
  box-shadow: 0 0 0 1px
    ${({ theme }) => theme.colors.functional.border.cardBase};
  background:
    radial-gradient(circle at 30% 25%, #ffd96a 0 14%, transparent 28%),
    linear-gradient(135deg, #f35f51 0%, #df2a8b 45%, #7556e8 100%);
`;

export const ProfileMeta = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ProfileName = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.functional.text.heading};
  font-size: 24px;
  line-height: 1.2;
  font-weight: 700;
`;

export const ProfileDisplayName = styled.div`
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.base};
  line-height: 1.35;
`;

export const ProfileStats = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
  color: ${({ theme }) => theme.colors.functional.text.primary};
  font-size: ${({ theme }) => theme.fontSize.small};
  line-height: 1.35;

  strong {
    font-weight: 700;
  }
`;

export const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 24px;
`;

export const FilterPill = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  background: ${({ theme }) => theme.colors.functional.background.elevated};
  color: ${({ theme }) => theme.colors.functional.text.primary};
  font-size: ${({ theme }) => theme.fontSize.base};
  font-weight: 600;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadow.cardShadow};

  ${({ $active, theme }) =>
    $active &&
    css`
      color: ${theme.colors.semantic.primary};
      border-color: ${theme.colors.functional.border.selected};
      background: ${theme.colors.functional.background.primary};
    `}

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.functional.border.selected};
    outline-offset: 2px;
  }
`;

export const FilterCount = styled.span<{ $active?: boolean }>`
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ $active, theme }) =>
    $active
      ? theme.colors.functional.text.inverted
      : theme.colors.functional.text.subdued};
  background: ${({ $active, theme }) =>
    $active
      ? theme.colors.semantic.primary
      : theme.colors.functional.background.natural};
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 700;
`;

export const PostsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(220px, 1fr));
  gap: 18px;

  @media (max-width: 1180px) {
    grid-template-columns: repeat(2, minmax(220px, 1fr));
  }

  @media (max-width: 820px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const PostCard = styled(Card)`
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radius.semiLarge};
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  background: ${({ theme }) => theme.colors.functional.background.elevated};
  box-shadow: ${({ theme }) => theme.shadow.cardShadow};
  cursor: pointer;
  transition:
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    transform 0.16s ease;

  .ant-card-body {
    padding: 0;
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.functional.border.selected};
    box-shadow: ${({ theme }) => theme.shadow.large};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.functional.border.selected};
    outline-offset: 2px;
  }
`;

export const PostMedia = styled.div`
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.functional.background.natural};

  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.2s ease;
  }

  ${PostCard}:hover & {
    img {
      transform: scale(1.025);
    }
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
`;

export const PostMediaPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.colors.functional.text.placeholder};
`;

export const ProductBadge = styled.span`
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.functional.text.inverted};
  background: ${({ theme }) => theme.colors.semantic.success};
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 700;
  box-shadow: ${({ theme }) => theme.shadow.small};
`;

export const MediaTypeBadge = styled.span`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.functional.text.inverted};
  background: rgba(15, 17, 23, 0.76);
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 700;
`;

export const MediaCarouselButton = styled.button<{ $side: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${({ $side }) => $side}: 10px;
  z-index: 2;
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.functional.text.inverted};
  background: rgba(15, 17, 23, 0.68);
  box-shadow: ${({ theme }) => theme.shadow.small};
  transform: translateY(-50%);
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.2s ease;

  &:hover {
    background: rgba(15, 17, 23, 0.84);
    transform: translateY(-50%) scale(1.04);
  }
`;

export const PostBody = styled.div`
  padding: 14px 14px 12px;
`;

export const PostCaption = styled.p`
  min-height: 44px;
  margin: 0 0 12px;
  color: ${({ theme }) => theme.colors.functional.text.primary};
  font-size: ${({ theme }) => theme.fontSize.base};
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const PostMetaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.small};
`;

export const PostMetric = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
`;

export const SelectPostButton = styled.button`
  border: 0;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  color: ${({ theme }) => theme.colors.semantic.primary};
  font-weight: 700;
  cursor: pointer;
`;

export const ExternalPostLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
`;

export const PostDetailContent = styled.div`
  width: 100%;
  max-width: 1060px;
  margin: 0 auto;
  padding: 20px 0 40px;
`;

export const PostDetailSummary = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;

  @media (max-width: 640px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

export const PostDetailMediaPreview = styled.div`
  position: relative;
  width: 300px;
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
`;

export const PostDetailMetric = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.functional.text.primary};
`;

export const PostDetailSectionTitle = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

export const PostDescriptionBox = styled.div`
  min-height: 90px;
  padding: 14px;
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  border-radius: ${({ theme }) => theme.radius.large};
  background: ${({ theme }) => theme.colors.functional.background.elevated};
  color: ${({ theme }) => theme.colors.functional.text.primary};
`;

export const PostProductsTableWrapper = styled.div`
  .ant-table-wrapper {
    border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
    border-radius: ${({ theme }) => theme.radius.large};
    overflow: hidden;
  }
`;

export const LinkProductPickerDropdown = styled.div`
  width: min(420px, calc(100vw - 32px));
`;

export const PaginationRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
`;

export const LoadMoreSentinel = styled.div`
  width: 100%;
  min-height: 1px;
`;

export const LoadMoreState = styled(CenteredState)`
  min-height: 72px;
  margin: 48px 0;
`;
