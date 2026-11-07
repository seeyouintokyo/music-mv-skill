#!/usr/bin/env python3
"""生成「工作原理」结构图（绿色精简版）：SVG（PPT 可编辑）+ HTML（源）+ PNG（2x，需 Chrome 截图）。

设计约束（为了能直接拖进 PowerPoint / Keynote）：
  - 1600×900，16:9，与 PPT 页面同比例
  - 只保留上部流程结构：标题 / 输入 / 五步 / 产出，不要底部说明与页脚
  - 配色对齐 PPT「第二条：音乐 MV，先有歌」：亮绿点缀 + 浅绿卡片 + 深墨蓝黑块
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
    "ink": "#1B1F35",        # PPT 标题 / 深色卡
    "sub": "#6E7686",        # 灰说明
    "tiny": "#9AA2AE",
    "green": "#00C08B",      # 竖条、色块
    "greenDeep": "#009B6C",  # 浅底上的绿字（保证可读）
    "greenBright": "#3DDC97",  # 深底上的亮绿字
    "greenPale": "#EAF7F0",  # 浅绿卡片
    "greenLine": "#CFEBDD",  # 浅绿描边
    "line": "#E5EAE7",
    "arrow": "#A9CDBB",
    "dark": "#1B1F35",       # 人工确认胶囊
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

# ── 标题：绿竖条 + 深墨标题（对齐 PPT 页内标题样式）─────────────────────
rect(72, 150, 6, 46, C["green"])
txt(96, 188, "音乐 MV Skill 是怎么跑起来的", 40, C["ink"], weight=600)
txt(96, 228, "给一首带人声的歌 + 歌词，产出一条 ≤60 秒竖屏 mp4", 17, C["sub"])

# ── 输入条 ──────────────────────────────────────────────────────────────
rect(72, 278, 1456, 64, C["bg"], C["line"], rx=14)
txt(96, 318, "输入", 14, C["greenDeep"], spacing=3, weight=600)
chip(160, 292, 250, 36, "song.mp3  带人声", C["bg"], C["line"], 15)
chip(424, 292, 292, 36, "歌词.txt  一字不改", C["bg"], C["line"], 15)
txt(760, 318, "不需要 API Key、不需要外部素材", 14, C["sub"])
txt(1496, 318, "两次人工确认", 14, C["greenDeep"], anchor="end", weight=600)

arrow_down(200, 342, 408)

# ── 主干五卡 ────────────────────────────────────────────────────────────
CX = [72, 372, 672, 972, 1272]
CW, CY, CH = 256, 426, 200

cards = [
    ("01", "先探歌", ["ffprobe 量时长、ASR 找人声起点", "没歌就停，不搭项目"], "probe_song.py"),
    ("02", "写分镜", ["四屏对应四个段落，一个主意象", "全片不换题材"], "分镜.md"),
    ("03", "铺项目", ["Remotion 骨架 + 四屏组件", "换歌只改三处文件"], "scaffold.mjs"),
    ("04", "对时间轴", ["按真实人声排每一句", "20 秒预览，听校准"], "歌词时间轴.json"),
    ("05", "画面与渲染", ["逐屏截图检查、验证鼓点", "导出 ≤60 秒竖屏 mp4"], "out/mv.mp4"),
]

# 人工确认胶囊（深墨底 + 亮绿字，呼应 PPT 右侧深色卡）
rect(CX[1], 374, CW, 28, C["dark"], None, rx=8)
txt(CX[1] + 14, 393, "① 等用户确认分镜", 13, C["greenBright"], weight=600)
rect(CX[3], 374, CW, 28, C["dark"], None, rx=8)
txt(CX[3] + 14, 393, "② 听预览校准歌词", 13, C["greenBright"], weight=600)
arrow_down(CX[1] + CW / 2, 402, 426, C["green"])
arrow_down(CX[3] + CW / 2, 402, 426, C["green"])

for i, (num, title, desc, out) in enumerate(cards):
    x = CX[i]
    rect(x, CY, CW, CH, C["greenPale"], C["greenLine"], rx=14)
    txt(x + 20, CY + 32, num, 13, C["greenDeep"], mono=True, spacing=2)
    txt(x + 20, CY + 72, title, 24, C["ink"], weight=600)
    for j, d in enumerate(desc):
        txt(x + 20, CY + 108 + j * 22, d, 14, C["sub"])
    line(x + 20, CY + 152, x + CW - 20, CY + 152, C["greenLine"], 1)
    txt(x + 20, CY + 180, out, 12, C["greenDeep"], mono=True)

for i in range(4):
    arrow_right(CX[i] + CW + 4, CX[i + 1] - 4, CY + 100)

# ── 产出条 ──────────────────────────────────────────────────────────────
arrow_down(1400, 626, 674)
rect(72, 678, 1456, 72, C["greenPale"], None, rx=14)
txt(96, 721, "产出", 14, C["greenDeep"], spacing=3, weight=600)
chip(160, 696, 190, 36, "mv.mp4  ≤60s", C["bg"], C["greenLine"], 15)
chip(366, 696, 176, 36, "分镜.md", C["bg"], C["greenLine"], 15)
chip(558, 696, 232, 36, "歌词时间轴.json", C["bg"], C["greenLine"], 15)
chip(806, 696, 260, 36, "完整 Remotion 工程", C["bg"], C["greenLine"], 15)
txt(1496, 721, "画面全部由代码画出", 14, C["sub"], anchor="end")

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
print("已生成 工作原理.svg / 工作原理.html（绿色精简版）")
print("PNG 用 Chrome 截：")
print(f'  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu '
      f'--force-device-scale-factor=2 --window-size={W},{H} '
      f'--screenshot="{here}/工作原理.png" "file://{here}/工作原理.html"')
