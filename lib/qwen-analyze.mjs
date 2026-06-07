const DASHSCOPE_URL =
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
const MODEL = process.env.DASHSCOPE_MODEL || "qwen-plus";

const SYSTEM_PROMPT = `你是「心声」的情感理解助手。你的任务是针对用户说的「这一句话」做精准回应，严禁答非所问、严禁套用与输入无关的通用安慰模板。

输出严格 JSON（不要 markdown 代码块），字段如下：
{
  "literal": "字面理解：逐条复述用户原话中的具体信息（人物、事件、疑问、状态），不要替用户添加未提及的内容",
  "emotional": "情感解读：只针对用户这句话分析情绪、潜台词与心理需求",
  "emotions": ["2-4个情绪标签"],
  "needs": ["1-3个心理需求"],
  "response": "千问想对你说：直接回应用户这句话的核心内容。第一句必须点明用户说的具体事/问题/感受；若用户提问则正面回应；若是倾诉则针对事件共情。禁止空洞套话如「我读到了你的感受」「你不需要解释清楚」。"
}

硬性规则：
- 用户问什么就围绕什么答，不要转移到无关话题
- response 中至少出现用户原话里的一个关键词或同义表达
- 不要假设用户有抑郁症等严重诊断，除非用户明确提到`;

function parseModelJson(content) {
  const trimmed = content.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1].trim() : trimmed;
  const parsed = JSON.parse(raw);

  const required = ["literal", "emotional", "emotions", "needs", "response"];
  for (const key of required) {
    if (!parsed[key]) throw new Error(`缺少字段: ${key}`);
  }
  if (!Array.isArray(parsed.emotions) || !Array.isArray(parsed.needs)) {
    throw new Error("emotions 与 needs 必须为数组");
  }

  return {
    literal: String(parsed.literal).trim(),
    emotional: String(parsed.emotional).trim(),
    emotions: parsed.emotions.map(String).slice(0, 4),
    needs: parsed.needs.map(String).slice(0, 3),
    response: String(parsed.response).trim(),
    source: "qwen",
  };
}

function buildUserMessage(text) {
  return `请分析以下用户输入，并严格针对这句话回应：

用户原话：
「${text}」`;
}

export async function analyzeWithQwen(text) {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    throw new Error("未配置 DASHSCOPE_API_KEY");
  }

  const res = await fetch(DASHSCOPE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.3,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserMessage(text) },
      ],
    }),
  });

  const payload = await res.json();
  if (!res.ok) {
    const msg =
      payload?.error?.message || payload?.message || `API 错误 (${res.status})`;
    throw new Error(msg);
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (!content) throw new Error("模型未返回内容");

  return parseModelJson(content);
}
