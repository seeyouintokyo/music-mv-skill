import type { FC } from 'react';
import { tokens } from '../tokens';

type Props = { progress: number; radius?: number; opacity?: number };

/** 轨道弧：progress 0~1，1 时闭合成整圆。 */
export const Orbit: FC<Props> = ({ progress, radius = 360, opacity = 0.7 }) => {
  const R = radius;
  const full = progress >= 0.999;
  const angle = Math.PI * 2 * Math.min(progress, 0.999);
  const x = Math.sin(angle) * R;
  const y = -Math.cos(angle) * R;
  const large = progress > 0.5 ? 1 : 0;
  return (
    <svg
      width={R * 2.4}
      height={R * 2.4}
      viewBox={`${-1.2 * R} ${-1.2 * R} ${2.4 * R} ${2.4 * R}`}
      style={{ overflow: 'visible' }}
    >
      {full ? (
        <circle r={R} fill="none" stroke={tokens.color.primary} strokeWidth={2} opacity={opacity} />
      ) : (
        <path
          d={`M 0 ${-R} A ${R} ${R} 0 ${large} 1 ${x} ${y}`}
          fill="none"
          stroke={tokens.color.primary}
          strokeWidth={2}
          opacity={opacity}
          strokeDasharray="10 12"
        />
      )}
    </svg>
  );
};
