import type { FC } from 'react';
import { tokens } from '../tokens';

type Props = {
  phase: number; // 0 = 细弯月，1 = 满月
  radius?: number;
  color?: string;
  opacity?: number;
};

/** 用两圆相减的 SVG path 画月相；外层负责定位和缩放。 */
export const Moon: FC<Props> = ({ phase, radius = 250, color, opacity = 1 }) => {
  const R = radius;
  const fill = color ?? tokens.color.primary;
  const k = R * (1.6 - 2.5 * phase);
  const bright =
    phase >= 0.985 ? (
      <circle r={R} fill={fill} />
    ) : (
      <path d={`M 0 ${-R} A ${R} ${R} 0 0 1 0 ${R} Q ${k} 0 0 ${-R} Z`} fill={fill} />
    );
  return (
    <svg
      width={R * 4}
      height={R * 4}
      viewBox={`${-2 * R} ${-2 * R} ${4 * R} ${4 * R}`}
      style={{ opacity, overflow: 'visible' }}
    >
      <circle r={R} fill={tokens.color.bgSoft} stroke={tokens.color.line} strokeWidth={2} />
      {bright}
    </svg>
  );
};
