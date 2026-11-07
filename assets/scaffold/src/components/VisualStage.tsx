import type { CSSProperties, FC } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { tokens } from '../tokens';
import { useBass } from '../hooks/useBass';
import { useSceneFade } from '../hooks/useSceneFade';
import { getPreset } from '../visual/theme';
import { BackdropLayer, Extras, Motif, type LayerProps } from '../visual/layers';
import { BeatLayer } from '../visual/BeatLayer';
import { Transition } from '../visual/Transition';

type Props = {
  section: 0 | 1 | 2 | 3;
  progress: number;    // 本屏主图形的推进程度 0~1
  intensity: number;   // 主歌 0.35 左右，副歌 1
  duration: number;    // 本屏总帧数
  frameOffset: number; // OFFSET.S1~S4，读音频频谱用
  seed: string;
  shift?: number;      // 主图形横向位移（像素），每句换一次构图
};

const BOX = 1080;
const HALF = BOX / 2;
const stage = (scale: number, shift: number): CSSProperties => ({
  position: 'absolute',
  left: '50%',
  top: '42%',
  width: BOX,
  height: BOX,
  transform: `translate(-50%, -50%) translateX(${shift}px) scale(${scale})`,
});
const artSvg: CSSProperties = { position: 'absolute', inset: 0, overflow: 'visible' };

/**
 * 通用舞台：四屏只负责算 progress / intensity，画面由 preset 决定。
 * 换 preset 时这里和四屏代码都不用改。
 */
export const VisualStage: FC<Props> = ({ section, progress, intensity, duration, frameOffset, seed, shift = 0 }) => {
  const frame = useCurrentFrame();
  const fade = useSceneFade(duration);
  const bass = useBass(frameOffset);
  const p = getPreset();

  // 副歌整体推近一点，主歌保持静止，让段落之间有镜头差
  const zoom = section === 2
    ? interpolate(frame, [0, tokens.motion.slow], [1, 1.05], { extrapolateRight: 'clamp' })
    : 1;
  const scale = zoom * (1 + bass * tokens.motion.beatScale);
  // 副歌把主图形换成点缀色，主歌用主色：不换题材也能有明显色温落差
  const palette = section === 2
    ? { ...p.palette, primary: p.palette.accent }
    : p.palette;
  const layer: LayerProps = { progress, intensity, bass, frame, palette, seed };

  return (
    <AbsoluteFill style={{ opacity: fade, fontFamily: tokens.font.family }}>
      <BackdropLayer name={p.backdrop} {...layer} />
      <div style={stage(scale, shift)}>
        <svg width={BOX} height={BOX} viewBox={`${-HALF} ${-HALF} ${BOX} ${BOX}`} style={artSvg}>
          <Extras names={p.extras} {...layer} />
          <Motif name={p.motif} {...layer} />
          <BeatLayer name={p.beat} bass={bass} intensity={intensity}
            palette={palette} frame={frame} />
        </svg>
      </div>
      {section === 2 ? <Transition name={p.transition} frame={frame} palette={palette} /> : null}
    </AbsoluteFill>
  );
};
