import type { FC } from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { tokens } from '../tokens';
import { VERSE, OFFSET } from '../timing';
import { VisualStage } from '../components/VisualStage';

const PER = VERSE / 4;
const PHASES = [0.08, 0.32, 0.56, 0.78, 0.94];

export const S2_Verse: FC = () => {
  const frame = useCurrentFrame();
  const seg = Math.min(3, Math.floor(frame / PER));
  const local = frame - seg * PER;
  const progress = interpolate(
    local,
    [0, tokens.motion.normal * 3],
    [PHASES[seg], PHASES[seg + 1]],
    { extrapolateRight: 'clamp', easing: Easing.bezier(...tokens.motion.ease) }
  );
  // 每句换一次构图：主图形横向漂移，不再 21 秒只做一次渐变
  const shift = Math.sin(seg * 1.7) * 72;

  return (
    <AbsoluteFill style={{ fontFamily: tokens.font.family }}>
      <VisualStage
        section={1} progress={progress} intensity={0.42} shift={shift}
        duration={VERSE} frameOffset={OFFSET.S2} seed="s2"
      />
    </AbsoluteFill>
  );
};
