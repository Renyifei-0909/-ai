const { app, BrowserWindow } = require("electron");
const { join } = require("path");
const { spawn } = require("child_process");

const BACKEND_PORT = 8765;
const BACKEND_URL = `http://127.0.0.1:${BACKEND_PORT}`;

let backendProcess = null;

function getBackendDir() {
  const appDir = join(__dirname, "..");
  if (app.isPackaged && appDir.includes("app.asar")) {
    return appDir.replace("app.asar", "app.asar.unpacked") + join.sep + "backend";
  }
  return join(__dirname, "..", "backend");
}

function startBackend() {
  const backendDir = getBackendDir();
  const isWin = process.platform === "win32";
  const cmd = isWin ? "python" : "python3";
  backendProcess = spawn(cmd, ["-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", String(BACKEND_PORT)], {
    cwd: backendDir,
    stdio: "pipe",
  });
  backendProcess.stderr.on("data", (d) => process.stderr.write(d));
  backendProcess.on("error", (err) => {
    console.error("Backend start error:", err);
  });
}

function waitForBackend(timeoutMs = 10000) {
  const start = Date.now();
  return new Promise((resolve) => {
    function tryFetch() {
      fetch(`${BACKEND_URL}/health`)
        .then((r) => (r.ok ? resolve(true) : tryAgain()))
        .catch(tryAgain);
    }
    function tryAgain() {
      if (Date.now() - start > timeoutMs) return resolve(false);
      setTimeout(tryFetch, 300);
    }
    tryFetch();
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (!app.isPackaged) {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    const distDir = join(__dirname, "..").replace("app.asar", "app.asar.unpacked") + join.sep + "dist";
    win.loadFile(join(distDir, "index.html"));
  }
}

app.whenReady().then(async () => {
  startBackend();
  const ok = await waitForBackend();
  if (!ok) console.warn("Python 后端未在预期时间内启动，请确保已安装 Python 并执行 pip install -r backend/requirements.txt");

  require("./ipc/handlers").registerIpcHandlers(BACKEND_URL);

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (backendProcess) backendProcess.kill();
  if (process.platform !== "darwin") app.quit();
});
