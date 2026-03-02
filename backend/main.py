"""Python 后端：视频信息、导出、AI 预留。"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ffmpeg_utils import export_video_segment, get_video_info

app = FastAPI(title="AI 剪辑后端")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class VideoInfoRequest(BaseModel):
    path: str


class ExportRequest(BaseModel):
    inputPath: str
    outputPath: str
    start: float | None = None
    end: float | None = None


class TranscribeRequest(BaseModel):
    videoPath: str


@app.post("/video-info")
def video_info(req: VideoInfoRequest):
    """获取视频时长、分辨率、帧率。"""
    try:
        return get_video_info(req.path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/export")
def export_video(req: ExportRequest):
    """按时间范围导出片段。"""
    try:
        export_video_segment(
            req.inputPath,
            req.outputPath,
            req.start,
            req.end,
        )
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/transcribe")
def ai_transcribe(req: TranscribeRequest):
    """预留：AI 语音转文字。"""
    return {"success": False, "message": "AI 转写尚未实现，请接入 Whisper 等"}


@app.get("/health")
def health():
    return {"status": "ok"}
