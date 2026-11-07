import type { CSSProperties, FC } from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { tokens } from '../tokens';
import { VERSE, OFFSET } from '../timing';
import { Backdrop } from '../components/Backdrop';
import { Orbit } from '../components/Orbit';
import { Moon } from '../components/Moon';
import { useBass } from '../hooks/useBass';
import { useSceneFade } from '../hooks/useSceneFade';

const PER = VERSE / 4;
const PHASES = [0.08, 0.32, 0.56, 0.78, 0.92];

const center: CSSProperties = {
  position: 'absolute',
  left: '50%',
  top: '42%',
  transform: 'translate(-50%, -50%)',
};

export const S2_Verse: FC = () => {
  const frame = useCurrentFrame();
  const fade = useSceneFade(VERSE);
  const bass = useBass(OFFSET.S2);
  const seg = Math.min(3, Math.floor(frame / PER));
  const local = frame - seg * PER;
  const phase = interpolate(
    local,
    [0, tokens.motion.normal * 3],
    [PHASES[seg], PHASES[seg + 1]],
    { extrapolateRight: 'clamp', easing: Easing.bezier(...tokens.motion.ease) }
  );
  const orbit = interpolate(frame, [0, VERSE], [0.12, 0.62], { extrapolateRight: 'clamp' });
  const scale = 1 + bass * tokens.motion.beatScale;

  return (
    <AbsoluteFill style={{ opacity: fade, fontFamily: tokens.font.family }}>
      <Backdrop count={42} seed="s2" />
      <div style={center}>
        <Orbit progress={orbit} radius={360} opacity={0.55} />
      </div>
      <div style={{ ...center, transform: `translate(-50%, -50%) scale(${scale})` }}>
        <Moon phase={phase} radius={250} color={tokens.color.primary} opacity={0.92} />
      </div>
    </AbsoluteFill>
  );
};
