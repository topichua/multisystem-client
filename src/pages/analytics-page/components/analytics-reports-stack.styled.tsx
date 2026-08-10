import styled from "styled-components";

import { dataQaAttrs } from "@/styled/data-qa-attrs";

export const Root = styled.div.attrs<{ $dataQa: string }>(({ $dataQa }) =>
  dataQaAttrs($dataQa),
)`
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 100%;
  min-width: 0;
`;
