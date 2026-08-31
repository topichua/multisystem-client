import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Composer = styled.footer.attrs(() =>
  dataQaAttrs("layout-conversation-details-composer"),
)`
  flex-shrink: 0;
  border-top: 1px solid
    ${({ theme }) => theme.colors.functional.border.cardBase};
  background: ${({ theme }) => theme.colors.functional.background.base};

  @media (max-width: 767px) {
    padding: 0;
  }
`;

export const ComposerContent = styled.div`
  padding: 16px 24px;

  @media (max-width: 767px) {
    padding: 8px;
  }
`;

export const ReplyBanner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 10px;
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.radius.semiLarge};
  border-left: 3px solid ${({ theme }) => theme.colors.semantic.primary};
  background: ${({ theme }) => theme.colors.functional.background.natural};
  box-shadow: inset 0 0 0 1px
    ${({ theme }) => theme.colors.functional.border.cardBase};
`;

export const ReplyBannerBody = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ReplyBannerAuthor = styled.div`
  font-size: 12px;
  font-weight: 600;
  line-height: 1.25;
  color: ${({ theme }) => theme.colors.functional.text.heading};
`;

export const ReplyBannerSnippet = styled.div`
  margin-top: 2px;
  font-size: 12px;
  line-height: 1.35;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const EditorShell = styled.div`
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  border-radius: ${({ theme }) => theme.radius.semiLarge};
  background: ${({ theme }) => theme.colors.functional.background.elevated};
  @media (max-width: 767px) {
    padding: 4px;

    .ant-btn {
      min-width: 36px;
    }
  }
`;

export const EmojiPickerPopoverBody = styled.div`
  line-height: 0;
  border-radius: ${({ theme }) => theme.radius.semiLarge};
  overflow: hidden;
`;
