import { Card, Typography } from 'antd';
import styled, { css } from 'styled-components';

import { dataQaAttrs } from '@/styled/data-qa-attrs';

const { Title: AntdTitle } = Typography;

export const Column = styled.div.attrs(() => dataQaAttrs('layout-conversations-list-body'))`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const ListHeader = styled.div.attrs(() => dataQaAttrs('layout-conversations-list-header'))`
  flex-shrink: 0;
  padding-top: 16px;
`;

export const ListScroll = styled.div.attrs(() => dataQaAttrs('layout-conversations-list-scroll'))`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 16px;
`;

export const Title = styled(AntdTitle)`
  padding: 0 12px;
`;

export const FilterRow = styled.div`
  padding: 0 12px 10px;
`;

export const MobileOnlyFilterRow = styled(FilterRow)`
  display: none;

  @media (max-width: 767px) {
    display: block;
  }
`;

export const ConversationCard = styled(Card)<{ $isSelected: boolean }>`
  border-color: transparent;
  pointer-events: none;
  transition:
    box-shadow 0.12s ease,
    background 0.12s ease;

  background: ${(props) =>
    props.$isSelected ? props.theme.colors.functional.background.hover : 'transparent'};

  &:hover {
    box-shadow: none;
  }

  .ant-card-body {
    padding: 8px 12px;
  }
`;

export const ConversationCardOuter = styled.div<{ $interactive?: boolean }>`
  padding: 0;
  border-radius: ${({ theme }) => theme.radius.semiLarge};
  cursor: ${({ $interactive }) => ($interactive === false ? 'default' : 'pointer')};
  user-select: none;

  ${(p) =>
    p.$interactive !== false &&
    css`
      &:hover ${ConversationCard} {
        background: ${p.theme.colors.functional.background.hover};
      }

      &:active {
        padding: 0 4px;
      }
    `}
`;

export const ConversationActionsHitbox = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  pointer-events: auto;
`;
