import styled from "styled-components";

import { TextTimeRow } from "./message-item.styled";

export const PostImageWrap = styled.div`
  width: 100%;

  .ant-image {
    display: block;
    width: 100%;
  }

  .ant-image-img {
    display: block;
    width: 100%;
    max-height: 360px;
    object-fit: cover;
  }
`;

export const PostCaptionRow = styled(TextTimeRow)`
  padding: 10px 12px 8px;
  margin-top: 0;
`;

export const PostCaption = styled.p`
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.35;
  white-space: pre-wrap;
`;
