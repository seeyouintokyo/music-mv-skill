# 歌从哪来：实测记录与判断依据

这一篇记录的是**实际调过的接口和踩过的坑**，不是推测。结论先行：**让用户直接给 mp3，是唯一不需要看账号资格的路线。**

## 1. 三条路线对比

| 路线 | 能不能自动跑 | 卡点 |
|---|---|---|
| 用户给带人声的 mp3 | ✅ 能 | 无。转写、对齐、渲染全部本地完成 |
| 音乐生成 API（MiniMax 等） | ❌ 多数账号不行 | 资格判定，不是余额、不是参数 |
| TTS 合成念白 | ⚠️ 能但不是歌 | 是朗读，没有旋律，不能冒充「带人声的歌」 |

## 2. MiniMax 音乐 API：410 / 2153

**实测环境**：国内站 Key，`sk-api-` 开头 126 位，存于套件 `.env`。

**鉴权是通的**：同一把 Key 调 `POST https://api.minimaxi.com/v1/t2a_v2`（TTS）能正常返回参数校验错误，说明 Key 有效、账户可用。

**音乐接口被账号资格拦住**：

```
POST https://api.minimaxi.com/v1/music_generation
→ HTTP 410
  status_code 2153
  "This Music API is no longer available to new users.
   Existing paying customers can continue to use the service."
```

试过的组合，返回完全一致：

| 维度 | 试过的值 |
|---|---|
| 网关 | `api.minimax.io` / `api.minimaxi.com` / `api.minimax.cn` / `api.minimaxi.cn` |
| 模型 | `music-3.0` / `music-2.6` / `music-2.5` / `music-2.0` / `music-1.5` |
| 参数 | 只给 model、补 prompt、补全 prompt + lyrics 结构化歌词 |

- `.io`（国际站）用国内站 Key → `invalid api key`。**两站 Key 不通用**，别把「invalid api key」误判成 Key 坏了。
- 官方文档与国内定价页：2026-08-20 起音乐生成 / 歌词生成付费 API 不再面向新用户，music-3.0/2.6/2.5/2.0 全部标注「已下线」，只留历史付费用户，新用户引导去 MiniMax Audio 网页版。
- **充过钱不解决这个**：充值给的是余额/网页版额度，API 门槛看的是 8-20 之前是否已付费。

## 3. Fish Audio：能力不对口 + 网络不通

- 官方 REST API 只有 TTS（s2.1-pro / s2.1-pro-free）、ASR、音色克隆、流式。
- 「Music & Sound Effects 生成音乐」明确列在 **"Also in the web app"**，没有公开 API 端点。探测 `/v1/music`、`/v1/music_generation`、`/v1/audio/music`、`/v1/sound_effects` 均不可达。
- S2.1 支持 `[sings softly]` 这类自然语言控制，但本质仍是语音合成，不能按旋律唱指定歌词。
- 本机代理对 `api.fish.audio` 的 CONNECT 稳定 502，绕过代理直连 60 秒超时；`fish.audio` / `docs.fish.audio` / `api.fishaudio.org` 同样被挡。

## 4. WorkBuddy 自带能力边界

自带生成能力只有 `ImageGen`（图）、`VideoGen`（视频）、`AudioTranscribe`（音频转文字，方向相反）。
`VideoGen` 的 `enable_audio` 是画面音效 / 环境声，不能按歌词唱，也产不出可替换进 MV 的 mp3 音轨。
代码能合成钢琴、鼓和旋律（占位伴奏就是 Python 写的），写不出唱歌的人声。

## 5. 网页版手动生成：给用户的提示词模板

用户自己在 MiniMax Audio / 其他音乐网页版生成时，把这段整段给他。歌词一字不改，段落间空行必须保留。

```
生成一首带人声演唱的中文歌：<风格描述，含 BPM>。
只要一段主歌和一段副歌，副歌唱一遍就结束，不要第二段主歌，不要纯音乐，总时长控制在 60 秒以内。
歌词：
[Intro]

[Verse]
第一句
第二句
第三句
第四句

[Chorus]
副歌第一句
副歌第二句
副歌第三句
副歌第四句

[Outro]
收尾那一句
```

三个提醒：
1. 别勾「纯音乐 / instrumental」，必须带人声；网页版能选时长就选最短那档——「60 秒以内」写进描述，模型常常不认。
2. 歌词别改字，尤其句中的空格：MV 字幕按空格折成两行。
3. 生成出两三分钟也别自己剪，直接把 mp3 交给 Skill 处理。

## 6. 拿到 mp3 之后

```bash
python3 scripts/probe_song.py public/song.mp3     # 时长、封面流、音量、静音间隙
```

- 有封面流先剥：`ffmpeg -i 输入 -map 0:a:0 -c:a copy public/song.mp3`
- 句级时间做 ASR 转写，不要靠静音间隙硬猜（很多歌句间没有静音）。
- 长于 60 秒时的裁切判断见 `SKILL.md` 第四节：**先算副歌对齐，再决定裁不裁**。

## 7. Key 处理红线

- Key 只从环境变量或项目 `.env` 读，不写进代码、分镜、README、日志，不在回复里打印。
- 脚本只注入 `os.environ`，明文不进任何输出。
- 本 Skill 的开源仓库里**没有任何 Key、没有任何歌曲文件**。
