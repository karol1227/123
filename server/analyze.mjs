import { loadEnv } from "./load-env.mjs";
import { analyzeWithQwen } from "../lib/qwen-analyze.mjs";

loadEnv();

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 16_000) {
        reject(new Error("请求体过大"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error("无效的 JSON"));
      }
    });
    req.on("error", reject);
  });
}

export { analyzeWithQwen };

export async function handleAnalyzeRequest(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.writeHead(405);
    res.end(JSON.stringify({ error: "仅支持 POST" }));
    return;
  }

  try {
    const body = await readJsonBody(req);
    const text = String(body.text || "").trim();

    if (!text) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: "请输入内容" }));
      return;
    }
    if (text.length > 500) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: "内容不超过 500 字" }));
      return;
    }

    const result = await analyzeWithQwen(text);
    res.writeHead(200);
    res.end(JSON.stringify(result));
  } catch (err) {
    console.error("[analyze]", err.message);
    res.writeHead(502);
    res.end(JSON.stringify({ error: err.message || "分析失败" }));
  }
}
