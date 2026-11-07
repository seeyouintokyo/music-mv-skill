import type { FC } from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { tokens } from '../tokens';
import { OUTRO, OFFSET } from '../timing';
import { VisualStage } from '../components/VisualStage';

export const S4_Outro: FC = () => {
  const frame = useCurrentFrame();
  const retreat = interpolate(frame, [0, OUTRO - 30], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(...tokens.motion.ease),
  });

  return (
    <AbsoluteFill style={{ fontFamily: tokens.font.family }}>
      <VisualStage
        section={3}
        progress={1 - retreat * 0.94}
        intensity={0.25 + 0.35 * (1 - retreat)}
        shift={retreat * 44}
        duration={OUTRO} frameOffset={OFFSET.S4} seed="s4"
      />
    </AbsoluteFill>
  );
};
