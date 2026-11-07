// 铺出一个可运行的 Remotion MV 项目。
// 用法：node scripts/scaffold.mjs <目标目录> [--song 歌.mp3] [--lyrics 歌词.txt] [--title "歌名"] [--preset moon|wave|city|grid|petal|dune|auto]
import fs from 'node:fs';
import path from 'node:path';

const skillRoot = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const target = path.resolve(args[0] ?? '');
const opt = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? path.resolve(args[i + 1]) : null;
};
const val = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : null;
};
const song = opt('--song');
const lyrics = opt('--lyrics');
const title = val('--title');
const presetArg = val('--preset');

const PRESETS = {
  moon: ['月亮', '星空', '夜', '温柔', '治愈', '安静'],
  wave: ['海', '浪', '雨', '水', '风', '流动', '自由'],
  city: ['城市', '街', '灯', '霓虹', '车', '节奏', '电子'],
  grid: ['未来', '代码', '数字', '路', '线', '科技', '赛博', '秩序'],
  petal: ['花', '春', '开', '暖', '心', '爱', '光', '生长'],
  dune: ['山', '沙', '远方', '旅', '日落', '旷野', '公路', '孤独'],
};

if (!args[0]) {
  console.error('用法：node scripts/scaffold.mjs <目标目录> [--song 歌.mp3] [--lyrics 歌词.txt] [--title "歌名"] [--preset moon|wave|city|grid|petal|dune|auto]');
  process.exit(1);
}
if (fs.existsSync(target) && fs.readdirSync(target).length > 0) {
  console.error(`目标目录不是空的：${target}\n换一个空目录，或先清空它。`);
  process.exit(1);
}
if (song && !fs.existsSync(song)) {
  console.error(`找不到歌：${song}`);
  process.exit(1);
}

// auto：按歌词关键词给一个起点。分镜时仍应人工确认，别把推荐当定论。
let preset = presetArg ?? 'moon';
if (presetArg === 'auto') {
  const text = lyrics && fs.existsSync(lyrics) ? fs.readFileSync(lyrics, 'utf8') : '';
  const ranked = Object.entries(PRESETS)
    .map(([name, words]) => ({ name, score: words.reduce((n, w) => n + (text.includes(w) ? 1 : 0), 0) }))
    .sort((a, b) => b.score - a.score);
  preset = ranked[0].score > 0 ? ranked[0].name : 'moon';
  console.log(`歌词关键词推荐视觉预设：${preset}${ranked[0].score === 0 ? '（未命中关键词，用默认）' : ''}`);
}
if (!Object.hasOwn(PRESETS, preset)) {
  console.error(`未知预设：${preset}\n可用：${Object.keys(PRESETS).join(' / ')} / auto`);
  process.exit(1);
}

const copyDir = (from, to) => {
  fs.mkdirSync(to, { recursive: true });
  for (const item of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, item.name);
    const dst = path.join(to, item.name);
    if (item.isDirectory()) copyDir(src, dst);
    else fs.copyFileSync(src, dst);
  }
};

copyDir(path.join(skillRoot, 'assets/scaffold'), target);
copyDir(path.join(skillRoot, 'scripts'), path.join(target, 'tools'));

if (song) {
  fs.copyFileSync(song, path.join(target, 'public/song.mp3'));
  fs.rmSync(path.join(target, 'public/README.txt'), { force: true });
}
if (lyrics) fs.copyFileSync(lyrics, path.join(target, '歌词.txt'));
if (title || presetArg) {
  const p = path.join(target, 'src/content.ts');
  let s = fs.readFileSync(p, 'utf8');
  if (title) s = s.replace("songTitle: '你的歌名'", `songTitle: ${JSON.stringify(title)}`);
  if (presetArg) s = s.replace("preset: 'moon' as PresetName", `preset: '${preset}' as PresetName`);
  fs.writeFileSync(p, s);
}

console.log(`项目已铺好：${target}`);
console.log('');
console.log('现在的状态：');
console.log(`  public/song.mp3      ${song ? '已放入' : '★ 还没有，必须先放一首带人声的歌'}`);
console.log(`  歌词.txt             ${lyrics ? '已放入' : '占位内容，换成真实歌词（标签、空行、句中空格一字不改）'}`);
console.log(`  src/content.ts       歌名 ${title ? `= ${title}` : '还是占位'}，四段秒数是占位值`);
console.log(`  视觉预设             ${preset}（改 src/content.ts 的 preset 一行即可换整套画面）`);
console.log('');
console.log('下一步（顺序别跳）：');
console.log('  1. python3 tools/probe_song.py public/song.mp3   # 量时长、静音间隙、有没有封面流');
console.log('  2. 用 ASR 转写量出第一句和副歌第一句的真实时间，填 src/content.ts 的四段秒数');
console.log('  3. 写 分镜.md：定主意象、视觉预设、四屏构图差异，发给用户等确认');
console.log('  4. npm install --registry=https://registry.npmmirror.com');
console.log('  5. 改 歌词时间轴.json，渲染 20 秒预览让用户听校准');
console.log('  6. 逐屏截图检查，再 npx remotion render src/index.ts Main out/mv.mp4');
console.log('');
console.log('本 Skill 不需要任何 API Key。歌由用户自备。');
