import type { ButtonProps } from 'antd';
import { Button, Form, Image, Table } from 'antd';
import type { FC } from 'react';
import styled from 'styled-components';

import { BRAND_PRIMARY } from '@/styled/brand';

export const DetailShell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const DetailContentArea = styled.div`
  min-height: 320px;
`;

export const DetailLoadingArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  width: 100%;
`;

export const DetailEmptyArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
`;

export const DetailEmptyMessage = styled.span`
  color: ${({ theme }) => theme.colors.functional.text.placeholder};
`;

export const HeroCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  border-radius: 12px;
  padding: 20px;
  background: ${({ theme }) => theme.colors.functional.background.elevated};
`;

export const HeroTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

export const HeroLeft = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
  min-width: 0;
  flex: 1;
`;

export const HeroPreviewCluster = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
`;

export const HeroAvatar = styled.div<{ $hasImage: boolean }>`
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.functional.background.base};
  border: 1px solid ${({ theme }) => theme.colors.functional.border.split};
  display: flex;
  align-items: center;
  justify-content: center;

  img,
  .ant-image-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .ant-image {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export const HeroTextBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

export const HeroTitle = styled.span`
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
  color: ${({ theme }) => theme.colors.functional.text.primary};
`;

export const HeroDescription = styled.span`
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;

export const InstagramPermalinkLink = styled(Button as FC<ButtonProps>).attrs({ type: 'link' })`
  align-self: flex-start;
  padding-inline: 0;
  height: auto;
`;

export const HeroActions = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`;

export const MetaStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.functional.border.split};

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.functional.text.subdued};

  svg {
    flex-shrink: 0;
    color: ${({ theme }) => theme.colors.functional.text.placeholder};
  }
`;

export const MetaLabel = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.functional.text.primary};
`;

export const MetaValue = styled.span`
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const StatusPill = styled.span<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  background: ${({ $active }) => ($active ? '#ECFDF5' : '#F1F5F9')};
  color: ${({ $active }) => ($active ? '#047857' : '#64748B')};
`;

export const StatusDot = styled.span<{ $active?: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $active }) => ($active ? '#10B981' : '#94A3B8')};
`;

export const MediaGalleryStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
`;

export const MediaGalleryCaption = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;

export const MediaGalleryTiles = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const MediaThumbFrame = styled.div<{ $size: number }>`
  position: relative;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
`;

export const MediaThumbImage = styled(Image)<{ $size: number }>`
  display: block;

  &,
  .ant-image-img {
    width: ${({ $size }) => $size}px;
    height: ${({ $size }) => $size}px;
  }

  .ant-image-img,
  img {
    object-fit: cover;
    border-radius: 8px;
  }
`;

export const MediaThumbDeleteCorner = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 2;
`;

export const MediaCornerDeleteButton = styled(Button)`
  padding: 0;
  width: 28px;
  height: 28px;
  min-width: 28px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.55);
  color: #f8fafc;
`;

export const VariantsSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const VariantsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

export const VariantsTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.functional.text.primary};
`;

export const AddVariantButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  background: ${BRAND_PRIMARY};
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.92;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

export const VariantsTable = styled(Table)`
  .ant-table-container {
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.functional.border.split};
    overflow: hidden;
  }

  .ant-table-thead > tr > th {
    background: ${({ theme }) => theme.colors.base.grey[2]} !important;
    font-weight: 600;
    font-size: 13px;
    color: ${({ theme }) => theme.colors.functional.text.subdued};
    border-bottom: 1px solid ${({ theme }) => theme.colors.functional.border.split};
  }

  .ant-table-tbody > tr > td {
    border-bottom: 1px solid ${({ theme }) => theme.colors.functional.border.split};
  }

  .ant-table-tbody > tr:last-child > td {
    border-bottom: none;
  }
`;

export const VariantFormRow = styled.div`
  display: flex;
  gap: 12px;
`;

export const VariantFormHalfField = styled(Form.Item)`
  flex: 1;
`;

export const VariantImageFieldStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const VariantNumberInput = styled.div`
  width: 100%;

  .ant-input-number {
    width: 100%;
  }
`;
