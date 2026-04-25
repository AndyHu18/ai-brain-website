const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

const API_KEY = "AIzaSyD3k7WcUyKJURDcmfygR_hBb4OuT_kT4ms";
const MODEL = "gemini-3-pro-image-preview";
const OUTPUT_DIR = path.join(__dirname, "images", "portfolio", "options");

const prompts = [
  "A confident Taiwanese businessman in a sleek modern office, looking at a large screen showing website analytics with upward growth charts. Warm orange accent lighting, clean white interior. Business success and digital transformation concept. No text on screen. 16:10.",
  "Split screen concept: left side shows a basic static website mockup (dull, grey), right side shows a vibrant AI-powered website with glowing chat bubbles, analytics dashboards and warm orange energy. Transformation visual. Clean white background. 16:10.",
  "A Taiwanese female entrepreneur smiling while her laptop screen glows with warm orange light, multiple notification icons floating around showing new orders, chat messages, and growth metrics. Modern white cafe workspace. Success and automation concept. 16:10.",
  "Abstract visualization of a website transforming: a flat static webpage morphing into a 3D dynamic interface with AI chat bubbles, analytics graphs, and automated workflows. Warm orange (#d2691e) and white color scheme. Premium tech illustration. No text. 16:10.",
  "A happy Taiwanese business owner couple reviewing impressive growth results on a tablet together. Their physical storefront visible through the window behind them. Warm golden lighting, modern interior. Small business digital success story. 16:10."
];

async function main() {
  const client = new GoogleGenAI({ apiKey: API_KEY });
  for (let i = 0; i < prompts.length; i++) {
    const label = "cta-" + (i + 1);
    console.log("[" + label + "] generating...");
    try {
      const response = await client.models.generateContent({
        model: MODEL,
        contents: prompts[i],
        config: { responseModalities: ["image", "text"] }
      });
      if (response.candidates && response.candidates[0]) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const buf = Buffer.from(part.inlineData.data, "base64");
            fs.writeFileSync(path.join(OUTPUT_DIR, label + ".jpg"), buf);
            console.log("[" + label + "] OK (" + Math.round(buf.length / 1024) + "KB)");
            break;
          }
        }
      }
    } catch (err) {
      console.error("[" + label + "] ERR: " + err.message.slice(0, 80));
    }
    await new Promise(r => setTimeout(r, 3000));
  }
  console.log("Done");
}
main();
