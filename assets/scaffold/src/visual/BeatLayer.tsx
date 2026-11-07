import type { FC } from 'react';
import type { BeatName, Palette } from './presets';

type Props = {
  name: BeatName;
  bass: number;
  intensity: number;
  palette: Palette;
  frame: number;
};

const BOX = 1080;
const HALF = BOX / 2;

/** 鼓点反馈层：四种画法，幅度仍受 tokens.motion.beatScale 约束。 */
export const BeatLayer: FC<Props> = ({ name, bass, intensity, palette: c, frame }) => {
  const b = Math.min(1, bass);
  let body = null;

  if (name === 'rings') {
    body = Array.from({ length: 4 }, (_, i) => {
      const r = 260 * (1 + i * 0.19) + b * 60 * (1 + i * 0.2);
      return <circle key={i} r={r} fill="none" stroke={i % 2 ? c.primary : c.accent}
        strokeWidth={2 + i * 0.4} opacity={(0.34 - i * 0.06) * (0.4 + b * 0.6) * (0.5 + intensity * 0.5)} />;
    });
  }

  if (name === 'bars') {
    body = Array.from({ length: 22 }, (_, i) => {
      const h = 18 + Math.abs(Math.sin(i * 1.7 + frame * 0.09)) * (40 + b * 130);
      return <rect key={i} x={-HALF + 20 + i * 48} y={430 - h} width={26} height={h} rx={4}
        fill={i % 4 === 0 ? c.accent : c.primary} opacity={0.25 + b * 0.5} />;
    });
  }

  if (name === 'shimmer') {
    body = Array.from({ length: 9 }, (_, i) => {
      const a = (i / 9) * Math.PI * 2 + frame * 0.004;
      const rr = 300 + Math.sin(frame * 0.02 + i) * 24;
      return <circle key={i} cx={Math.cos(a) * rr} cy={Math.sin(a) * rr}
        r={3 + b * 9 + (i % 3) * 1.5} fill={i % 3 === 0 ? c.accent : c.text}
        opacity={0.25 + b * 0.6} />;
    });
  }

  if (name === 'pulse') {
    body = (
      <>
        <circle r={300 + b * 46} fill="none" stroke={c.accent} strokeWidth={1 + b * 5}
          opacity={0.18 + b * 0.45} />
        <circle r={330 + b * 60} fill="none" stroke={c.primary} strokeWidth={1}
          opacity={0.12 + b * 0.25} strokeDasharray="8 14" />
      </>
    );
  }

  // 返回 <g>，由 VisualStage 统一放进同一个 <svg>。
  return <g>{body}</g>;
};
