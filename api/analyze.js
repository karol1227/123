import { analyzeWithQwen } from "../lib/qwen-analyze.mjs";

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "仅支持 POST" });
  }

  try {
    const text = String(req.body?.text || "").trim();

    if (!text) {
      return res.status(400).json({ error: "请输入内容" });
    }
    if (text.length > 500) {
      return res.status(400).json({ error: "内容不超过 500 字" });
    }

    const result = await analyzeWithQwen(text);
    return res.status(200).json(result);
  } catch (err) {
    console.error("[analyze]", err.message);
    return res.status(502).json({ error: err.message || "分析失败" });
  }
}
