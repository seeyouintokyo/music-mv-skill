import type { CSSProperties, FC } from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { tokens } from '../tokens';
import data from '../../歌词时间轴.json';

type Line = { text: string; start: number; end: number; section: string };
const lines: Line[] = data as Line[];

const split = (text: string): string[] => {
  // 歌词里的空格是换气点，优先在空格处折成两行，避免 12 字长句被浏览器硬折行。
  if (text.includes(' ')) return text.split(' ').filter(Boolean);
  if (text.length <= 12) return [text];
  const mid = Math.ceil(text.length / 2);
  return [text.slice(0, mid), text.slice(mid)];
};

const lineStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: 8,
  fontSize: tokens.size.lyric,
  lineHeight: 1.3,
  whiteSpace: 'nowrap',
};

export const LyricLayer: FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const idx = lines.findIndex((l) => t >= l.start && t < l.end);
  const current = idx >= 0 ? lines[idx] : null;
  const prev = idx > 0 ? lines[idx - 1] : null;
  const local = current ? (t - current.start) * fps : 0;

  const fadeIn = current
    ? interpolate(local, [0, tokens.motion.fast], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.bezier(...tokens.motion.ease),
      })
    : 0;
  const prevOpacity = current
    ? interpolate(local, [0, tokens.motion.normal], [0.45, 0], { extrapolateRight: 'clamp' })
    : 0;
  const prevShift = current
    ? interpolate(local, [0, tokens.motion.normal], [0, -tokens.space.gap * 2], {
        extrapolateRight: 'clamp',
      })
    : 0;

  return (
    <AbsoluteFill style={{ fontFamily: tokens.font.family, pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: tokens.space.safe,
          right: tokens.space.safe,
          top: 1270,
          height: 240,
          textAlign: 'center',
        }}
      >
        {prev && prevOpacity > 0.01 ? (
          <div
            style={{
              ...lineStyle,
              color: tokens.color.muted,
              opacity: prevOpacity,
              transform: `translateY(${prevShift}px)`,
            }}
          >
            {split(prev.text).map((s, i) => (
              <div key={i}>{s}</div>
            ))}
          </div>
        ) : null}
        {current ? (
          <div style={{ ...lineStyle, color: tokens.color.text, opacity: fadeIn }}>
            {split(current.text).map((s, i) => (
              <div key={i}>{s}</div>
            ))}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
