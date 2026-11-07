// 换一首歌，只改这个文件 + 项目根目录的「歌词时间轴.json」+ public/song.mp3。
// 画面代码（src/scenes、src/components）不用动。

export const content = {
  // 开场显示的歌名。太长就调 tokens.size.title，别在这里塞两行。
  songTitle: '你的歌名',

  // 四段秒数。总长必须 ≤ 60 秒。
  // 数字要来自真实人声：先跑 scripts/probe_song.py 看静音间隙，
  // 再用 ASR 转写量出第一句和副歌第一句的时间，填这里。
  // 默认值只是占位，别直接拿去渲染。
  intro: 8,
  verse: 21,
  chorus: 21,
  outro: 7,
} as const;
