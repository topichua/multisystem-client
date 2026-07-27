import styled from "styled-components";

export const FieldShell = styled.div`
  min-width: 0;
  padding: 11px;
  border: 1px solid ${({ theme }) => theme.colors.functional.border.cardBase};
  border-radius: ${({ theme }) => theme.radius.semiLarge};
  background: ${({ theme }) => theme.colors.functional.background.elevated};
  transition:
    border-color 0.16s ease,
    box-shadow 0.16s ease;

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.functional.border.selected};
    box-shadow: 0 0 0 2px
      ${({ theme }) => theme.colors.functional.background.primary};
  }

  .ant-form-item-has-error & {
    border-color: ${({ theme }) => theme.colors.semantic.error};
  }

  .ant-form-item-has-error &:focus-within {
    border-color: ${({ theme }) => theme.colors.semantic.error};
    box-shadow: 0 0 0 2px
      ${({ theme }) => theme.colors.functional.background.error};
  }

  .ant-input-textarea,
  .ant-input,
  .ant-input:hover,
  .ant-input:focus,
  .ant-input-focused,
  .ant-input-outlined,
  .ant-input-outlined:hover,
  .ant-input-outlined:focus,
  .ant-input-outlined.ant-input-focused {
    padding: 0 !important;
    border: none !important;
    box-shadow: none !important;
    outline: none !important;
    background: transparent !important;
  }

  textarea.ant-input {
    resize: vertical;
  }
`;

export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  margin-top: 8px;
`;

export const EmojiPickerPopoverBody = styled.div`
  line-height: 0;
  border-radius: ${({ theme }) => theme.radius.semiLarge};
  overflow: hidden;
`;
