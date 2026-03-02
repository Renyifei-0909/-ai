import { useState } from "react";

function App() {
  const [videoPath, setVideoPath] = useState(null);
  const [info, setInfo] = useState(null);
  const [status, setStatus] = useState("");

  const api = window.electronAPI;
  const isElectron = !!api;

  const handleSelectFile = async () => {
    if (!api) {
      setStatus("当前为浏览器环境，请使用 Electron 运行");
      return;
    }
    const path = await api.selectVideoFile();
    if (path) {
      setVideoPath(path);
      setStatus("正在读取视频信息…");
      try {
        const i = await api.getVideoInfo(path);
        setInfo({ duration: i.duration, width: i.width, height: i.height });
        setStatus(`已加载: ${path}`);
      } catch (e) {
        setStatus("读取视频信息失败: " + String(e));
      }
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <h1 style={{ marginTop: 0 }}>AI 剪辑</h1>
      {!isElectron && (
        <p style={{ color: "#f59e0b" }}>
          请在项目根目录运行 <code>npm run electron:dev</code> 以启动桌面版。
        </p>
      )}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button
          onClick={handleSelectFile}
          disabled={!isElectron}
          style={{
            padding: "10px 20px",
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: isElectron ? "pointer" : "not-allowed",
          }}
        >
          选择视频文件
        </button>
      </div>
      {info && (
        <div style={{ marginTop: 16, padding: 16, background: "#27272a", borderRadius: 8 }}>
          <p><strong>当前文件：</strong> {videoPath}</p>
          <p>分辨率：{info.width} × {info.height}</p>
          <p>时长：{info.duration.toFixed(1)} 秒</p>
        </div>
      )}
      {status && <p style={{ marginTop: 12, color: "#a1a1aa" }}>{status}</p>}
    </div>
  );
}

export default App;
