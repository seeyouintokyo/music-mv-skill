import type { FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { tokens } from '../tokens';
import { CHORUS, OFFSET } from '../timing';
import { VisualStage } from '../components/VisualStage';

export const S3_Chorus: FC = () => (
  <AbsoluteFill style={{ fontFamily: tokens.font.family }}>
    <VisualStage
      section={2} progress={1} intensity={1}
      duration={CHORUS} frameOffset={OFFSET.S3} seed="s3"
    />
  </AbsoluteFill>
);
