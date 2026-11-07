import { tokens } from './tokens';
const sec = (s: number) => Math.round(s * tokens.canvas.fps);

// 按真实歌的人声时间对齐（语音转写实测）：人声 10.8s 起、主歌至 28.95s、副歌 28.95s 起。
// 副歌起点 29s 与画面闪白天然重合，故保留完整 10.8s 前奏、不裁掉开头。
export const INTRO = sec(10.8);   // 324
export const VERSE = sec(18.2);   // 546
export const CHORUS = sec(21);    // 630
export const OUTRO = sec(7);      // 210
export const TOTAL_FRAMES = INTRO + VERSE + CHORUS + OUTRO; // 1710 = 57s

// Series.Sequence 内 useCurrentFrame() 是相对帧；读音频要换算成整片绝对帧。
export const OFFSET = {
  S1: 0,
  S2: INTRO,
  S3: INTRO + VERSE,
  S4: INTRO + VERSE + CHORUS,
} as const;
