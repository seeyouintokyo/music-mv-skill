// 视觉预设：改 content.ts 里的 preset 一个字符串，整套画面就换掉。
// 布局数值（尺寸、间距、节奏）仍从 tokens.ts 取；这里只管「长什么样」。

export type PresetName = 'moon' | 'wave' | 'city' | 'grid' | 'petal' | 'dune';
export type MotifName = 'disc' | 'wave' | 'bars' | 'grid' | 'petal' | 'ridge';
export type BackdropName = 'stars' | 'grain' | 'mesh' | 'glow';
export type TransitionName = 'flash' | 'wipe' | 'zoom' | 'dissolve';
export type LyricName = 'fade' | 'slide' | 'scale' | 'typewriter';
export type BeatName = 'rings' | 'bars' | 'shimmer' | 'pulse';
export type ExtrasName = 'halo' | 'clouds' | 'ridges' | 'streaks' | 'constellation';

export interface Palette {
  bg: string;
  bgSoft: string;
  primary: string;
  accent: string;
  text: string;
  muted: string;
  line: string;
}

export interface VisualPreset {
  label: string;
  mood: string[];
  desc: string;
  palette: Palette;
  motif: MotifName;
  backdrop: BackdropName;
  transition: TransitionName;
  lyric: LyricName;
  lyricAlign: 'center' | 'left';
  beat: BeatName;
  // 叠加层：同一个主意象靠它们做景深，避免一屏只有一个图形
  extras: ExtrasName[];
}

export const presets: Record<PresetName, VisualPreset> = {
  moon: {
    label: '月相夜空',
    mood: ['月亮', '星空', '夜', '温柔', '治愈', '安静'],
    desc: '弯月随主歌渐圆，副歌满月配暖黄光圈。适合慢歌、抒情。',
    palette: {
      bg: '#070B18', bgSoft: '#101833', primary: '#6EA8FF', accent: '#FFC857',
      text: '#F4F6FB', muted: '#8B95B0', line: 'rgba(255,255,255,0.18)',
    },
    motif: 'disc', backdrop: 'stars', transition: 'flash',
    lyric: 'fade', lyricAlign: 'center', beat: 'rings',
    extras: ['halo', 'clouds', 'ridges', 'constellation'],
  },
  wave: {
    label: '声波海浪',
    mood: ['海', '浪', '雨', '水', '风', '流动', '自由'],
    desc: '多条正弦波横向流动，副歌振幅加大、层数变多。适合民谣、氛围。',
    palette: {
      bg: '#04202B', bgSoft: '#0A3440', primary: '#4FE0C0', accent: '#DFF9F2',
      text: '#EAFFFA', muted: '#79AFA9', line: 'rgba(120,240,215,0.20)',
    },
    motif: 'wave', backdrop: 'grain', transition: 'dissolve',
    lyric: 'slide', lyricAlign: 'center', beat: 'shimmer',
    extras: ['streaks', 'halo'],
  },
  city: {
    label: '城市频谱',
    mood: ['城市', '街', '灯', '霓虹', '车', '夜跑', '节奏', '电子'],
    desc: '竖条像天际线也像频谱，跟鼓点起伏。适合快歌、电子、说唱。',
    palette: {
      bg: '#150A22', bgSoft: '#28143A', primary: '#FF5C8A', accent: '#FFB35C',
      text: '#FFF0F6', muted: '#A98BB5', line: 'rgba(255,140,190,0.20)',
    },
    motif: 'bars', backdrop: 'mesh', transition: 'wipe',
    lyric: 'scale', lyricAlign: 'left', beat: 'bars',
    extras: ['streaks', 'clouds'],
  },
  grid: {
    label: '透视网格',
    mood: ['未来', '代码', '数字', '路', '线', '科技', '赛博', '秩序'],
    desc: '地平线网格向消失点收敛，副歌线条加密。适合科技感、器乐、快剪。',
    palette: {
      bg: '#0B0B10', bgSoft: '#161622', primary: '#6C7BFF', accent: '#B8FF5C',
      text: '#F2F3FF', muted: '#8C8FA8', line: 'rgba(140,150,255,0.22)',
    },
    motif: 'grid', backdrop: 'mesh', transition: 'zoom',
    lyric: 'typewriter', lyricAlign: 'left', beat: 'pulse',
    extras: ['streaks', 'constellation'],
  },
  petal: {
    label: '花瓣放射',
    mood: ['花', '春', '开', '暖', '心', '爱', '光', '生长'],
    desc: '花瓣随段落张开、缓慢旋转。适合明亮、甜的歌。',
    palette: {
      bg: '#2A1418', bgSoft: '#40202A', primary: '#FF8A73', accent: '#FFE9D6',
      text: '#FFF5EE', muted: '#B99090', line: 'rgba(255,190,170,0.22)',
    },
    motif: 'petal', backdrop: 'glow', transition: 'dissolve',
    lyric: 'fade', lyricAlign: 'center', beat: 'rings',
    extras: ['halo', 'constellation'],
  },
  dune: {
    label: '沙丘山脊',
    mood: ['山', '沙', '远方', '旅', '日落', '旷野', '公路', '孤独'],
    desc: '三层山脊缓慢横移，副歌抬高。适合叙事、公路、民谣。',
    palette: {
      bg: '#2B1D12', bgSoft: '#42301F', primary: '#E8B96A', accent: '#C98A9B',
      text: '#FFF6E8', muted: '#B29A7C', line: 'rgba(232,185,106,0.20)',
    },
    motif: 'ridge', backdrop: 'glow', transition: 'wipe',
    lyric: 'slide', lyricAlign: 'center', beat: 'shimmer',
    extras: ['ridges', 'clouds', 'halo'],
  },
};

export const presetNames = Object.keys(presets) as PresetName[];

/** 按歌词关键词给一个起点。AI 分镜时应自己判断，不把推荐结果当定论。 */
export const recommendPreset = (lyrics: string): PresetName => {
  const hits = presetNames.map((name) => ({
    name,
    score: presets[name].mood.reduce((n, w) => n + (lyrics.includes(w) ? 1 : 0), 0),
  }));
  const best = hits.sort((a, b) => b.score - a.score)[0];
  return best.score > 0 ? best.name : 'moon';
};
