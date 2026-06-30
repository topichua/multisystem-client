import { Typography } from "antd";
import styled from "styled-components";

import { PaneSectionHint } from "@/components/layout/pane-frame";

export const PageTitle = styled(Typography.Title)`
  && {
    margin-top: 0;
  }
`;

export const HeaderHint = styled(PaneSectionHint)`
  && {
    margin-top: 0;
  }
`;

export const CardsStack = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
