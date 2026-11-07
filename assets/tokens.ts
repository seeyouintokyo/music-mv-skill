// 设计 tokens：视频里所有颜色、字号、间距、动画节奏都从这里取。
// 想换风格，只改这个文件，不用动画面代码。

export const tokens = {
  // 画布：竖屏 1080x1920，30 帧/秒（适合手机刷）
  canvas: { width: 1080, height: 1920, fps: 30 },
  // 用户要横屏时用这个
  canvasHorizontal: { width: 1920, height: 1080, fps: 30 },

  // 配色：深色夜空风，副歌时可以把 accent 用得更多
  color: {
    bg: '#070B18',        // 背景
    bgSoft: '#101833',    // 卡片、面板
    primary: '#6EA8FF',   // 主色：重点物体、强调线
    accent: '#FFC857',    // 点缀色：太阳、高亮、关键数字
    text: '#F4F6FB',      // 正文
    muted: '#8B95B0',     // 次要文字、标注
    line: 'rgba(255,255,255,0.18)', // 轨道线、分隔线
  },

  // 字体：用系统自带字体，不联网下载，渲染不会卡
  font: {
    family: '"PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif',
    number: '"SF Pro Display", "Segoe UI", "PingFang SC", sans-serif',
  },

  // 字号（像素）
  size: {
    hero: 110,    // 开场大问题
    title: 76,    // 每屏标题
    body: 48,     // 说明文字
    label: 34,    // 图上标注
    lyric: 72,    // MV 歌词
    small: 26,
  },

  // 间距
  space: { safe: 96, gap: 32, captionBottom: 80 },
  radius: { card: 28, pill: 999 },

  // 动画节奏（单位：帧，30 帧 = 1 秒）
  motion: {
    fast: 8,
    normal: 15,
    slow: 30,
    stagger: 6,                     // 多个元素依次出现的间隔
    beatScale: 0.08,                // 跟鼓点缩放的最大幅度
    ease: [0.22, 1, 0.36, 1] as const, // 统一缓动曲线，传给 Easing.bezier
    spring: { damping: 16, stiffness: 120, mass: 1 },
    sceneFade: 12,                  // 屏与屏之间淡入淡出
  },

  // 音频
  audio: { songVolume: 1, fadeOut: 60 },
} as const;

export type Tokens = typeof tokens;
