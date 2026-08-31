import { Segmented } from "antd";
import styled from "styled-components";

export const Row = styled.div<{
  $disabled: boolean;
}>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  box-sizing: border-box;
  color: ${(props) => props.theme.colors.functional.text.subdued};
  opacity: ${(props) => (props.$disabled ? 0.72 : 1)};
  min-height: 44px;
  padding: 4px 12px;
  border-radius: ${(props) => props.theme.radius.medium};
`;

export const Icon = styled.span`
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  color: currentColor;
  line-height: 1;
  width: 36px;
  min-width: 36px;
  height: 36px;
`;

export const Label = styled.span`
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  color: currentColor;
  font-size: ${(props) => props.theme.fontSize.medium};
  font-weight: 500;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const LanguageSegmented = styled(Segmented)`
  && {
    flex: 0 0 auto;
  }
`;
