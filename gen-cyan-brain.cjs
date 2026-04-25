const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

const API_KEY = "AIzaSyD3k7WcUyKJURDcmfygR_hBb4OuT_kT4ms";
const MODEL = "gemini-3-pro-image-preview";

const prompt = "A glowing cyan/teal (#00CED1) AI brain made of neural network lines and circuits, floating in space on a pure black background. The brain emits a bright cyan energy glow with electric blue highlights. Detailed neural pathways visible. No text, no labels, no tags. Clean isolated brain only on solid black background. High contrast. 1:1 square aspect ratio.";

async function main() {
  const client = new GoogleGenAI({ apiKey: API_KEY });
  console.log("Generating cyan brain...");
  try {
    const response = await client.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { responseModalities: ["image", "text"] }
    });
    if (response.candidates && response.candidates[0]) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const buf = Buffer.from(part.inlineData.data, "base64");
          const fp = path.join(__dirname, "images", "portfolio", "brain-cyan-raw.jpg");
          fs.writeFileSync(fp, buf);
          console.log("OK: " + fp + " (" + Math.round(buf.length / 1024) + "KB)");
          return;
        }
      }
    }
    console.log("No image returned");
  } catch (err) {
    console.error("ERR: " + err.message.slice(0, 100));
  }
}
main();
