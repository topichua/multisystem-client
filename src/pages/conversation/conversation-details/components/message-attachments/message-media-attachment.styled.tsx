import styled, { css } from "styled-components";

import type { MessagePlayableAttachmentType } from "./message-attachment-utils";

export const MediaFrame = styled.div<{ $type: MessagePlayableAttachmentType }>`
  width: ${({ $type }) =>
    $type === "video" ? "min(320px, 100%)" : "min(300px, 100%)"};
  max-width: 100%;
  overflow: hidden;
  color: ${({ theme }) => theme.colors.functional.text.primary};
  border-radius: ${({ theme }) => theme.radius.large};

  .message-media-player {
    width: 100%;
    max-width: 100%;
    --plyr-color-main: ${({ theme }) => theme.colors.semantic.primary};
    --plyr-border-radius: ${({ theme }) => theme.radius.large};
  }

  ${({ $type }) =>
    $type === "video"
      ? css`
          background: #0f172a;

          .message-media-player {
            aspect-ratio: 16 / 9;
            max-height: 320px;
          }
        `
      : css`
          .message-media-player {
            min-height: 48px;
          }

          .message-audio-controls {
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            gap: 8px;
            width: 100%;
            min-width: 280px;
            padding: 10px 12px;
            border-radius: ${({ theme }) => theme.radius.large};
            background: ${({ theme }) => theme.colors.base.white};
            color: ${({ theme }) => theme.colors.functional.text.primary};
          }

          .message-audio-controls__seek-row,
          .message-audio-controls__meta-row {
            display: flex;
            align-items: center;
            width: 100%;
            min-width: 0;
          }

          .message-audio-controls__seek-row {
            gap: 10px;
          }

          .message-audio-controls__meta-row {
            justify-content: space-between;
            gap: 12px;
            padding-left: 34px;
          }

          .message-audio-controls__button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            width: 24px;
            height: 24px;
            padding: 0;
            border: 0;
            background: transparent;
            color: ${({ theme }) => theme.colors.functional.text.heading};
            cursor: pointer;
          }

          .message-audio-controls__button svg {
            width: 18px;
            height: 18px;
          }

          .message-audio-controls__time {
            display: inline-flex;
            align-items: center;
            flex-shrink: 0;
            color: ${({ theme }) => theme.colors.functional.text.subdued};
            font-size: 12px;
            line-height: 1.25;
            font-variant-numeric: tabular-nums;
            white-space: nowrap;
          }

          .message-audio-controls__volume {
            display: inline-flex;
            align-items: center;
            flex-shrink: 0;
            gap: 6px;
          }

          .message-audio-controls__time-slider,
          .message-audio-controls__volume-slider {
            position: relative;
            display: flex;
            align-items: center;
            min-width: 0;
            height: 18px;
            margin: 0;
            cursor: pointer;
            touch-action: none;
          }

          .message-audio-controls__time-slider {
            flex: 1;
          }

          .message-audio-controls__volume-slider {
            width: 70px;
          }

          .message-audio-controls__slider-track {
            position: relative;
            width: 100%;
            height: 4px;
            overflow: hidden;
            border-radius: 999px;
            background: ${({ theme }) => theme.colors.functional.border.split};
          }

          .message-audio-controls__slider-fill,
          .message-audio-controls__slider-progress {
            position: absolute;
            inset: 0 auto 0 0;
            height: 100%;
            border-radius: inherit;
          }

          .message-audio-controls__slider-fill {
            z-index: 2;
            width: var(--slider-fill, 0%);
            background: ${({ theme }) => theme.colors.semantic.primary};
            will-change: width;
          }

          .message-audio-controls__slider-progress {
            z-index: 1;
            width: var(--slider-progress, 0%);
            background: rgba(15, 23, 42, 0.12);
            will-change: width;
          }

          .message-audio-controls__slider-thumb {
            position: absolute;
            top: 50%;
            left: var(--slider-fill, 0%);
            z-index: 3;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 2px solid ${({ theme }) => theme.colors.semantic.primary};
            background: ${({ theme }) => theme.colors.base.white};
            box-shadow: 0 1px 3px rgba(15, 23, 42, 0.2);
            transform: translate(-50%, -50%);
            pointer-events: none;
            will-change: left;
          }

          .message-audio-controls__button:focus-visible,
          .message-audio-controls__time-slider:focus-visible,
          .message-audio-controls__volume-slider:focus-visible {
            outline: 2px solid
              ${({ theme }) => theme.colors.functional.border.selected};
            outline-offset: 2px;
          }
        `}
`;
