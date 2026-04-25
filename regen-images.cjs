const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

const API_KEY = "AIzaSyD3k7WcUyKJURDcmfygR_hBb4OuT_kT4ms";
const MODEL = "gemini-3-pro-image-preview";
const OUTPUT_DIR = path.join(__dirname, "images", "portfolio");

const projects = [
  {
    name: "demo-engine",
    prompt: `A premium concept art of LINE messaging app AI chatbot experience. A sleek smartphone showing a LINE-style green chat interface with AI-powered conversation bubbles glowing with warm orange (#d2691e) energy. The LINE logo green accent blended with warm orange highlights. Dark elegant tech background. No text, no characters, no faces. 16:10 aspect ratio. Premium, luxury brand aesthetic.`
  },
  {
    name: "eternel",
    prompt: `A luxury jewelry brand concept. Exquisite diamond rings and gold necklaces artfully arranged on black velvet with dramatic golden (#c9a96e) spotlight lighting. Sparkling gemstones reflecting light. Ultra premium, high-end jewelry advertisement aesthetic. Black background (#0a0a0a) with warm gold accents. No text, no faces. 16:10 aspect ratio. Editorial jewelry photography.`
  }
];

async function generateImage(client, project) {
  console.log("Generating: " + project.name + "...");
  try {
    const response = await client.models.generateContent({
      model: MODEL,
      contents: project.prompt,
      config: { responseModalities: ["image", "text"] }
    });

    if (response.candidates && response.candidates[0]) {
      const parts = response.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData) {
          const buffer = Buffer.from(part.inlineData.data, "base64");
          const filePath = path.join(OUTPUT_DIR, project.name + ".jpg");
          fs.writeFileSync(filePath, buffer);
          console.log("  OK: " + filePath + " (" + Math.round(buffer.length / 1024) + "KB)");
          return true;
        }
      }
    }
    console.log("  WARN: No image in response");
    return false;
  } catch (err) {
    console.error("  ERR: " + err.message);
    return false;
  }
}

async function main() {
  const client = new GoogleGenAI({ apiKey: API_KEY });
  for (const project of projects) {
    await generateImage(client, project);
    await new Promise(r => setTimeout(r, 2000));
  }
  console.log("Done");
}

main();
