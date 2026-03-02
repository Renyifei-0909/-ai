# AI 剪辑 - 桌面应用

包含前后端的 AI 剪辑桌面应用：**前端 JavaScript（React）**，**后端 Python（FastAPI + FFmpeg）**，Electron 负责桌面壳与桥接。

## 技术栈

- **桌面壳**：Electron（主进程 / 预加载为 JavaScript）
- **前端**：React 18 + JavaScript + Vite
- **后端**：Python 3（FastAPI），提供视频信息、导出、AI 预留接口；视频处理用 FFmpeg（命令行）
- **AI**：后端预留 `/ai/transcribe`，可接入 Whisper 等

## 环境要求

- Node.js 18+
- Python 3.10+（用于运行后端）
- FFmpeg（需在系统 PATH 中能执行 `ffmpeg` 和 `ffprobe`；见 [FFmpeg 安装与使用](docs/FFmpeg安装与使用.md)）

## 安装与运行

```bash
# 依赖
npm install
cd backend && pip install -r requirements.txt && cd ..

# 开发：会先启动 Vite，再启动 Electron；Electron 会自动启动 Python 后端
npm run electron:dev
```

在桌面窗口内点击「选择视频文件」可测试选片与视频信息读取。

## 脚本说明

| 命令 | 说明 |
|------|------|
| `npm run dev` | 仅启动前端（浏览器预览，无 Electron / 后端） |
| `npm run electron:dev` | 启动 Vite + Electron；Electron 内会拉起 Python 后端 |
| `npm run electron:build` | 打包成 macOS/Windows 安装包（输出在 `release/`） |

## 文档

- [实现方案与架构](docs/实现方案.md)
- [主要操作细节](docs/主要操作细节.md)（语言、工具、前后端代码分别放哪里）
- [FFmpeg 安装与使用](docs/FFmpeg安装与使用.md)
- [打包成桌面程序](docs/打包成桌面程序.md)（具体操作步骤）
- [后端与 AI 集成](docs/后端与AI集成.md)

## 项目结构

```
├── electron/           # Electron 主进程与预加载（JavaScript）
│   ├── main.js         # 入口；启动 Python 后端、创建窗口
│   ├── preload.js
│   └── ipc/            # IPC：选文件在 Electron，其余请求转发到 Python
├── backend/            # Python 后端（FastAPI + FFmpeg）
│   ├── main.py         # API：/video-info, /export, /ai/transcribe
│   ├── ffmpeg_utils.py
│   └── requirements.txt
├── src/                # React 前端（JavaScript）
│   ├── main.jsx
│   └── App.jsx
└── package.json
```

后续可在 `src/` 扩展时间线、预览等界面；在 `backend/` 增加 AI 转写、场景检测等接口。
