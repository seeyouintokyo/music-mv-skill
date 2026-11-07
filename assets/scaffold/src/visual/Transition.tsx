import type { FC } from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import type { Palette, TransitionName } from './presets';

type Props = { name: TransitionName; frame: number; palette: Palette };

/** 段落入屏转场。只在副歌首帧挂，四种写法都靠帧号算，不用 CSS 动画。 */
export const Transition: FC<Props> = ({ name, frame, palette: c }) => {
  if (name === 'flash') {
    const o = interpolate(frame, [0, 6], [0.72, 0], { extrapolateRight: 'clamp' });
    return <AbsoluteFill style={{ backgroundColor: c.text, opacity: o }} />;
  }

  if (name === 'wipe') {
    const x = interpolate(frame, [0, 14], [-100, 110], { extrapolateRight: 'clamp' });
    const o = interpolate(frame, [0, 10, 18], [0.55, 0.42, 0], { extrapolateRight: 'clamp' });
    return (
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        <AbsoluteFill style={{ backgroundColor: c.accent, opacity: o,
          transform: `translateX(${x}%) skewX(-12deg)` }} />
      </AbsoluteFill>
    );
  }

  if (name === 'zoom') {
    const s = interpolate(frame, [0, 16], [1.5, 1], { extrapolateRight: 'clamp' });
    const o = interpolate(frame, [0, 16], [0.5, 0], { extrapolateRight: 'clamp' });
    return (
      <AbsoluteFill style={{ opacity: o, justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: 700, height: 700, borderRadius: '50%',
          border: `3px solid ${c.accent}`, transform: `scale(${s})` }} />
      </AbsoluteFill>
    );
  }

  const o = interpolate(frame, [0, 20], [0.5, 0], { extrapolateRight: 'clamp' });
  return <AbsoluteFill style={{ backgroundColor: c.primary, opacity: o }} />;
};
