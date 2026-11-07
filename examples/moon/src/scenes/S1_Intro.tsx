import type { CSSProperties, FC } from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { tokens } from '../tokens';
import { INTRO, OFFSET } from '../timing';
import { Backdrop } from '../components/Backdrop';
import { Moon } from '../components/Moon';
import { useBass } from '../hooks/useBass';
import { useSceneFade } from '../hooks/useSceneFade';

const center = (scale: number): CSSProperties => ({
  position: 'absolute',
  left: '50%',
  top: '42%',
  transform: `translate(-50%, -50%) scale(${scale})`,
});

export const S1_Intro: FC = () => {
  const frame = useCurrentFrame();
  const fade = useSceneFade(INTRO);
  const bass = useBass(OFFSET.S1);
  const rise = interpolate(frame, [0, tokens.motion.slow * 3], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(...tokens.motion.ease),
  });
  const title = interpolate(
    frame,
    [tokens.motion.slow, tokens.motion.slow + tokens.motion.normal],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const scale = 1 + bass * tokens.motion.beatScale;

  return (
    <AbsoluteFill style={{ opacity: fade, fontFamily: tokens.font.family }}>
      <Backdrop count={26} opacity={rise} seed="s1" />
      <div style={center(scale)}>
        <Moon phase={0.06} radius={250} color={tokens.color.primary} opacity={0.3 + 0.7 * rise} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 370,
          textAlign: 'center',
          color: tokens.color.text,
          fontSize: tokens.size.title,
          letterSpacing: 10,
          opacity: title,
        }}
      >
        月亮在等你
      </div>
    </AbsoluteFill>
  );
};
