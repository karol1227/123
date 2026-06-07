import { createServer } from "http";
import { readFile } from "fs/promises";
import { join, extname } from "path";
import { fileURLToPath } from "url";
import { handleAnalyzeRequest } from "./server/analyze.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PORT = 8080;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".wav": "audio/wav",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function resolveFilePath(urlPath) {
  let rel = urlPath.split("?")[0];
  if (rel === "/" || rel === "") rel = "index.html";
  else if (rel.startsWith("/")) rel = rel.slice(1);

  if (rel.startsWith("audio/") || rel.startsWith("images/")) {
    return join(__dirname, "public", rel);
  }
  return join(__dirname, rel);
}

const server = createServer(async (req, res) => {
  const urlPath = req.url?.split("?")[0] || "";

  if (urlPath === "/api/analyze") {
    await handleAnalyzeRequest(req, res);
    return;
  }

  const filePath = resolveFilePath(req.url);

  try {
    const data = await readFile(filePath);
    const ext = extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`\n  心声 · 千问读懂你`);
  console.log(`  本地访问: http://localhost:${PORT}`);
  console.log(`  千问 API: ${process.env.DASHSCOPE_API_KEY ? "已配置" : "未配置（将使用离线模式）"}\n`);
});
