import type { FC, ReactNode } from 'react';
import { AbsoluteFill, random } from 'remotion';
import { tokens } from '../tokens';
import type {
  BackdropName, ExtrasName, MotifName, Palette,
} from './presets';

export interface LayerProps {
  progress: number;   // 0~1，段落推进程度
  intensity: number;  // 主歌小、副歌大
  bass: number;       // 0~1，低音强度
  frame: number;      // 本屏相对帧
  palette: Palette;
  seed: string;
}

const BOX = 1080;
const HALF = BOX / 2;

/** 主图形：六种母题共用同一套输入，画面差别由 preset.motif 决定。 */
export const Motif: FC<LayerProps & { name: MotifName }> = ({ name, ...p }) => {
  const { progress, intensity, bass, frame, palette: c } = p;
  let body: ReactNode = null;

  if (name === 'disc') {
    // 月相：两圆相减的亮面 + 固定纹理点，避免一个纯色圆盘
    const R = 218 + intensity * 34 + bass * 12;
    const ph = Math.min(Math.max(progress, 0), 1);
    const k = R * (1.6 - 2.5 * Math.min(ph, 0.985));
    const bright = ph >= 0.985
      ? <circle r={R} fill={c.primary} />
      : <path d={`M 0 ${-R} A ${R} ${R} 0 0 1 0 ${R} Q ${k} 0 0 ${-R} Z`} fill={c.primary} />;
    body = (
      <>
        <circle r={R} fill={c.bgSoft} stroke={c.line} strokeWidth={2} />
        {bright}
        {Array.from({ length: 9 }, (_, i) => {
          const a = i * 2.399;
          const rr = R * (0.15 + 0.7 * ((i * 0.37) % 1));
          return (
            <circle key={i} cx={Math.cos(a) * rr} cy={Math.sin(a) * rr}
              r={8 + (i % 3) * 7} fill={c.bgSoft} opacity={0.10 + (i % 2) * 0.05} />
          );
        })}
      </>
    );
  }

  if (name === 'wave') {
    const count = 3 + Math.round(progress * 4);
    body = Array.from({ length: count }, (_, i) => {
      const y0 = -200 + i * (400 / count);
      const amp = (18 + intensity * 46 + bass * 26) * (0.55 + i * 0.08);
      const phase = frame * 0.028 + i * 0.55;
      const pts = Array.from({ length: 45 }, (_, j) => {
        const x = -HALF + j * (BOX / 44);
        const y = y0 + Math.sin(x / 92 + phase) * amp + Math.sin(x / 210 - phase * 0.6) * amp * 0.4;
        return `${j === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      }).join(' ');
      return <path key={i} d={pts} fill="none" stroke={i % 3 === 0 ? c.accent : c.primary}
        strokeWidth={2 + i * 0.5} opacity={0.22 + (i / count) * 0.5} strokeLinecap="round" />;
    });
  }

  if (name === 'bars') {
    const n = 26;
    const w = BOX / n;
    body = Array.from({ length: n }, (_, i) => {
      const h = (0.16 + 0.44 * Math.abs(Math.sin(i * 0.63 + frame * 0.017)) + bass * 0.32 * intensity)
        * 460 * (0.45 + progress * 0.55);
      return <rect key={i} x={-HALF + i * w + 3} y={300 - h} width={w - 7} height={h}
        rx={3} fill={i % 5 === 0 ? c.accent : c.primary} opacity={0.35 + (i % 4) * 0.14} />;
    });
  }

  if (name === 'grid') {
    const horizon = -110;
    body = (
      <>
        {Array.from({ length: 13 }, (_, i) => {
          const x = -600 + i * 100;
          return <line key={`v${i}`} x1={x} y1={520} x2={0} y2={horizon}
            stroke={c.line} strokeWidth={1.6} />;
        })}
        {Array.from({ length: 9 }, (_, i) => {
          const t = (i + 1) / 9;
          const y = horizon + Math.pow(t, 2.2) * (620 + frame * 0.4 % 40);
          return <line key={`h${i}`} x1={-620} y1={y} x2={620} y2={y}
            stroke={i % 3 === 0 ? c.primary : c.line} strokeWidth={i % 3 === 0 ? 2 : 1.4}
            opacity={0.25 + t * 0.5} />;
        })}
        <rect x={-88} y={horizon - 88} width={176} height={176} rx={12}
          transform="rotate(45)" fill="none" stroke={c.accent} strokeWidth={3}
          opacity={0.5 + intensity * 0.4} />
      </>
    );
  }

  if (name === 'petal') {
    const n = 12;
    body = Array.from({ length: n }, (_, i) => {
      const deg = (360 / n) * i + frame * 0.12;
      const len = 120 + progress * 190 + bass * 30 * intensity;
      return <ellipse key={i} cx={0} cy={-len / 2} rx={len * 0.20} ry={len / 2}
        transform={`rotate(${deg})`} fill={i % 3 === 0 ? c.accent : c.primary}
        opacity={0.16 + intensity * 0.24} stroke={c.accent} strokeWidth={1.5} />;
    });
  }

  if (name === 'ridge') {
    body = Array.from({ length: 3 }, (_, layer) => {
      const base = 170 + layer * 110;
      const amp = (52 + layer * 26) * (0.5 + intensity * 0.7);
      const pts = Array.from({ length: 28 }, (_, j) => {
        const x = -HALF - 40 + j * (BOX + 80) / 27;
        const y = base - Math.abs(Math.sin(x / 155 + layer * 1.35 + frame * 0.004)) * amp;
        return `${j === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      }).join(' ');
      return <path key={layer} d={`${pts} L ${HALF} 540 L ${-HALF} 540 Z`}
        fill={layer === 0 ? c.primary : c.bgSoft}
        opacity={layer === 0 ? 0.34 + intensity * 0.3 : 0.55 - layer * 0.12} />;
    });
  }

  // 返回 <g>：由 VisualStage 统一放进唯一一个 <svg>，避免多层 svg 叠加时部分层不出像素。
  return <g>{body}</g>;
};

/** 叠加层：同一个主意象靠它们做景深，画面不再只有一个图形。 */
export const Extras: FC<LayerProps & { names: ExtrasName[] }> = ({ names, ...p }) => {
  const { progress, intensity, bass, frame, palette: c } = p;
  const parts: ReactNode[] = [];

  if (names.includes('halo')) {
    parts.push(
      <g key="halo">
        <circle r={300 + bass * 60} fill="url(#haloGrad)" opacity={0.35 + intensity * 0.4} />
        <circle r={255 + bass * 40} fill="none" stroke={c.accent} strokeWidth={1.5} opacity={0.18 + bass * 0.3} />
      </g>
    );
  }

  if (names.includes('clouds')) {
    parts.push(
      <g key="clouds" opacity={0.18 + intensity * 0.12}>
        {Array.from({ length: 3 }, (_, i) => {
          const y = -40 + i * 105 + Math.sin(frame * 0.006 + i) * 12;
          const shift = (frame * (0.35 + i * 0.18)) % 400;
          const d = `M -700 ${y} Q -350 ${y - 55} 0 ${y + 10} T 700 ${y - 20}`;
          return <path key={i} d={d} transform={`translate(${shift - 200} 0)`} fill="none"
            stroke={c.text} strokeWidth={26 + i * 12} opacity={0.22} strokeLinecap="round" />;
        })}
      </g>
    );
  }

  if (names.includes('ridges')) {
    parts.push(
      <g key="ridges">
        {Array.from({ length: 2 }, (_, layer) => {
          const base = 250 + layer * 90;
          const pts = Array.from({ length: 22 }, (_, j) => {
            const x = -HALF - 30 + j * (BOX + 60) / 21;
            const y = base - Math.abs(Math.sin(x / 190 + layer * 2.1 + frame * 0.002)) * (46 + layer * 22);
            return `${j === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
          }).join(' ');
          return <path key={layer} d={`${pts} L ${HALF} 540 L ${-HALF} 540 Z`}
            fill={layer === 0 ? c.bgSoft : c.bg} opacity={0.78} />;
        })}
      </g>
    );
  }

  if (names.includes('streaks')) {
    parts.push(
      <g key="streaks" opacity={0.14 + intensity * 0.22}>
        {Array.from({ length: 16 }, (_, i) => {
          const x = -560 + ((i * 137 + frame * (1.2 + (i % 3))) % 1200);
          const y = -460 + (i * 83) % 920;
          return <line key={i} x1={x} y1={y} x2={x + 90 + (i % 4) * 40} y2={y + 26}
            stroke={i % 4 === 0 ? c.accent : c.primary} strokeWidth={1.6} strokeLinecap="round" />;
        })}
      </g>
    );
  }

  if (names.includes('constellation')) {
    const pts = Array.from({ length: 10 }, (_, i) => ({
      x: -430 + random(`${p.seed}-cx-${i}`) * 860,
      y: -430 + random(`${p.seed}-cy-${i}`) * 620,
    }));
    parts.push(
      <g key="constellation" opacity={0.22 + progress * 0.28}>
        {pts.slice(0, -1).map((q, i) => (
          <line key={`l${i}`} x1={q.x} y1={q.y} x2={pts[i + 1].x} y2={pts[i + 1].y}
            stroke={c.line} strokeWidth={1.2} />
        ))}
        {pts.map((q, i) => <circle key={`p${i}`} cx={q.x} cy={q.y} r={2.5 + (i % 3)}
          fill={c.accent} opacity={0.5 + (i % 3) * 0.16} />)}
      </g>
    );
  }

  return (
    <g>
      <defs>
        <radialGradient id="haloGrad">
          <stop offset="0%" stopColor={c.accent} stopOpacity="0.55" />
          <stop offset="55%" stopColor={c.primary} stopOpacity="0.16" />
          <stop offset="100%" stopColor={c.bg} stopOpacity="0" />
        </radialGradient>
      </defs>
      {parts}
    </g>
  );
};

/** 背景层：全屏 1080×1920，四种铺法。 */
export const BackdropLayer: FC<LayerProps & { name: BackdropName }> = ({ name, ...p }) => {
  const { palette: c, intensity, frame, seed, bass } = p;
  const { width, height } = tokens.canvas;
  return (
    <AbsoluteFill style={{ backgroundColor: c.bg }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {name === 'stars' || name === 'grain' ? (
          Array.from({ length: name === 'stars' ? 110 : 260 }, (_, i) => (
            <circle key={i}
              cx={tokens.space.safe + random(`${seed}-x-${i}`) * (width - tokens.space.safe * 2)}
              cy={tokens.space.safe + random(`${seed}-y-${i}`) * (height - tokens.space.safe * 2)}
              r={(name === 'stars' ? 2.4 : 1.2) * (0.5 + random(`${seed}-r-${i}`))}
              fill={c.text} opacity={(0.16 + random(`${seed}-o-${i}`) * 0.5) * (1 + bass * 0.4)} />
          ))
        ) : null}
        {name === 'mesh' ? (
          <g opacity={0.22 + intensity * 0.12}>
            {Array.from({ length: 13 }, (_, i) => (
              <line key={`v${i}`} x1={i * 90} y1={0} x2={i * 90} y2={height} stroke={c.line} strokeWidth={1} />
            ))}
            {Array.from({ length: 22 }, (_, i) => (
              <line key={`h${i}`} x1={0} y1={i * 90} x2={width} y2={i * 90} stroke={c.line} strokeWidth={1} />
            ))}
          </g>
        ) : null}
        {name === 'glow' ? (
          <ellipse cx={width / 2} cy={height * 0.40 + Math.sin(frame * 0.004) * 18}
            rx={480 + intensity * 90} ry={420} fill="url(#bgGlow)" opacity={0.5} />
        ) : null}
        <defs>
          <radialGradient id="bgGlow">
            <stop offset="0%" stopColor={c.primary} stopOpacity="0.30" />
            <stop offset="100%" stopColor={c.bg} stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </AbsoluteFill>
  );
};
