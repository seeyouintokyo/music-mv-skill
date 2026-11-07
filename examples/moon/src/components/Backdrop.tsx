import type { FC } from 'react';
import { AbsoluteFill, random } from 'remotion';
import { tokens } from '../tokens';

type Props = { count: number; opacity?: number; seed?: string; size?: number };

export const Backdrop: FC<Props> = ({ count, opacity = 1, seed = 'stars', size = 3 }) => {
  const { width, height } = tokens.canvas;
  const stars = new Array(count).fill(0).map((_, i) => ({
    x: tokens.space.safe + random(`${seed}-x-${i}`) * (width - tokens.space.safe * 2),
    y: tokens.space.safe + random(`${seed}-y-${i}`) * (height - tokens.space.safe * 2),
    r: size * (0.5 + random(`${seed}-r-${i}`)),
    o: 0.25 + random(`${seed}-o-${i}`) * 0.6,
  }));
  return (
    <AbsoluteFill style={{ backgroundColor: tokens.color.bg, opacity }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={tokens.color.text} opacity={s.o} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
