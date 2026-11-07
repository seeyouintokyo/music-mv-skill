import type { FC } from 'react';
import { AbsoluteFill, Audio, interpolate, Series, staticFile, useCurrentFrame } from 'remotion';
import { tokens } from './tokens';
import { LyricLayer } from './components/LyricLayer';
import { S1_Intro } from './scenes/S1_Intro';
import { S2_Verse } from './scenes/S2_Verse';
import { S3_Chorus } from './scenes/S3_Chorus';
import { S4_Outro } from './scenes/S4_Outro';
import { INTRO, VERSE, CHORUS, OUTRO, TOTAL_FRAMES } from './timing';

export { TOTAL_FRAMES } from './timing';

export const Video: FC = () => {
  const frame = useCurrentFrame();
  const volume = interpolate(
    frame,
    [TOTAL_FRAMES - tokens.audio.fadeOut, TOTAL_FRAMES],
    [tokens.audio.songVolume, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: tokens.color.bg }}>
      <Series>
        <Series.Sequence durationInFrames={INTRO}>
          <S1_Intro />
        </Series.Sequence>
        <Series.Sequence durationInFrames={VERSE}>
          <S2_Verse />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CHORUS}>
          <S3_Chorus />
        </Series.Sequence>
        <Series.Sequence durationInFrames={OUTRO}>
          <S4_Outro />
        </Series.Sequence>
      </Series>
      <LyricLayer />
      <Audio src={staticFile('song.mp3')} volume={volume} />
    </AbsoluteFill>
  );
};
