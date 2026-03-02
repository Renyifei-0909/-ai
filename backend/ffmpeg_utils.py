"""使用 ffprobe / ffmpeg 获取视频信息与导出片段。"""
import json
import subprocess
import sys


def get_video_info(file_path: str) -> dict:
    """返回 duration, width, height, fps。"""
    out = subprocess.run(
        [
            "ffprobe",
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            file_path,
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    data = json.loads(out.stdout)
    info = {"duration": 0, "width": 0, "height": 0, "fps": None}
    if data.get("format"):
        info["duration"] = float(data["format"].get("duration", 0) or 0)
    for s in data.get("streams", []):
        if s.get("codec_type") == "video":
            info["width"] = int(s.get("width", 0) or 0)
            info["height"] = int(s.get("height", 0) or 0)
            rf = s.get("r_frame_rate")
            if rf and "/" in rf:
                a, b = rf.split("/", 1)
                try:
                    info["fps"] = float(a) / float(b) if float(b) else None
                except (ValueError, ZeroDivisionError):
                    pass
            break
    return info


def export_video_segment(
    input_path: str,
    output_path: str,
    start: float | None = None,
    end: float | None = None,
) -> None:
    """按时间范围裁剪并导出（-ss 在 -i 前以加快 copy 模式）。"""
    cmd = ["ffmpeg", "-y"]
    if start is not None:
        cmd += ["-ss", str(start)]
    cmd += ["-i", input_path]
    if end is not None:
        duration = end - (start if start is not None else 0)
        if duration > 0:
            cmd += ["-t", str(duration)]
    cmd += ["-c", "copy", output_path]
    subprocess.run(cmd, check=True, capture_output=True)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(1)
    if sys.argv[1] == "info":
        print(json.dumps(get_video_info(sys.argv[2])))
    elif sys.argv[1] == "export":
        export_video_segment(
            sys.argv[2], sys.argv[3],
            float(sys.argv[4]) if len(sys.argv) > 4 and sys.argv[4] else None,
            float(sys.argv[5]) if len(sys.argv) > 5 and sys.argv[5] else None,
        )
