const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  selectVideoFile: () => ipcRenderer.invoke("select-video-file"),
  exportVideo: (args) => ipcRenderer.invoke("export-video", args),
  getVideoInfo: (path) => ipcRenderer.invoke("get-video-info", path),
  aiTranscribe: (videoPath) => ipcRenderer.invoke("ai-transcribe", videoPath),
});
