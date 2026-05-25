import { Avatar as AntdAvatar } from 'antd';
import styled from 'styled-components';

import { dataQaAttrs } from '@/styled/data-qa-attrs';

export const Avatar = styled(AntdAvatar).attrs(() => dataQaAttrs('layout-app-user-menu-trigger'))`
  &:hover {
    cursor: pointer;
  }
`;
