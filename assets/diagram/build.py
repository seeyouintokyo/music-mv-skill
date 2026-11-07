#!/usr/bin/env python3
"""生成「工作原理」结构图：SVG（PPT 可编辑）+ HTML（源）+ PNG（2x，需 Chrome 截图）。

设计约束（为了能直接拖进 PowerPoint / Keynote）：
  - 1600×900，16:9
  - 所有样式写成 inline 属性，不用 <style> / class / foreignObject / 外部图片
  - 箭头画成真实 path，不依赖 marker
  - 字体只用系统字体
"""
from pathlib import Path

W, H = 1600, 900
FONT = "'PingFang SC','Microsoft YaHei','Hiragino Sans GB',sans-serif"
MONO = "'SF Mono','Menlo','Consolas',monospace"

C = {
    "bg": "#FFFFFF",
    "ink": "#1A1A1A",
    "sub": "#6B6B6B",
    "tiny": "#8C8C8C",
    "brown": "#B08A6A",
    "red": "#C8452D",
    "card": "#FBF8F1",
    "line": "#E7E1D4",
    "arrow": "#B9B2A2",
    "redbg": "#FBEFEB",
}

p = []
a = p.append


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def rect(x, y, w, h, fill, stroke=None, rx=0, sw=1, dash=None):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    s = f' stroke="{stroke}" stroke-width="{sw}"{d}' if stroke else ""
    a(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}"{s}/>')


def line(x1, y1, x2, y2, color, sw=1.4, dash=None):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    a(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{sw}"{d}/>')


def txt(x, y, s, size=16, fill=None, weight=400, spacing=0, mono=False, anchor="start"):
    fill = fill or C["ink"]
    fam = MONO if mono else FONT
    sp = f' letter-spacing="{spacing}"' if spacing else ""
    a(f'<text x="{x}" y="{y}" font-family="{fam}" font-size="{size}" fill="{fill}" '
      f'font-weight="{weight}"{sp} text-anchor="{anchor}">{esc(s)}</text>')


def arrow_down(x, y1, y2, color=None):
    color = color or C["arrow"]
    line(x, y1, x, y2 - 8, color, 1.6)
    a(f'<path d="M {x-6} {y2-9} L {x} {y2} L {x+6} {y2-9} Z" fill="{color}"/>')


def arrow_right(x1, x2, y, color=None):
    color = color or C["arrow"]
    line(x1, y, x2 - 8, y, color, 1.6)
    a(f'<path d="M {x2-9} {y-6} L {x2} {y} L {x2-9} {y+6} Z" fill="{color}"/>')


def chip(x, y, w, h, label, fill, stroke, size=15, color=None, mono=False):
    rect(x, y, w, h, fill, stroke, rx=9)
    txt(x + 16, y + h / 2 + size * 0.35, label, size, color or C["ink"], mono=mono)


# ── 画布 ────────────────────────────────────────────────────────────────
a(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">')
rect(0, 0, W, H, C["bg"])

# ── 标题 ────────────────────────────────────────────────────────────────
txt(72, 62, "WORKBUDDY SKILL  /  MUSIC MV", 13, C["brown"], spacing=4, mono=True)
txt(72, 118, "音乐 MV Skill 是怎么跑起来的", 42, C["ink"], weight=600, spacing=1)
txt(72, 156, "给一首带人声的歌 + 歌词，产出一条 ≤60 秒竖屏 mp4", 18, C["sub"])

# 右上角：输入提醒
rect(1088, 52, 440, 108, C["card"], C["line"], rx=12)
txt(1112, 82, "唯一需要你提供的", 13, C["tiny"], spacing=2)
txt(1112, 112, "song.mp3（带人声）· 歌词.txt", 18, C["ink"], weight=500)
txt(1112, 140, "本 Skill 不生成歌，不需要 API Key", 14, C["red"])

# ── 输入条 ──────────────────────────────────────────────────────────────
rect(72, 206, 1456, 62, C["card"], C["line"], rx=12)
txt(96, 244, "输入", 14, C["brown"], spacing=3, weight=600)
chip(160, 219, 250, 36, "song.mp3  带人声", C["bg"], C["line"], 15)
chip(424, 219, 292, 36, "歌词.txt  一字不改", C["bg"], C["line"], 15)
txt(760, 244, "段落标签 / 空行 / 句中空格都要保留", 14, C["sub"])
txt(1496, 244, "两次人工确认", 14, C["red"], anchor="end", weight=600)

arrow_down(200, 272, 326, C["arrow"])

# ── 主干五卡 ────────────────────────────────────────────────────────────
CX = [72, 372, 672, 972, 1272]
CW, CY, CH = 256, 330, 184

cards = [
    ("01", "先探歌", ["ffprobe 量时长、查封面流", "ASR 量出人声起点", "没歌就停，不搭项目"], "probe_song.py"),
    ("02", "写分镜", ["四屏对应四个段落", "从歌词挑一个主意象", "全片不换题材"], "分镜.md"),
    ("03", "铺项目", ["Remotion 骨架 + tokens", "四屏组件、歌词层、鼓点", "换歌只改三处文件"], "scaffold.mjs"),
    ("04", "对时间轴", ["按真实人声排每一句", "渲染 20 秒预览", "按反馈改到对上"], "歌词时间轴.json"),
    ("05", "画面与渲染", ["逐屏写、逐屏截图检查", "tsc + 鼓点联动验证", "导出 ≤60 秒竖屏 mp4"], "out/mv.mp4"),
]

# 人工确认胶囊（挂在卡片 2 / 4 上方）
rect(CX[1], 286, CW, 28, C["redbg"], None, rx=8)
txt(CX[1] + 14, 305, "① 等用户确认分镜", 13, C["red"], weight=600)
rect(CX[3], 286, CW, 28, C["redbg"], None, rx=8)
txt(CX[3] + 14, 305, "② 听预览校准歌词", 13, C["red"], weight=600)
arrow_down(CX[1] + CW / 2, 314, 330, C["red"])
arrow_down(CX[3] + CW / 2, 314, 330, C["red"])

for i, (num, title, desc, out) in enumerate(cards):
    x = CX[i]
    rect(x, CY, CW, CH, C["card"], C["line"], rx=14)
    txt(x + 20, CY + 32, num, 13, C["brown"], mono=True, spacing=2)
    txt(x + 20, CY + 70, title, 24, C["ink"], weight=600)
    for j, d in enumerate(desc):
        txt(x + 20, CY + 102 + j * 22, d, 14, C["sub"])
    line(x + 20, CY + 158, x + CW - 20, CY + 158, C["line"], 1)
    txt(x + 20, CY + 177, out, 12, C["red"], mono=True)

for i in range(4):
    arrow_right(CX[i] + CW + 4, CX[i + 1] - 4, CY + 92)

# ── 产出条 ──────────────────────────────────────────────────────────────
arrow_down(1400, 514, 552)
rect(72, 556, 1456, 72, C["card"], C["line"], rx=12)
txt(96, 599, "产出", 14, C["brown"], spacing=3, weight=600)
chip(160, 574, 190, 36, "mv.mp4  ≤60s", C["bg"], C["line"], 15)
chip(366, 574, 176, 36, "分镜.md", C["bg"], C["line"], 15)
chip(558, 574, 232, 36, "歌词时间轴.json", C["bg"], C["line"], 15)
chip(806, 574, 260, 36, "完整 Remotion 工程", C["bg"], C["line"], 15)
txt(1496, 599, "画面全由代码画出，零外部素材", 14, C["sub"], anchor="end")

# ── 底部：三条硬规则 ────────────────────────────────────────────────────
rect(72, 662, 1456, 166, "#FCFAF5", C["line"], rx=14)
txt(96, 694, "三条硬规则  /  都是踩过坑才定下来的", 13, C["brown"], spacing=2, mono=True)

# 手动断成均衡两行，别按字数硬切——硬切会切出只剩一个字的孤行。
rules = [
    ("先探歌，没歌不搭项目", "曾先渲染完一版占位伴奏，才发现歌生成不了", "整条链路白跑"),
    ("时间从真实人声来", "不按 BPM 猜；歌长于 60 秒先算副歌对齐", "再决定裁不裁，别把人声整体提前"),
    ("歌词一字不改", "句中空格是字幕折行点", "改了会出现只剩一个字的孤行"),
]
for i, (t, l1, l2) in enumerate(rules):
    x = 96 + i * 480
    if i:
        line(x - 24, 716, x - 24, 806, C["line"], 1)
    txt(x, 748, f"0{i+1}", 13, C["red"], mono=True)
    txt(x + 34, 748, t, 20, C["ink"], weight=600)
    txt(x, 782, l1, 13, C["sub"])
    txt(x, 804, l2, 13, C["sub"])

txt(72, 866, "music-mv · MIT · 微信 staraiwork", 13, C["tiny"], mono=True)
txt(1528, 866, "结构图 SVG 可直接拖进 PPT，右键「转换为形状」逐个元素编辑", 13, C["tiny"], anchor="end")

a("</svg>")

svg = "\n".join(p)
here = Path(__file__).resolve().parent
(here / "工作原理.svg").write_text(svg, encoding="utf-8")
(here / "工作原理.html").write_text(
    '<!DOCTYPE html>\n<html lang="zh-CN">\n<head><meta charset="utf-8">\n'
    '<style>html,body{margin:0;padding:0;background:#FFFFFF}svg{display:block}</style>\n'
    '</head>\n<body>\n' + svg + '\n</body>\n</html>\n',
    encoding="utf-8",
)
print("已生成 工作原理.svg / 工作原理.html")
print("PNG 用 Chrome 截：")
print(f'  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu '
      f'--force-device-scale-factor=2 --window-size={W},{H} '
      f'--screenshot="{here}/工作原理.png" "file://{here}/工作原理.html"')
