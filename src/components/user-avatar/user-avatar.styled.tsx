import { Avatar as AntdAvatar } from "antd";
import styled from "styled-components";

export const Avatar = styled(AntdAvatar)`
  && {
    flex: 0 0 auto;
    background: ${(props) => props.theme.colors.brandPalette[6]};
    color: ${(props) => props.theme.colors.base.white};
    font-size: 12px;
    font-weight: 700;
  }
`;
