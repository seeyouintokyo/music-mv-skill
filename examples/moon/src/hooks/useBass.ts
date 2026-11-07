import { useAudioData, visualizeAudio } from '@remotion/media-utils';
import { staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

/** 读当前帧低音强度 0~1；音频未就绪时返回 0，画面照常显示。 */
export const useBass = (frameOffset = 0): number => {
  const audio = useAudioData(staticFile('song.mp3'));
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!audio) return 0;
  const bins = visualizeAudio({
    fps,
    frame: Math.max(0, frame + frameOffset),
    audioData: audio,
    numberOfSamples: 16,
  });
  return (bins[0] + bins[1] + bins[2]) / 3;
};
