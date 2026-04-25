const fs = require("fs");
const path = require("path");

const API_KEY = "AIzaSyD3k7WcUyKJURDcmfygR_hBb4OuT_kT4ms";
const MODEL = "gemini-3-pro-image-preview";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

async function main() {
  const prompt = `A premium podcast recording studio with two Taiwanese hosts - a confident woman in her early 30s wearing a warm burnt-orange blazer over a black top, and a sharp-looking man in his mid-30s wearing a dark charcoal suit with a subtle orange pocket square. They sit at a sleek modern broadcast desk with professional condenser microphones on boom arms.

The studio has warm amber and burnt-orange accent lighting, dark walls with acoustic panels, and a softly glowing neon sign reading "AI BRAIN" in warm orange on the back wall. A large monitor behind them shows abstract AI neural network visualizations in orange and gold tones. The desk has subtle LED underglow in warm orange.

They are mid-conversation, both looking engaged and natural - the woman is making a point with a slight smile, the man is nodding thoughtfully. The atmosphere is professional yet approachable, like a premium tech podcast studio.

Photorealistic, cinematic lighting with warm color temperature, shallow depth of field, wide-angle shot, 4K quality. The overall color palette emphasizes warm oranges (#d2691e), deep blacks, and golden accents.`;

  console.log("Generating AI Brain broadcast studio image...");

  const response = await fetch(
    `${API_BASE}/models/${MODEL}:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseModalities: ["IMAGE", "TEXT"],
        },
      }),
    },
  );

  if (!response.ok) {
    const errText = await response.text();
    console.error("API Error:", response.status, errText);
    return;
  }

  const result = await response.json();

  if (result.candidates && result.candidates[0]) {
    const parts = result.candidates[0].content.parts;
    for (const part of parts) {
      if (part.inlineData) {
        const imageData = Buffer.from(part.inlineData.data, "base64");
        const mimeType = part.inlineData.mimeType;
        const ext = mimeType.includes("png") ? "png" : "jpg";
        const outPath = path.join(
          __dirname,
          "images",
          "podcast",
          `broadcast-studio.${ext}`,
        );
        fs.writeFileSync(outPath, imageData);
        console.log("Image saved to:", outPath);
        console.log("Size:", (imageData.length / 1024).toFixed(1), "KB");
        return;
      }
    }
    console.error("No image data in response");
    console.log(
      "Response parts:",
      JSON.stringify(parts.map((p) => Object.keys(p))),
    );
  } else {
    console.error("No candidates in response");
    console.log(JSON.stringify(result).slice(0, 500));
  }
}

main().catch(console.error);
