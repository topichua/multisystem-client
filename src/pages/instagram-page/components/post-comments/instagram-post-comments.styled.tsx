import styled from "styled-components";

import { CenteredState } from "../../instagram-page.styled";

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 100%;
  padding: 14px;
`;

export const Centered = styled(CenteredState)`
  min-height: 260px;
`;

export const HeaderContent = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  > .ant-typography {
    margin-right: auto;
  }
`;

export const UnansweredPill = styled.span`
  min-height: 26px;
  display: inline-flex;
  align-items: center;
  padding: 0 10px;
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.semantic.primary};
  background: ${({ theme }) => theme.colors.functional.background.primary};
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 700;
  white-space: nowrap;
`;

export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const Item = styled.article<{ $active?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;

  > * {
    position: relative;
    z-index: 1;
  }

  ${({ $active, theme }) =>
    $active
      ? `
        &::before {
          content: "";
          position: absolute;
          inset: -8px;
          z-index: 0;
          border: 1px solid ${theme.colors.functional.border.cardBase};
          border-radius: ${theme.radius.large};
          background: ${theme.colors.functional.background.elevated};
          pointer-events: none;
        }
      `
      : ""}
`;

export const Row = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
`;

export const Avatar = styled.div`
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.functional.text.inverted};
  background: ${({ theme }) => theme.colors.semantic.primary};
  font-size: ${({ theme }) => theme.fontSize.base};
  font-weight: 700;
  overflow: hidden;
`;

export const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
`;

export const Content = styled.div`
  min-width: 0;
  flex: 1;

  .ant-btn-link {
    height: auto;
    padding: 0;
    font-weight: 600;
  }
`;

export const Line = styled.div`
  min-width: 0;
  color: ${({ theme }) => theme.colors.functional.text.primary};
  font-size: ${({ theme }) => theme.fontSize.base};
  line-height: 1.42;
  overflow-wrap: anywhere;
`;

export const InlineText = styled.span`
  color: ${({ theme }) => theme.colors.functional.text.primary};
`;

export const ActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 22px;
  margin-top: 4px;
  font-size: ${({ theme }) => theme.fontSize.small};
`;

export const Replies = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
  padding-left: 10px;
  border-left: 2px solid ${({ theme }) => theme.colors.functional.border.split};
`;

export const ReplyItem = styled.div<{ $optimistic?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
  color: ${({ theme }) => theme.colors.functional.text.primary};
  font-size: ${({ theme }) => theme.fontSize.small};
  line-height: 1.45;
  overflow-wrap: anywhere;
  opacity: ${({ $optimistic }) => ($optimistic ? 0.68 : 1)};
`;

export const ReplyAvatar = styled(Avatar)`
  width: 26px;
  height: 26px;
  font-size: ${({ theme }) => theme.fontSize.extraSmall};
`;

export const ReplyContent = styled.div`
  min-width: 0;
  flex: 1;
`;

export const ReplyText = styled.span`
  color: ${({ theme }) => theme.colors.functional.text.primary};
`;

export const ReplyComposer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
`;

export const ReplyTarget = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 24px;

  .ant-btn {
    margin-left: auto;
    flex-shrink: 0;
  }
`;

export const ReplyTargetIcon = styled.span`
  flex: 0 0 auto;
  color: ${({ theme }) => theme.colors.functional.text.subdued};
  font-size: ${({ theme }) => theme.fontSize.base};
  line-height: 1;
`;

export const EditorShell = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  border-radius: ${({ theme }) => theme.radius.large};
  background: ${({ theme }) => theme.colors.functional.background.elevated};
  transition:
    border-color 0.16s ease,
    box-shadow 0.16s ease;

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.functional.border.selected};
    box-shadow: 0 0 0 2px
      ${({ theme }) => theme.colors.functional.background.primary};
  }

  textarea.ant-input {
    padding: 10px 12px 4px;
    resize: none;
  }
`;

export const EmojiPickerPopoverBody = styled.div`
  line-height: 0;
  border-radius: ${({ theme }) => theme.radius.semiLarge};
  overflow: hidden;
`;

export const ComposerFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 6px 8px 8px;

  .instagram-comment-send-button {
    width: 36px;
    height: 36px;
    flex: 0 0 auto;
  }
`;
