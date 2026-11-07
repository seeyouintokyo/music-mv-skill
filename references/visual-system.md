# 视觉系统：为什么换首歌不该长得一样

## 问题

v1 的骨架把 `Moon / Orbit / Backdrop / BeatRings` 直接写进四屏场景，还把「换歌只改三处文件、画面代码不用动」当成优点。结果每首歌都是同一个月亮：一个圆慢慢变，加星点和光圈。SKILL.md 里「一个主意象、全片不换题材」被理解成了「元素越少越安全」。

**不换题材 ≠ 不换画面。** 同一个月亮，可以靠景深、镜头、色温、转场、字幕语言做出完全不同的观感。

## 现在的架构

```
src/content.ts 的 preset（一个字符串）
        │
        ▼
src/visual/presets.ts   6 套预设：配色 / 主图形 / 背景 / 转场 / 字幕 / 鼓点 / 叠加层
        │
        ▼
src/visual/theme.ts     getPreset() —— 全片唯一视觉入口
        │
        ▼
src/components/VisualStage.tsx
   ├ BackdropLayer   全屏背景：stars / grain / mesh / glow
   └ 一个 <svg>（三层都画在里面，别拆成多个 svg）
        ├ Extras      光晕 / 云带 / 远山 / 速度线 / 星座连线
        ├ Motif       主图形：disc / wave / bars / grid / petal / ridge
        └ BeatLayer   鼓点反馈：rings / bars / shimmer / pulse
   └ Transition      只在副歌入屏：flash / wipe / zoom / dissolve
```

四屏场景只算 `progress`（主图形推进）、`intensity`（主歌小、副歌大）、`shift`（构图漂移），不再持有任何具体图形。

## 六套预设

| preset | 主图形 | 配色基调 | 转场 | 字幕 | 鼓点 | 适配歌词 |
|---|---|---|---|---|---|---|
| `moon` | 月相 + 陨石坑 | 深蓝 + 冷蓝 / 副歌暖黄 | flash | 淡入居中 | 同心光圈 | 月、星、夜、温柔 |
| `wave` | 7 条正弦波 | 深海青 + 青绿 | dissolve | 上滑 | 星点闪烁 | 海、浪、雨、风 |
| `city` | 26 根频谱竖条 | 紫黑 + 品红 / 琥珀 | wipe | 缩放左对齐 | 底部频谱柱 | 城市、街、灯、电子 |
| `grid` | 透视网格 | 墨黑 + 电蓝 / 亮绿 | zoom | 逐字显现左对齐 | 描边脉冲 | 未来、代码、科技 |
| `petal` | 12 片旋转花瓣 | 暖褐 + 珊瑚 | dissolve | 淡入居中 | 同心光圈 | 花、春、暖、爱 |
| `dune` | 三层山脊 | 沙棕 + 沙金 / 暮紫 | wipe | 上滑 | 星点闪烁 | 山、沙、远方、公路 |

`--preset auto` 会按歌词关键词推荐一个，但**分镜时必须由 AI 结合曲风判断**，别把关键词命中当定论。

## 分镜要多写两件事

1. **选哪个 preset，为什么**。写进 `分镜.md`，等用户确认。
2. **四屏的构图差异**。例如主歌每句横向漂移、副歌推近 5%、尾奏收回；不能只写「月亮慢慢变圆」。

## 怎么新增一套预设

1. `presets.ts` 加 `PresetName` 成员和一条 `VisualPreset`（配色、motif、backdrop、transition、lyric、beat、extras）。
2. 若是新主图形，在 `layers.tsx` 的 `Motif` 里加一个 `if (name === 'xxx')` 分支，返回 SVG 元素数组或 fragment。
3. `scripts/scaffold.mjs` 的 `PRESETS` 关键词表补一条，供 `--preset auto` 用。
4. 跑 `npx tsc --noEmit` + 至少一张 `remotion still` 确认出图。

## 三个踩过的坑

| 现象 | 原因 | 处理 |
|---|---|---|
| 主图形整层不渲染，只剩星点/云带 | `useBass()` 在静音段返回 `NaN`，所有 `r={... + bass}` 变成 `r="NaN"` | `useBass` 已加 `Number.isFinite` 兜底返回 0；新增依赖 bass 的表达式也要防 NaN |
| 三层各画一个 `<svg>` 叠在绝对定位容器里，部分层不出像素 | 多 svg + 绝对定位 + transform 组合下渲染不稳定 | 合成**一个** `<svg>`，各层返回 `<g>` |
| 山脊填充下方出现一条水平细线和左侧斜线 | `path` 闭合底边 `L 540 540 L -540 540 Z` 被 `stroke` 描了出来 | 填充路径不要 `stroke`，轮廓靠色差 |
| 渐变不生效 | `radialGradient` 的 `defs` 放在已卸载的层里，或 id 冲突 | `defs` 放在仍在渲染的 `<g>` 里，id 全片唯一 |

## 硬规则仍然有效

- 动画只能由帧号或音频数据算；禁 CSS 动画、`setTimeout`、`Math.random()`，随机用 Remotion 的 `random(种子)`。
- 鼓点缩放 ≤ `tokens.motion.beatScale`（0.08）。
- 颜色从 `preset.palette` 取，尺寸/字号/节奏从 `tokens.ts` 取，不新造色值。
- 只用圆、线、矩形、SVG path、渐变、文字；不联网、不用外部图片。
- 逐屏截图检查文字溢出、重叠、孤字行。
