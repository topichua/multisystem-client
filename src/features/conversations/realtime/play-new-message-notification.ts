const createBeepWavBlob = (): Blob => {
  const sampleRate = 44100;
  const durationSec = 0.35;
  const samples = Math.floor(sampleRate * durationSec);
  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = numChannels * (bitsPerSample / 8);
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, value: string): void => {
    for (let i = 0; i < value.length; i += 1) {
      view.setUint8(offset + i, value.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < samples; i += 1) {
    const t = i / sampleRate;
    const frequency = t < 0.12 ? 880 : 1174.66;
    const envelope = Math.min(1, t * 25) * Math.max(0, 1 - (t - 0.05) * 2.5);
    const sample = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.45;
    const pcm = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));

    view.setInt16(44 + i * 2, pcm, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
};

let audio: HTMLAudioElement | null = null;
let audioUrl: string | null = null;
let unlocked = false;

const ensureAudio = (): HTMLAudioElement | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (audio == null) {
    audioUrl = URL.createObjectURL(createBeepWavBlob());
    audio = new Audio(audioUrl);
    audio.preload = 'auto';
  }

  return audio;
};

/** Call once after a user gesture so later WebSocket notifications can play. */
export const unlockMessageNotificationAudio = async (): Promise<void> => {
  const element = ensureAudio();

  if (element == null || unlocked) {
    return;
  }

  try {
    element.volume = 0.001;
    element.currentTime = 0;
    await element.play();
    element.pause();
    element.currentTime = 0;
    element.volume = 0.85;
    unlocked = true;
  } catch {
    // Wait for the next gesture.
  }
};

export const installMessageNotificationAudioUnlock = (): (() => void) => {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const onUserGesture = (): void => {
    void unlockMessageNotificationAudio();
  };

  const options: AddEventListenerOptions = { capture: true, passive: true };

  window.addEventListener('pointerdown', onUserGesture, options);
  window.addEventListener('keydown', onUserGesture, options);
  window.addEventListener('touchstart', onUserGesture, options);

  return () => {
    window.removeEventListener('pointerdown', onUserGesture, options);
    window.removeEventListener('keydown', onUserGesture, options);
    window.removeEventListener('touchstart', onUserGesture, options);

    if (audioUrl != null) {
      URL.revokeObjectURL(audioUrl);
      audioUrl = null;
    }

    audio = null;
    unlocked = false;
  };
};

/** Short two-tone chime for an inbound message received over WebSocket. */
export const playNewMessageNotification = (): void => {
  const element = ensureAudio();

  if (element == null) {
    return;
  }

  element.volume = 0.85;
  element.currentTime = 0;

  void element.play().catch(() => {
    // Blocked until unlockMessageNotificationAudio runs after a user gesture.
  });
};
