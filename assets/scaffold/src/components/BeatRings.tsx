import type { FC } from 'react';
import { tokens } from '../tokens';

type Props = { bass: number; count?: number; radius?: number; color?: string; opacity?: number };

/** 同心光圈，半径随低音强度扩散；幅度由 tokens.motion.beatScale 控制。 */
export const BeatRings: FC<Props> = ({
  bass,
  count = 3,
  radius = 290,
  color,
  opacity = 1,
}) => {
  const c = color ?? tokens.color.accent;
  return (
    <svg
      width={radius * 3}
      height={radius * 3}
      viewBox={`${-1.5 * radius} ${-1.5 * radius} ${3 * radius} ${3 * radius}`}
      style={{ overflow: 'visible' }}
    >
      {new Array(count).fill(0).map((_, i) => {
        const r = radius * (1 + i * 0.2) + bass * tokens.motion.beatScale * radius * 2;
        const o = opacity * (1 - i / (count + 1)) * (0.3 + bass * 0.7);
        return <circle key={i} r={r} fill="none" stroke={c} strokeWidth={2.5} opacity={o} />;
      })}
    </svg>
  );
};
