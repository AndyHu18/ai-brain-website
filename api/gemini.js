/**
 * Vercel Serverless Function - Gemini API Proxy
 * Used by: PremiumInfographic (image generation)
 * Replaces Cloudflare Worker to avoid rate limits
 */

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey)
    return res.status(500).json({ error: "GEMINI_API_KEY not configured" });

  const body = req.body;
  const model = body.model || "gemini-2.0-flash";

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: body.contents,
        generationConfig: body.generationConfig,
        systemInstruction: body.systemInstruction || body.system_instruction,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Gemini Proxy Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
