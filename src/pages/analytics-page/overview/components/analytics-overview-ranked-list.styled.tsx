import styled from "styled-components";

export const Row = styled.div`
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
`;

export const Media = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radius.medium};
  overflow: hidden;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
`;

export const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

export const CustomerAvatar = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: ${({ theme }) => theme.fontSize.medium};
  font-weight: 600;
  line-height: 1;
  background: ${({ $color }) => $color};
`;

export const CustomerAvatarImageOnly = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 999px;
  object-fit: cover;
  display: block;
`;

export const Content = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const TopLine = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

export const Name = styled.div`
  min-width: 0;
  color: ${({ theme }) => theme.colors.functional.text.heading};
  font-size: ${({ theme }) => theme.fontSize.medium};
  font-weight: 500;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Value = styled.div`
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.functional.text.heading};
  font-size: ${({ theme }) => theme.fontSize.medium};
  font-weight: 600;
  line-height: 1.3;
  white-space: nowrap;
`;

export const BottomLine = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
`;

export const ProgressTrack = styled.div`
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.functional.background.hover};
`;

export const ProgressFill = styled.div<{ $width: number }>`
  width: ${({ $width }) => $width}%;
  height: 100%;
  border-radius: inherit;
  background: ${({ theme }) => theme.colors.semantic.primary};
`;

export const Meta = styled.div`
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.small};
  line-height: 1.3;
  white-space: nowrap;
`;
