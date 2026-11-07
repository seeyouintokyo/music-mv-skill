import type { FC } from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { tokens } from '../tokens';
import { CHORUS, OFFSET } from '../timing';
import { Backdrop } from '../components/Backdrop';
import { Orbit } from '../components/Orbit';
import { BeatRings } from '../components/BeatRings';
import { Moon } from '../components/Moon';
import { useBass } from '../hooks/useBass';
import { useSceneFade } from '../hooks/useSceneFade';

const CENTER = 'translate(-50%, -50%)';

export const S3_Chorus: FC = () => {
  const frame = useCurrentFrame();
  const fade = useSceneFade(CHORUS);
  const bass = useBass(OFFSET.S3);
  const zoom = interpolate(frame, [0, tokens.motion.normal * 2], [1, 1.04], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(...tokens.motion.ease),
  });
  const scale = zoom * (1 + bass * tokens.motion.beatScale);
  const flash = interpolate(frame, [0, 6], [0.72, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ opacity: fade, fontFamily: tokens.font.family }}>
      <Backdrop count={95} seed="s3" size={4} />
      <div style={{ position: 'absolute', left: '50%', top: '42%', transform: CENTER }}>
        <Orbit progress={1} radius={420} opacity={0.7} />
      </div>
      <div style={{ position: 'absolute', left: '50%', top: '42%', transform: CENTER }}>
        <BeatRings bass={bass} count={4} radius={300} color={tokens.color.accent} />
      </div>
      <div style={{ position: 'absolute', left: '50%', top: '42%', transform: `${CENTER} scale(${scale})` }}>
        <Moon phase={1} radius={265} color={tokens.color.accent} />
      </div>
      <AbsoluteFill style={{ backgroundColor: tokens.color.text, opacity: flash }} />
    </AbsoluteFill>
  );
};
