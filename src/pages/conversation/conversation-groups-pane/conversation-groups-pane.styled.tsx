import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Aside = styled.aside.attrs(() =>
  dataQaAttrs("layout-conversations-groups"),
)`
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 16px;
  border-right: 1px solid
    ${(props) => props.theme.colors.functional.border.cardBase};

  @media (max-width: 767px) {
    display: none;
  }
`;

export const GroupFilterCheckboxRow = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
  padding: 8px 4px 8px 0;
  border-radius: ${(props) => props.theme.radius.medium};
  cursor: pointer;
  user-select: none;

  &:hover {
    background: ${(props) => props.theme.colors.functional.background.hover};
  }

  .ant-checkbox-wrapper {
    flex-direction: row-reverse;
    align-items: center;
    width: 100%;
    gap: 8px;
  }

  .ant-checkbox {
    opacity: ${(p) => (p.$selected ? 1 : 0)};
    transition: opacity 0.12s ease;
  }

  &:hover .ant-checkbox,
  &:focus-within .ant-checkbox {
    opacity: 1;
  }

  .ant-checkbox + span {
    flex: 1;
    min-width: 0;
    padding-inline: 0;
  }
`;
