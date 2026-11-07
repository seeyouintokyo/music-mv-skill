import type { FC } from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { tokens } from '../tokens';
import { OUTRO, OFFSET } from '../timing';
import { Backdrop } from '../components/Backdrop';
import { Orbit } from '../components/Orbit';
import { BeatRings } from '../components/BeatRings';
import { Moon } from '../components/Moon';
import { useBass } from '../hooks/useBass';
import { useSceneFade } from '../hooks/useSceneFade';

const CENTER = 'translate(-50%, -50%)';

export const S4_Outro: FC = () => {
  const frame = useCurrentFrame();
  const fade = useSceneFade(OUTRO);
  const bass = useBass(OFFSET.S4);
  const retreat = interpolate(frame, [0, OUTRO - 30], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(...tokens.motion.ease),
  });
  const dim = interpolate(frame, [0, OUTRO], [1, 0.25], { extrapolateRight: 'clamp' });
  const phase = 1 - retreat * 0.94;
  const scale = (1 - retreat * 0.05) * (1 + bass * tokens.motion.beatScale * 0.5);

  return (
    <AbsoluteFill style={{ opacity: fade, fontFamily: tokens.font.family }}>
      <Backdrop count={16} seed="s4" opacity={dim} />
      <div style={{ position: 'absolute', left: '50%', top: '42%', transform: CENTER }}>
        <Orbit progress={1 - retreat * 0.9} radius={400} opacity={0.4 * dim} />
      </div>
      <div style={{ position: 'absolute', left: '50%', top: '42%', transform: CENTER }}>
        <BeatRings bass={bass * 0.5} count={1} radius={300} color={tokens.color.primary} opacity={dim} />
      </div>
      <div style={{ position: 'absolute', left: '50%', top: '42%', transform: `${CENTER} scale(${scale})` }}>
        <Moon phase={phase} radius={255} color={tokens.color.primary} opacity={dim} />
      </div>
    </AbsoluteFill>
  );
};
