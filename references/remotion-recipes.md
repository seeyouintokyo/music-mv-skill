# 画面画法速查

下面每一条都对应 `examples/moon/src/` 里**已经跑通**的代码。改画面时直接照着改，别另起一套。
所有色值、字号、帧数都从 `src/tokens.ts` 取。

## 1. 月相：两圆相减的 SVG path

`components/Moon.tsx`。`phase` 0 = 细弯月，1 = 满月。

```tsx
const k = R * (1.6 - 2.5 * phase);
const bright = phase >= 0.985
  ? <circle r={R} fill={fill} />
  : <path d={`M 0 ${-R} A ${R} ${R} 0 0 1 0 ${R} Q ${k} 0 0 ${-R} Z`} fill={fill} />;
```

外圆弧固定，内弧用一条二次贝塞尔的 `Q` 控制点 `k` 左右移动，就得到弯月渐圆。
满月单独走 `<circle>`，避免 `Q` 在临界值产生细缝。

## 2. 主歌四句推四个月相

`scenes/S2_Verse.tsx`。不读歌词时间轴，直接按帧把这段四等分：

```tsx
const PER = VERSE / 4;
const PHASES = [0.08, 0.32, 0.56, 0.78, 0.92];
const seg = Math.min(3, Math.floor(frame / PER));
const local = frame - seg * PER;
const phase = interpolate(local, [0, tokens.motion.normal * 3],
                          [PHASES[seg], PHASES[seg + 1]], { extrapolateRight: 'clamp', easing: ... });
```

换歌词句数就改 `PER` 的分母和 `PHASES` 的长度。
**等分只是画面节奏**，字幕的实际出现时间仍由 `歌词时间轴.json` 决定，两者互不覆盖。

## 3. 轨道弧：progress 0→1 闭合成圆

`components/Orbit.tsx`。`progress >= 0.999` 时画整圆，否则用 `A` 弧命令画一段：

```tsx
const angle = Math.PI * 2 * Math.min(progress, 0.999);
const x = Math.sin(angle) * R, y = -Math.cos(angle) * R;
const large = progress > 0.5 ? 1 : 0;
<path d={`M 0 ${-R} A ${R} ${R} 0 ${large} 1 ${x} ${y}`} strokeDasharray="10 12" />
```

主歌让 `progress` 从 0.12 涨到 0.62，副歌直接给 1，呼应「绕一圈」。

## 4. 星点：固定种子，不用 Math.random()

`components/Backdrop.tsx`。用 Remotion 的 `random('种子')`，保证每帧、每次渲染完全一致：

```tsx
x: tokens.space.safe + random(`${seed}-x-${i}`) * (width - tokens.space.safe * 2)
```

星点数量就是画面的「密度旋钮」：主歌 42、副歌 95、尾奏 16、前奏 26。

## 5. 鼓点联动：低音三档均值

`hooks/useBass.ts`：

```tsx
const bins = visualizeAudio({ fps, frame: frame + frameOffset, audioData: audio, numberOfSamples: 16 });
return (bins[0] + bins[1] + bins[2]) / 3;
```

**`frameOffset` 是必须的**：`<Series.Sequence>` 内 `useCurrentFrame()` 返回的是相对这一屏的帧，直接拿去读音频会一直读开头几秒，画面看起来「不动」。
四个屏分别传 `OFFSET.S1`–`OFFSET.S4`（在 `src/timing.ts` 里算好）。

驱动缩放：`const scale = 1 + bass * tokens.motion.beatScale;`，`beatScale = 0.08`，幅度 ≤ ±8%。
`components/BeatRings.tsx` 用同一个 `bass` 推光圈半径和透明度。

**怎么验它真的生效**：渲染后取相邻帧做差分，静止段帧间差异不该是恒定 0。

```bash
ffmpeg -v error -i out/mv.mp4 -vf "select='between(n,100,112)',tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-" -an -f null -
```

## 6. 屏间淡入淡出 / 副歌闪白

`hooks/useSceneFade.ts`：用 `interpolate(frame, [0, f, duration-f, duration], [0,1,1,0])`，`f = tokens.motion.sceneFade`（12 帧）。

`scenes/S3_Chorus.tsx` 入屏闪白：

```tsx
const flash = interpolate(frame, [0, 6], [0.72, 0], { extrapolateRight: 'clamp' });
<AbsoluteFill style={{ backgroundColor: tokens.color.text, opacity: flash }} />
```

6 帧 = 0.2 秒，别再长。同时给整屏 1→1.04 的缓慢放大。

## 7. 歌词折行：空格优先

`components/LyricLayer.tsx`。这是踩过坑的地方——12 字长句被浏览器硬折，末行只剩一个「走」字。

```tsx
const split = (text: string): string[] => {
  if (text.includes(' ')) return text.split(' ').filter(Boolean);  // 歌词自带空格 = 换气点
  if (text.length <= 12) return [text];
  const mid = Math.ceil(text.length / 2);
  return [text.slice(0, mid), text.slice(mid)];
};
```

配合 `whiteSpace: 'nowrap'`，彻底杜绝孤字行。
当前句淡入高亮，上一句变淡并上移退出，不逐字跳。

## 8. 结尾淡出

`src/Video.tsx`，用整片绝对帧：

```tsx
const volume = interpolate(frame,
  [TOTAL_FRAMES - tokens.audio.fadeOut, TOTAL_FRAMES],
  [tokens.audio.songVolume, 0],
  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
```

`fadeOut = 60` 帧 = 2 秒。不要用 ffmpeg 事后压，保持一条命令能重出成片。

## 9. 装配顺序

`src/Video.tsx` 从下到上三层，顺序不能反：

```
<Series> 四屏画面 </Series>   →   <LyricLayer />   →   <Audio src={staticFile('song.mp3')} volume={volume} />
```

歌词层用 `pointerEvents: 'none'`，音频放最后但不受层级影响。
