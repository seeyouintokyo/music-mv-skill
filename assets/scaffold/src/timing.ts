import { tokens } from './tokens';
import { content } from './content';

const sec = (s: number) => Math.round(s * tokens.canvas.fps);

// 四段秒数统一从 content.ts 读，别在这里写死帧号。
export const INTRO = sec(content.intro);
export const VERSE = sec(content.verse);
export const CHORUS = sec(content.chorus);
export const OUTRO = sec(content.outro);
export const TOTAL_FRAMES = INTRO + VERSE + CHORUS + OUTRO;

// Series.Sequence 内 useCurrentFrame() 是相对帧；读音频频谱要换算回整片绝对帧。
// 歌若用 <Audio trimBefore> 截过，这里每段还要再加 开始秒数 × fps。
export const OFFSET = {
  S1: 0,
  S2: INTRO,
  S3: INTRO + VERSE,
  S4: INTRO + VERSE + CHORUS,
} as const;
