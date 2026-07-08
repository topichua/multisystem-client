import {
  Controls,
  formatTime,
  MediaPlayer,
  MediaProvider,
  MuteButton,
  PlayButton,
  TimeSlider,
  useMediaState,
  VolumeSlider,
} from "@vidstack/react";
import {
  PauseIcon,
  PlayIcon,
  SpeakerHighIcon,
  SpeakerLowIcon,
  SpeakerSlashIcon,
} from "@phosphor-icons/react";
import {
  PlyrLayout,
  plyrLayoutIcons,
} from "@vidstack/react/player/layouts/plyr";
import type { PlyrControl } from "@vidstack/react/player/layouts/plyr";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import type { MessagePlayableAttachment } from "./message-attachment-utils";
import * as S from "./message-media-attachment.styled";

type MessageMediaAttachmentProps = MessagePlayableAttachment;

const formatAudioTime = (time: number): string =>
  Number.isFinite(time) && time > 0 ? formatTime(time) : "0:00";

const VIDEO_CONTROLS: PlyrControl[] = [
  "play-large",
  "play",
  "progress",
  "current-time",
  "duration",
  "mute+volume",
  "pip",
  "fullscreen",
];

const AudioPlayIcon = () => {
  const paused = useMediaState("paused");

  return paused ? (
    <PlayIcon aria-hidden="true" weight="fill" />
  ) : (
    <PauseIcon aria-hidden="true" weight="fill" />
  );
};

const AudioVolumeIcon = () => {
  const muted = useMediaState("muted");
  const volume = useMediaState("volume");

  if (muted || volume === 0) {
    return <SpeakerSlashIcon aria-hidden="true" weight="fill" />;
  }

  return volume < 0.5 ? (
    <SpeakerLowIcon aria-hidden="true" weight="fill" />
  ) : (
    <SpeakerHighIcon aria-hidden="true" weight="fill" />
  );
};

const AudioTimeLabel = () => {
  const currentTime = useMediaState("currentTime");
  const duration = useMediaState("duration");

  return (
    <span className="message-audio-controls__time">
      {formatAudioTime(currentTime)} / {formatAudioTime(duration)}
    </span>
  );
};

const AudioControls = () => {
  const { t } = useTranslation();

  return (
    <Controls.Root className="message-audio-controls">
      <Controls.Group className="message-audio-controls__seek-row">
        <PlayButton
          className="message-audio-controls__button"
          aria-label={t("messages.media.playAudio")}
        >
          <AudioPlayIcon />
        </PlayButton>
        <TimeSlider.Root
          className="message-audio-controls__time-slider vds-slider vds-time-slider"
          aria-label={t("messages.media.audioProgress")}
        >
          <TimeSlider.Track className="message-audio-controls__slider-track vds-slider-track">
            <TimeSlider.TrackFill className="message-audio-controls__slider-fill vds-slider-track-fill" />
            <TimeSlider.Progress className="message-audio-controls__slider-progress vds-slider-progress" />
          </TimeSlider.Track>
          <TimeSlider.Thumb className="message-audio-controls__slider-thumb vds-slider-thumb" />
        </TimeSlider.Root>
      </Controls.Group>

      <Controls.Group className="message-audio-controls__meta-row">
        <AudioTimeLabel />
        <span className="message-audio-controls__volume">
          <MuteButton
            className="message-audio-controls__button"
            aria-label={t("messages.media.toggleVolume")}
          >
            <AudioVolumeIcon />
          </MuteButton>
          <VolumeSlider.Root
            className="message-audio-controls__volume-slider vds-slider vds-volume-slider"
            aria-label={t("messages.media.audioVolume")}
          >
            <VolumeSlider.Track className="message-audio-controls__slider-track vds-slider-track">
              <VolumeSlider.TrackFill className="message-audio-controls__slider-fill vds-slider-track-fill" />
            </VolumeSlider.Track>
            <VolumeSlider.Thumb className="message-audio-controls__slider-thumb vds-slider-thumb" />
          </VolumeSlider.Root>
        </span>
      </Controls.Group>
    </Controls.Root>
  );
};

export const MessageMediaAttachment = memo(
  ({ type, src, poster, title }: MessageMediaAttachmentProps) => (
    <S.MediaFrame $type={type}>
      <MediaPlayer
        className="message-media-player"
        src={src}
        title={title}
        viewType={type}
        streamType="on-demand"
        playsInline
        preload="metadata"
        poster={poster}
      >
        <MediaProvider />
        {type === "audio" ? (
          <AudioControls />
        ) : (
          <PlyrLayout icons={plyrLayoutIcons} controls={VIDEO_CONTROLS} />
        )}
      </MediaPlayer>
    </S.MediaFrame>
  ),
);

MessageMediaAttachment.displayName = "MessageMediaAttachment";
