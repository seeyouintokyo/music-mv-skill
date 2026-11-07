#!/usr/bin/env python3
"""量一首歌的真实参数，给分镜和歌词时间轴打底。

用法：python3 probe_song.py public/song.mp3
输出：终端摘要 + 同目录 song-probe.json

只做本地测量，不联网、不需要任何 API Key、不打印密钥。
句级起点脚本测不出来：用 WorkBuddy 的 AudioTranscribe，或 faster-whisper 转写。
"""
import json
import re
import subprocess
import sys
from pathlib import Path

DEFAULT_NOISE = "-38dB"
DEFAULT_MIN_GAP = "0.22"


def sh(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    return (r.stdout or "") + (r.stderr or "")


def probe(src: Path) -> dict:
    out = sh([
        "ffprobe", "-v", "error", "-show_entries",
        "format=duration,bit_rate:stream=index,codec_type,codec_name,channels,sample_rate",
        "-of", "json", str(src),
    ])
    try:
        meta = json.loads(out)
    except json.JSONDecodeError:
        raise SystemExit(f"ffprobe 读不懂这个文件，确认它是有效音频：{src}")

    streams = meta.get("streams", [])
    audio = [s for s in streams if s.get("codec_type") == "audio"]
    covers = [s for s in streams if s.get("codec_name") in ("mjpeg", "png", "bmp")]
    duration = float(meta.get("format", {}).get("duration", 0))

    vol = sh(["ffmpeg", "-hide_banner", "-i", str(src), "-map", "0:a:0",
              "-af", "volumedetect", "-f", "null", "-"])
    mean = re.search(r"mean_volume:\s*([-\d.]+) dB", vol)
    peak = re.search(r"max_volume:\s*([-\d.]+) dB", vol)

    sil = sh(["ffmpeg", "-hide_banner", "-i", str(src), "-map", "0:a:0",
              "-af", f"silencedetect=noise={DEFAULT_NOISE}:d={DEFAULT_MIN_GAP}",
              "-f", "null", "-"])
    starts = [float(x) for x in re.findall(r"silence_start:\s*([\d.]+)", sil)]
    ends = [float(x) for x in re.findall(r"silence_end:\s*([\d.]+)", sil)]
    gaps = [
        {"start": round(s, 2), "end": round(e, 2), "len": round(e - s, 2)}
        for s, e in zip(starts, ends)
    ]

    return {
        "file": str(src),
        "duration": round(duration, 2),
        "audio_streams": len(audio),
        "cover_streams": len(covers),
        "codec": audio[0].get("codec_name") if audio else None,
        "sample_rate": audio[0].get("sample_rate") if audio else None,
        "channels": audio[0].get("channels") if audio else None,
        "mean_volume_db": float(mean.group(1)) if mean else None,
        "peak_volume_db": float(peak.group(1)) if peak else None,
        "silence_gaps": gaps[:40],
        "over_60s": duration > 60,
    }


def main():
    if len(sys.argv) < 2:
        raise SystemExit("用法：python3 probe_song.py <音频文件>")
    src = Path(sys.argv[1]).resolve()
    if not src.exists():
        raise SystemExit(f"找不到文件：{src}")

    d = probe(src)
    dst = src.parent / "song-probe.json"
    dst.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"文件        {src.name}")
    print(f"时长        {d['duration']} 秒" + ("   → 超过 60 秒，MV 必须只取一段" if d["over_60s"] else ""))
    print(f"音频流      {d['audio_streams']} 条 / {d['codec']} / {d['channels']} 声道 / {d['sample_rate']} Hz")
    if d["cover_streams"]:
        print(f"封面流      {d['cover_streams']} 条 → 建议只取音频流：ffmpeg -i 输入 -map 0:a:0 -c:a copy out.mp3")
    print(f"音量        mean {d['mean_volume_db']} dB / peak {d['peak_volume_db']} dB")
    print(f"静音间隙    {len(d['silence_gaps'])} 处（前 12 处，秒）")
    for g in d["silence_gaps"][:12]:
        print(f"            {g['start']:>7.2f} – {g['end']:>7.2f}   ({g['len']:.2f}s)")
    print("")
    print("注意：静音间隙只能划段落，划不了逐句。句级起点要 ASR 转写：")
    print("  · WorkBuddy：AudioTranscribe 工具传这个 mp3")
    print("  · 命令行：faster-whisper / whisper.cpp 带词级时间戳")
    print("拿到「第一句」「副歌第一句」的真实秒数后，填 src/content.ts 的四段秒数，")
    print("再写 歌词时间轴.json；段内等分只是初稿，必须让用户听 20 秒预览校准。")
    print("")
    print(f"完整结果：{dst}")


if __name__ == "__main__":
    main()
