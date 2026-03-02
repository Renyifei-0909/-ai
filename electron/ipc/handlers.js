const { ipcMain, dialog } = require("electron");

function registerIpcHandlers(backendUrl) {
  ipcMain.handle("select-video-file", async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "视频", extensions: ["mp4", "mov", "avi", "mkv", "webm"] }],
    });
    if (canceled || filePaths.length === 0) return null;
    return filePaths[0];
  });

  ipcMain.handle("get-video-info", async (_, path) => {
    const res = await fetch(`${backendUrl}/video-info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || res.statusText);
    }
    return res.json();
  });

  ipcMain.handle("export-video", async (_, args) => {
    const res = await fetch(`${backendUrl}/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inputPath: args.inputPath,
        outputPath: args.outputPath,
        start: args.start,
        end: args.end,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || res.statusText);
    }
  });

  ipcMain.handle("ai-transcribe", async (_, videoPath) => {
    const res = await fetch(`${backendUrl}/ai/transcribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoPath }),
    });
    return res.json();
  });
}

module.exports = { registerIpcHandlers };
