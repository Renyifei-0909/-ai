/**
 * 打包前将静态前端（index.html、css/、js/）复制到 dist/，供 Electron 加载。
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dist = path.join(root, "dist");

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

if (!fs.existsSync(path.join(root, "index.html"))) {
  console.error("未找到 index.html，请确认在项目根目录执行");
  process.exit(1);
}

if (!fs.existsSync(dist)) fs.mkdirSync(dist, { recursive: true });

copyRecursive(path.join(root, "index.html"), path.join(dist, "index.html"));
if (fs.existsSync(path.join(root, "css"))) {
  copyRecursive(path.join(root, "css"), path.join(dist, "css"));
}
if (fs.existsSync(path.join(root, "js"))) {
  copyRecursive(path.join(root, "js"), path.join(dist, "js"));
}

console.log("已复制静态前端到 dist/");
