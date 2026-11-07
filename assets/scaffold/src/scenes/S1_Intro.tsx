import type { FC } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { tokens } from '../tokens';
import { content } from '../content';
import { INTRO, OFFSET } from '../timing';
import { VisualStage } from '../components/VisualStage';
import { getPreset } from '../visual/theme';

export const S1_Intro: FC = () => {
  const frame = useCurrentFrame();
  const p = getPreset();
  const title = interpolate(
    frame,
    [tokens.motion.slow, tokens.motion.slow + tokens.motion.normal],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ fontFamily: tokens.font.family }}>
      <VisualStage
        section={0} progress={0.06} intensity={0.28}
        duration={INTRO} frameOffset={OFFSET.S1} seed="s1"
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 370,
          textAlign: 'center',
          color: p.palette.text,
          fontSize: tokens.size.title,
          letterSpacing: 10,
          opacity: title,
          textShadow: `0 0 44px ${p.palette.primary}`,
        }}
      >
        {content.songTitle}
      </div>
    </AbsoluteFill>
  );
};
