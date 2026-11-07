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
  const v = ((bins[0] ?? 0) + (bins[1] ?? 0) + (bins[2] ?? 0)) / 3;
  // 静音段（前奏、尾奏、纯器乐停顿）visualizeAudio 可能给出 NaN。
  // 不兜底会让所有依赖 bass 的半径、缩放变成 NaN，整层主图形直接消失。
  return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0;
};
