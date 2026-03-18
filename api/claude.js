/**
 * Vercel Serverless Function - Claude API Proxy
 * Used by: PremiumPodcast (script generation)
 * Accepts Claude-native format (model, system, messages)
 * Replaces Cloudflare Worker to avoid rate limits
 */

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey)
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });

  const body = req.body;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: body.model || "claude-haiku-4-5-20251001",
        max_tokens: body.max_tokens || 2000,
        system: body.system || "",
        temperature: body.temperature || 0.7,
        messages: body.messages || [],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Claude API Error:", data);
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Claude Proxy Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
