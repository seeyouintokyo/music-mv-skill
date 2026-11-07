---
name: music-mv
description: 用 Remotion 代码画一条竖屏音乐 MV（≤60 秒），歌词跟着真实人声出现、画面跟着鼓点动，导出 mp4。当用户要给一首歌做 MV、做歌词视频、做月相/星空/几何动画 MV，或提到 Remotion MV 时使用。
---

# 音乐 MV Skill

给一首带人声的歌和它的歌词，产出一条 ≤60 秒竖屏 mp4。画面全部由代码画出来，不引外部图片素材。

流程：**探歌 → 分镜（等确认）→ 铺项目 → 时间轴（听预览校准）→ 逐屏写画面、逐屏截图 → 渲染**。

## 一、第一道门：先探歌，别先搭项目

**没有歌就不要开始铺项目。** 这条是硬规则：曾经先渲染完一版占位伴奏，才发现歌生成不了，整条链路白跑。

| 用户要给什么 | 必须？ | 没给怎么办 |
|---|---|---|
| `song.mp3`，**带人声** | 必须 | 停下来向用户要文件。不要用占位伴奏、不要用 TTS 朗读冒充唱歌交差 |
| `歌词.txt`，含段落标签 | 必须 | 停下来要。一字不改，见第三节 |
| 分镜确认 | 必须 | 出了 `分镜.md` 等用户说「可以」再动手 |
| 20 秒预览校准 | 必须 | 让用户听，按「第几句早了/晚了半秒」改 json |
| 歌名 / 主意象 / 画幅 / 时长 | 否 | 歌名取文件名；主意象从歌词里挑一个；竖屏 1080×1920 / 30fps；总长 ≤60 秒 |
| 视觉预设 | 否，但分镜里必须写清选了哪套 | 从 6 套 preset 里挑，见第七节；不是所有歌都该长成月亮 |
| `tokens.ts` | 否 | 用 `assets/tokens.ts`；它只管尺寸/字号/节奏，配色由 preset 决定 |
| API Key | **不需要** | 本 Skill 不生成歌，只消费用户给的文件 |

提示词里已经写明的事（歌从哪来、歌词、横竖屏、时长）直接照做，不要再问。需要用户开口的只有「确认分镜」和「听预览对歌词」两处。

### 歌的三条来源（只认第一条能自动跑）

1. **用户直接给 mp3**（唯一稳妥路线）。复制到 `public/song.mp3`。带封面流的先剥掉：`ffmpeg -i 输入 -map 0:a:0 -c:a copy public/song.mp3`。
2. **用户给音乐生成 API Key**：先探测资格再动手。实测记录：MiniMax 国内站 `api.minimaxi.com` 的音乐接口对新用户返回 **HTTP 410 / status_code 2153**（`This Music API is no longer available to new users`），2026-08-20 起 music-3.0/2.6/2.5/2.0 全部「已下线」，只留历史付费用户。换 4 个网关、5 个模型名、补全参数都是同一个 410，跟余额和调用姿势无关。**充过钱不等于有 API 资格**。国际站 `api.minimax.io` 用国内站 Key 会报 `invalid api key`，两站 Key 不通用。
3. **TTS 合成念白**：明确告诉用户「是朗读不是唱」，只有用户主动点头才做，不许默认交付。

Fish Audio 的 REST API 只有 TTS/ASR/音色克隆，音乐生成只在网页版；`api.fish.audio` 在部分代理环境下还会 CONNECT 502。别把它当音乐生成通道。

要走 API 路线时，Key 只从环境变量或项目 `.env` 读，**不写进代码、分镜、README、日志，也不在回复里打印**。

## 二、六步流程

### 第 1 步：探歌（拿真实数字）

```bash
python3 <skill目录>/scripts/probe_song.py <歌.mp3>
```

拿时长、音量、封面流、静音间隙。静音只能划段落，**划不了逐句**——很多歌句间根本没有静音。逐句起点必须做 ASR 转写（WorkBuddy 的 `AudioTranscribe`，或 faster-whisper / whisper.cpp 带词级时间戳），量出「第一句」「副歌第一句」的真实秒数。

不要用 BPM 猜完就渲染。BPM 只在完全没有转写条件时给初稿，且必须标注「未校准」。

### 第 2 步：写分镜，给用户看

在项目根写 `分镜.md`，表格五列：`屏 / 段落 / 时间 / 画面上有什么、怎么动 / 这段的歌词`。
**一屏对应歌的一段**（前奏、主歌、副歌、尾奏），不按句切。四屏是默认结构。
从歌词里挑**一个主意象**（月亮、星空、海浪、城市灯光……），全片不换题材。
**不换题材不等于不换画面。** 分镜里必须写清两件事：

1. 选哪套视觉预设（`moon / wave / city / grid / petal / dune`），为什么贴合歌词和曲风。
2. 四屏的构图差异——主歌每句怎么换机位、副歌推近多少、尾奏怎么收回。只写「月亮慢慢变圆」不算分镜。

写完发给用户，等确认。

### 第 3 步：铺项目

```bash
node <skill目录>/scripts/scaffold.mjs <项目目录> --song 歌.mp3 --lyrics 歌词.txt --title "歌名"
cd <项目目录>
npm install --registry=https://registry.npmmirror.com
```

铺出的是可运行骨架：`src/scenes/S1–S4` 四屏（只算进度和构图，不持有具体图形）、`src/components/VisualStage.tsx` 通用舞台、`src/visual/` 预设与分层画法、`src/content.ts` 歌名 / 预设 / 四段秒数、根目录 `歌词时间轴.json`。

**换歌改三处**：`public/song.mp3`、`歌词时间轴.json`、`src/content.ts` 的歌名与四段秒数。
**换画面再改一处**：同文件的 `preset` 一个字符串，整套主图形、配色、转场、字幕动效、鼓点反馈一起换。详见第七节和 `references/visual-system.md`。

把第 1 步量到的四段秒数填进 `src/content.ts`，`src/timing.ts` 会自动换算成帧。
分镜阶段定下的视觉预设也写进 `content.ts`：`node scripts/scaffold.mjs <目录> ... --preset wave`（或 `city / grid / petal / dune / moon / auto`）。

### 第 4 步：歌词时间轴 + 20 秒预览，让用户校准

`歌词时间轴.json` 每句一条，时间是**相对 MV 开头的秒数**：

```json
{ "text": "今晚的月亮弯弯", "start": 10.8, "end": 14.5, "section": "Verse" }
```

段内句子等分拆开只是初稿，误差约 ±0.5 秒。**歌词没对上之前不要渲染整片。**

```bash
npx remotion render src/index.ts Main out/preview.mp4 --scale=0.5 --frames=0-599
```

把 20 秒预览发给用户，请他说哪句早了、哪句晚了。按用户的话改 json，再出一次预览，直到对上。前 20 秒对上后，后面按同样偏移推算。

### 第 5 步：一屏一个文件，写完就截图

```bash
npx remotion still src/index.ts Main out/check-S2.png --frame=<这屏中间帧>
```

打开图逐项看：**文字溢出、元素重叠、单字孤行、画面空白**。
实测踩过两次：开场歌名贴到月亮顶边（把 `top` 从 470 挪开）；12 字长句被浏览器硬折行，末行只剩一个「走」字（改成优先在歌词自带空格处折行）。
有问题只改这一屏，改好再写下一屏。

### 第 6 步：渲染与验收

```bash
npx remotion render src/index.ts Main out/mv.mp4
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of default=noprint_wrappers=1 out/mv.mp4
npx tsc --noEmit
```

验收：时长 ≤60 秒、竖屏 1080×1920 / 30fps、h264+aac、类型检查零错误。
把成片音轨抽出来做一次 ASR，确认人声确实进片、没有整体偏移：

```bash
ffmpeg -y -v error -i out/mv.mp4 -t 20 -map 0:a:0 -c:a libmp3lame /tmp/mv_audio_20.mp3
```

## 三、歌词铁律

- **一个字都不改**，包括 `[Intro]/[Verse]/[Chorus]/[Outro]` 标签、段落间空行、**句中的空格**。
- 空格是换气点，也是字幕折行点。`LyricLayer` 的 `split()` 优先按空格折行；12 字以内不折；超过 12 字且无空格才从中间切。改了空格就会出现孤字行。
- `section` 字段只用来归段，不驱动画面；画面段落由 `Series.Sequence` 的帧数决定。
- 歌词和字幕是同一份文本，不要在代码里另写一份。

## 四、时间从哪来 / 长歌怎么截

- 段落边界来自 **ASR 实测的人声时间**，不来自 BPM 估算。
- 歌长于 60 秒时，默认从第一句歌词前 2 秒截到第一遍副歌结束，结尾 2 秒淡出。
  **但先算对齐再决定裁不裁**：实测案例里副歌人声 28.95 秒，与画面 29 秒的入屏闪白天然重合；一旦从 8.8 秒起播，人声整体提前 8.8 秒，四屏全错开。那种情况保留完整前奏、靠 Composition 自然截断更准。把判断和理由写进 `分镜.md`。
- 真要截：`<Audio src={staticFile('song.mp3')} trimBefore={开始秒数 * fps} />`，`歌词时间轴.json` 和节拍分析的帧号**一起减偏移**；`Series.Sequence` 内 `useCurrentFrame()` 是相对帧，读频谱要用 `OFFSET` 换算回整片绝对帧。
- 结尾淡出写在 `src/Video.tsx` 的 `interpolate`，用 `tokens.audio.fadeOut` 帧，不要事后用 ffmpeg 二次处理。

## 五、画面规则

- **配色从 `src/visual/presets.ts` 的 `palette` 取**，尺寸、字号、间距、动画帧数从 `src/tokens.ts` 取，不新造色值。换整套画面改 `content.ts` 的 `preset`。
- 画面分四层：背景层 + 叠加层（光晕/云带/远山/速度线/星座）+ 主图形 + 鼓点层，四层画在**同一个 `<svg>`** 里（各层返回 `<g>`）。别拆成多个绝对定位的 svg，会出现整层不出像素。
- 四边留 `tokens.space.safe`；歌词放中间偏下，字号 `tokens.size.lyric`。
- 只画：圆、线、矩形、SVG path、渐变、文字。不联网、不用外部图片、不用 3D、不画人物。
- **主歌安静，副歌爆发**：主歌元素少、动作慢、颜色暗；副歌更亮、更大、元素更多，入屏可闪白一次（≤6 帧），整体放大约 4%。
- 鼓点用 `@remotion/media-utils` 的 `visualizeAudio` 取低音三档均值驱动缩放，幅度 ≤ `tokens.motion.beatScale`（0.08）。别晃得人头晕。
- 动画只能由当前帧号或音频数据算出来。**禁用 CSS 动画、`setTimeout`、`Math.random()`**；要随机用 Remotion 的 `random('种子')`。统一缓动 `Easing.bezier(...tokens.motion.ease)`。
- 单屏代码 ≤150 行，复杂就拆 `components/`。

具体画法（月相 SVG path、同心光圈、轨道弧、星点 stagger、歌词折行、鼓点联动）见 `references/remotion-recipes.md`；**视觉预设系统与新增母题的方法见 `references/visual-system.md`**；歌的来源与踩坑全记录见 `references/song-sources.md`。

## 六、常见失败

| 现象 | 处理 |
|---|---|
| 音乐 API 返回 410 / 2153 | 账号资格问题，不是余额也不是参数。停下来请用户给 mp3，别反复重试 |
| `invalid api key` | 国内站 Key 打到了国际站（或反之）。`api.minimaxi.com` ↔ `api.minimax.io` 两站 Key 不通用 |
| 歌带封面流导致时长/解码异常 | `ffmpeg -i 输入 -map 0:a:0 -c:a copy out.mp3` 只留音频 |
| 长句末行只剩一个字 | 优先按歌词自带空格折行，见第三节 |
| 主图形整层消失，只剩星点/云带 | `useBass()` 在静音段返回 NaN，所有 `r={... + bass}` 变成 `r="NaN"`。已加 `Number.isFinite` 兜底；新增依赖 bass 的表达式仍要防 NaN |
| 山脊下方多出一条水平细线 | 填充 path 的闭合底边被 `stroke` 描出来了，填充路径不要 stroke |
| 画面不跟鼓点 | 检查 `useAudioData` 读的是不是 `song.mp3`；截过歌的帧号有没有加偏移 |
| 人声整体比字幕早 | 裁切偏移没同步减到时间轴和节拍帧号；或根本不该裁，见第四节 |
| `npm install` 慢 / 报网络错 | 加 `--registry=https://registry.npmmirror.com` |
| 渲染时下载浏览器失败 | 加 `--browser-executable="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`，Windows 换 `C:\Program Files\Google\Chrome\Application\chrome.exe` |
| 中文变方块 | 字体走 `tokens.font.family`，不要引网络字体 |
| 画面每次渲染不一样 | 用了 `Math.random()` 或 CSS 动画 |
| 截图里没元素 | 透明度动画还没开始，换靠后的帧 |

同一条命令 3 分钟没进度就停下来告诉用户卡在哪。同一个报错连修 3 次不好就停下来，把报错原文和试过的办法交给用户。

## 七、视觉预设系统

改 `src/content.ts` 的 `preset` 一个字符串，整套画面一起换。四屏代码和舞台组件不用动。

| preset | 主图形 | 配色基调 | 转场 | 字幕 | 鼓点 | 适配歌词 |
|---|---|---|---|---|---|---|
| `moon` | 月相 + 陨石坑 | 深蓝夜空 / 冷蓝 → 副歌暖黄 | 闪白 | 淡入居中 | 同心光圈 | 月、星、夜、温柔 |
| `wave` | 多条正弦波 | 深海青 / 青绿 | 溶解 | 上滑 | 星点闪烁 | 海、浪、雨、风 |
| `city` | 频谱竖条 | 紫黑 / 品红 + 琥珀 | 横扫 | 缩放左对齐 | 底部频谱柱 | 城市、街、灯、电子 |
| `grid` | 透视网格 | 墨黑 / 电蓝 + 亮绿 | 缩放入屏 | 逐字显现 | 描边脉冲 | 未来、代码、科技 |
| `petal` | 旋转花瓣 | 暖褐 / 珊瑚 | 溶解 | 淡入居中 | 同心光圈 | 花、春、暖、爱 |
| `dune` | 三层山脊 | 沙棕 / 沙金 + 暮紫 | 横扫 | 上滑 | 星点闪烁 | 山、沙、远方、公路 |

- `--preset auto` 按歌词关键词推荐，**只是起点**；分镜时 AI 必须结合曲风自己判断。
- 每套预设还带 `extras`（光晕 / 云带 / 远山 / 速度线 / 星座连线），用来做景深，避免一屏只有一个图形。
- 副歌自动把主图形从 `primary` 换成 `accent`、整体推近 5%；主歌每句横向漂移换构图。这些是舞台层行为，换预设照样生效。
- 新增母题、分层架构、SVG 合并与 NaN 兜底的原因，全写在 `references/visual-system.md`。

## 八、仓库边界

- 本 Skill **不带任何歌曲文件、不带 API Key、不带成片 mp4**。用户的歌版权归用户，只放在他自己项目的 `public/`。
- 示例 `examples/moon/` 只给源码、分镜、时间轴和静帧，不给音频。
- 需要 Key 的脚本只从环境变量读，日志和回复都不回显明文。
