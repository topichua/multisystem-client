import { Button } from "antd";
import styled, { css } from "styled-components";

export const UploadedMediaPreview = styled.div<{ $isMain: boolean }>`
  position: relative;
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid ${(props) => props.theme.colors.functional.border.split};
  box-shadow: ${(props) =>
    props.$isMain ? `0 0 0 2px ${props.theme.colors.base.blue[5]}` : "none"};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .uploaded-media-main-tag {
    position: absolute;
    top: 6px;
    left: 6px;
    z-index: 1;
    margin: 0;
    padding: 4px;
  }

  .uploaded-media-delete {
    position: absolute;
    bottom: 4px;
    right: 4px;
    z-index: 1;
    background: rgba(255, 255, 255, 0.92) !important;
    border-radius: 6px;
  }

  .uploaded-media-drag {
    position: absolute;
    bottom: 4px;
    left: 4px;
    z-index: 1;
    cursor: grab;
    background: rgba(255, 255, 255, 0.92) !important;
    border-radius: 6px;

    &:active {
      cursor: grabbing;
    }
  }

  .uploaded-media-move {
    position: absolute;
    bottom: 4px;
    left: 4px;
    z-index: 1;
    background: rgba(255, 255, 255, 0.92);
    border-radius: 6px;
    padding: 2px;
  }
`;

export const AiButton = styled(Button)<{ $filled: boolean }>`
  border: none;
  font-weight: 600;
  color: ${(props) => props.theme.colors.base.blue[8]}!important;

  &:not(:disabled):not(.ant-btn-disabled):hover,
  &:not(:disabled):not(.ant-btn-disabled):focus {
    background: linear-gradient(
      45deg,
      ${(props) => props.theme.colors.base.blue[3]} 0%,
      ${(props) => props.theme.colors.base.red[3]} 100%
    );
    border: none;
  }

  ${(props) =>
    props.$filled
      ? css`
          background: linear-gradient(
            45deg,
            ${(props) => props.theme.colors.base.blue[2]} 0%,
            ${(props) => props.theme.colors.base.red[2]} 100%
          );
          border: none;
        `
      : css`
          background: transparent;
          &[disabled] {
            background: transparent;
          }
          border: none;
        `}
`;
