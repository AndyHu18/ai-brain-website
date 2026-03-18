/**
 * Vercel Serverless Function - Claude API Proxy
 * 保護 API Key 不暴露在前端
 * 支援 Claude (主) + Gemini (備)
 */

export default async function handler(req, res) {
  // CORS 處理
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const claudeKey = process.env.ANTHROPIC_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!claudeKey && !geminiKey) {
    return res.status(500).json({
      error: "API key not configured",
      message: "Please set ANTHROPIC_API_KEY or GEMINI_API_KEY in Vercel",
    });
  }

  try {
    // 優先使用 Claude API
    if (claudeKey) {
      return await handleClaude(req, res, claudeKey);
    }
    // Fallback: Gemini API
    return await handleGemini(req, res, geminiKey);
  } catch (error) {
    console.error("Proxy Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}

async function handleClaude(req, res, apiKey) {
  const body = req.body;

  // 從 Gemini 格式轉換為 Claude 格式
  const systemText = body.system_instruction?.parts?.[0]?.text || "";
  const messages = (body.contents || []).map((msg) => ({
    role: msg.role === "model" ? "assistant" : "user",
    content: msg.parts?.map((p) => p.text).join("") || "",
  }));

  const claudeBody = {
    model: "claude-haiku-4-5-20251001",
    max_tokens: body.generationConfig?.maxOutputTokens || 1024,
    system: systemText,
    messages,
  };

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(claudeBody),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Claude API Error:", data);
    return res.status(response.status).json(data);
  }

  // 轉換回 Gemini 格式（前端不需要改）
  const text = data.content?.[0]?.text || "";
  return res.status(200).json({
    candidates: [
      {
        content: {
          parts: [{ text }],
          role: "model",
        },
      },
    ],
  });
}

async function handleGemini(req, res, apiKey) {
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const response = await fetch(geminiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Gemini API Error:", data);
    return res.status(response.status).json(data);
  }

  return res.status(200).json(data);
}
