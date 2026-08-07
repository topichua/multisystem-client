import { Menu } from "antd";
import styled from "styled-components";

export const GroupLabel = styled.span`
  color: ${({ theme }) => theme.colors.functional.text.disabled};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: 1.3;
  text-transform: uppercase;
`;

export const NavMenu = styled(Menu)`
  && {
    border-inline-end: none;
    background: transparent;
  }

  && .ant-menu-item-group-title {
    padding: 16px 16px 6px;
    line-height: 1.3;
  }

  && .ant-menu-item-group:first-child .ant-menu-item-group-title {
    padding-top: 4px;
  }

  && .ant-menu-item {
    height: 36px;
    line-height: 36px;
    margin-inline: 8px;
    width: calc(100% - 16px);
  }
`;
