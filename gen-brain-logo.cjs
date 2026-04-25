const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

const API_KEY = "AIzaSyD3k7WcUyKJURDcmfygR_hBb4OuT_kT4ms";
const MODEL = "gemini-3-pro-image-preview";
const OUTPUT_DIR = path.join(__dirname, "images", "portfolio", "options");

const prompts = [
  "A futuristic glowing AI brain made of orange (#d2691e) and gold neural network lines, floating in space with transparent background. Around it float holographic labels/tags: 'AI', 'SEO', 'CRM', 'ROI', '24/7'. Clean vector-style illustration with warm orange energy glow. PNG style with no background, just the brain and floating tags. 16:10.",
  "A stylized digital brain icon with warm orange (#d2691e) circuitry patterns. Floating holographic badges orbit around it showing 'AI Analysis', 'Auto Reply', 'Lead Gen', 'Smart CRM'. Transparent/white background. Modern tech illustration, premium quality. The brain emits a warm golden glow. 16:10.",
  "Minimalist AI brain silhouette in warm orange gradient (#d2691e to #cd853f) with floating rectangular label chips around it. Labels read: 'AI', '自動化', '24H', 'ROI', 'SEO'. Clean white background, modern flat design with subtle 3D depth. Premium tech brand aesthetic. 16:10.",
  "A luminous orange AI brain hologram with neural pathways glowing. Surrounded by floating translucent cards/tags showing business metrics: upward arrows, chat icons, clock (24/7), target icon. Pure white background. Premium futuristic illustration. No text on tags, just icons. 16:10.",
  "An abstract warm orange (#d2691e) brain composed of interconnected nodes and data streams. Five floating hexagonal badges orbit around it, each with a simple icon (brain, chat bubble, graph, clock, target). Clean white background, modern tech illustration style. Premium, minimal. 16:10."
];

async function main() {
  const client = new GoogleGenAI({ apiKey: API_KEY });
  for (let i = 0; i < prompts.length; i++) {
    const label = "brain-logo-" + (i + 1);
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
