import { interpolate, useCurrentFrame } from 'remotion';
import { tokens } from '../tokens';

/** 每屏首尾统一淡入淡出 sceneFade 帧。 */
export const useSceneFade = (duration: number): number => {
  const frame = useCurrentFrame();
  const f = tokens.motion.sceneFade;
  return interpolate(frame, [0, f, duration - f, duration], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};
