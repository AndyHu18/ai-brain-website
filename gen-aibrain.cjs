const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

const API_KEY = "AIzaSyD3k7WcUyKJURDcmfygR_hBb4OuT_kT4ms";
const MODEL = "gemini-3-pro-image-preview";
const OUTPUT_DIR = path.join(__dirname, "images", "portfolio", "options");

const prompts = [
  "A warm, approachable Asian woman business consultant smiling confidently while presenting holographic AI data visualizations on a tablet. Warm orange (#d2691e) accent lighting. Modern minimalist white office. Premium corporate portrait photography. No text. 16:10.",
  "A friendly Asian male marketing expert in smart casual attire, warmly gesturing while explaining AI analytics on a large touchscreen display. Warm orange glow from the screen. Clean white modern workspace. Professional, approachable. No text. 16:10.",
  "A warm portrait of a young Asian professional woman in an elegant blazer, holding a laptop showing glowing AI brain visualization. Soft warm lighting with orange (#d2691e) highlights. Clean white background. Premium brand photography, friendly smile. No text. 16:10.",
  "An approachable Asian business woman collaborating with a client over a digital tablet showing AI marketing insights. Warm cafe-like coworking space, natural light, orange accent decorations. Human connection meets AI technology. No text. 16:10.",
  "A charismatic Asian male entrepreneur in a modern white office, gesturing enthusiastically while a holographic AI interface with warm orange nodes floats beside him. Confident, warm, approachable. Premium brand lifestyle photography. No text. 16:10."
];

async function main() {
  const client = new GoogleGenAI({ apiKey: API_KEY });
  for (let i = 0; i < prompts.length; i++) {
    const label = "ai-brain-" + (i + 1);
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
            const fp = path.join(OUTPUT_DIR, label + ".jpg");
            fs.writeFileSync(fp, buf);
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
