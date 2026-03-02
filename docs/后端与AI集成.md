# 后端与 AI 集成说明

## 一、当前后端能力（Electron 主进程）

- **选择视频文件**：`select-video-file` → 系统对话框，返回路径
- **获取视频信息**：`get-video-info` → 通过 FFmpeg 的 ffprobe 获取时长、分辨率、帧率
- **导出片段**：`export-video` → 使用 fluent-ffmpeg 按起止时间裁剪并导出
- **AI 转写**：`ai-transcribe` → 预留接口，目前返回“未实现”

## 二、FFmpeg 依赖

- 本机需安装 **FFmpeg**（含 ffprobe）。
- macOS: `brew install ffmpeg`
- Windows: 从 https://ffmpeg.org 下载，或将 ffmpeg 加入 PATH。
- 打包时可将 FFmpeg 二进制放入 `resources`，主进程通过 `process.resourcesPath` 指定路径。

## 三、接入 AI 的两种方式

### 方式 A：主进程内调用 Python 脚本（推荐起步）

1. 在项目下建 `ai-service/`，用 Python 写脚本，例如：
   - 使用 **Whisper** 做语音转文字，输出 SRT/JSON
   - 使用 **PySceneDetect** 做场景检测，输出时间点列表

2. 在 `electron/ipc/handlers.ts` 里用 Node 的 `child_process.spawn` 调用：

```ts
import { spawn } from "node:child_process";
import path from "node:path";

ipcMain.handle("ai-transcribe", async (_, videoPath: string) => {
  const script = path.join(__dirname, "../../ai-service/whisper_srt.py");
  return new Promise((resolve, reject) => {
    const proc = spawn("python3", [script, videoPath], { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    let err = "";
    proc.stdout.on("data", (d) => (out += d));
    proc.stderr.on("data", (d) => (err += d));
    proc.on("close", (code) => {
      if (code === 0) resolve(JSON.parse(out));
      else reject(new Error(err || "AI 脚本执行失败"));
    });
  });
});
```

3. 前端通过 `window.electronAPI.aiTranscribe(videoPath)` 调用，拿到字幕或时间点后再做时间线标记或导出时烧录字幕。

### 方式 B：本地 HTTP 服务（适合复杂 AI 流水线）

1. 用 **FastAPI** 或 **Flask** 在本地起一个服务，例如 `http://127.0.0.1:8765`。
2. 提供接口，例如：
   - `POST /transcribe`：上传或传视频路径，返回字幕
   - `POST /scene-detect`：传路径，返回场景切分点
3. Electron 主进程里用 `axios` 或 `fetch` 请求该地址；可随应用启动时用 `spawn` 拉起 Python 服务，退出时 kill。

## 四、后续可扩展的 AI 功能

| 功能         | 实现思路 |
|--------------|----------|
| 智能字幕     | Whisper 转写 → 生成 SRT → FFmpeg 烧录 |
| 场景检测     | PySceneDetect 或 OpenCV 检测切点 → 在时间线打标记 |
| 静音段检测   | FFmpeg 分析音量或 Python 库 → 建议删除/高亮 |
| 自动剪辑建议 | 结合“静音”“重复”“场景”等规则，生成建议片段列表 |

按上述步骤即可在现有「前端 + Electron 主进程 + FFmpeg」骨架上，逐步接入 AI 能力。
