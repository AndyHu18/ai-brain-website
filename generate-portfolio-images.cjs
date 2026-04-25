const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

const API_KEY = "AIzaSyByp7w1f_CCSH8ZlAhY0kfVl3txNSdezAI";
const BACKUP_KEY = "AIzaSyD3k7WcUyKJURDcmfygR_hBb4OuT_kT4ms";
const MODEL = "gemini-3-pro-image-preview";
const OUTPUT_DIR = path.join(__dirname, "images", "portfolio");

const projects = [
  {
    name: "ai-brain",
    prompt: `A premium minimalist hero image for an AI marketing agency website. Abstract neural network visualization with warm orange (#d2691e) and bronze (#cd853f) energy lines flowing through a stylized brain silhouette. Dark brown background (#1a0f0a). Elegant, luxury brand aesthetic similar to Hermes. No text. 16:10 aspect ratio. Photorealistic lighting with warm glow effects.`
  },
  {
    name: "demo-engine",
    prompt: `A futuristic AI chatbot interface concept art. A glowing holographic chat bubble floating above a smartphone screen, with warm orange (#d2691e) light rays emanating from it. Abstract data streams flowing around. Dark elegant background. Premium tech aesthetic. No text, no characters. 16:10 aspect ratio. Clean, modern design.`
  },
  {
    name: "eternel",
    prompt: `A luxury video production brand concept. Cinematic camera lens with black and gold (#c9a96e) color scheme. Golden light flares and bokeh effects against a deep black background (#0a0a0a). Film reel elements subtly integrated. Premium, high-end aesthetic. No text. 16:10 aspect ratio. Dramatic lighting.`
  },
  {
    name: "bloom",
    prompt: `An artistic cosmetic pigment brand concept. Colorful powder pigments exploding in slow motion against a soft white background. Vibrant pinks, corals, earth tones, and metallics mixing in the air. Beauty and art supply aesthetic. Elegant, editorial photography style. No text. 16:10 aspect ratio. Soft natural lighting.`
  },
  {
    name: "fufu-villa",
    prompt: `A modern wellness community concept. Aerial view of a lush green wellness resort surrounded by nature, with modern architecture blending into the landscape. Warm sunlight filtering through trees. Health, nature, and technology harmony. Premium real estate aesthetic. No text. 16:10 aspect ratio. Golden hour photography.`
  },
  {
    name: "juice-shop",
    prompt: `A vibrant fresh juice bar concept. Tropical fruits (mango, passion fruit, berries, citrus) artfully arranged around elegant glass bottles of colorful cold-pressed juices. Bright, fresh, energetic colors. Clean white marble surface. Premium food photography aesthetic. No text. 16:10 aspect ratio. Natural bright lighting.`
  }
];

async function generateImage(client, project, retryWithBackup) {
  console.log(`Generating: ${project.name}...`);
  try {
    const response = await client.models.generateContent({
      model: MODEL,
      contents: project.prompt,
      config: {
        responseModalities: ["image", "text"],
      }
    });

    if (response.candidates && response.candidates[0]) {
      const parts = response.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData) {
          const buffer = Buffer.from(part.inlineData.data, "base64");
          const filePath = path.join(OUTPUT_DIR, `${project.name}.jpg`);
          fs.writeFileSync(filePath, buffer);
          console.log(`  OK: ${filePath} (${Math.round(buffer.length / 1024)}KB)`);
          return true;
        }
      }
    }
    console.log(`  WARN: No image in response for ${project.name}`);
    return false;
  } catch (err) {
    console.error(`  ERR: ${project.name} - ${err.message}`);
    if (retryWithBackup) {
      console.log(`  Retrying with backup key...`);
      const backupClient = new GoogleGenAI({ apiKey: BACKUP_KEY });
      return generateImage(backupClient, project, false);
    }
    return false;
  }
}

async function main() {
  const client = new GoogleGenAI({ apiKey: API_KEY });

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let success = 0;
  let fail = 0;

  for (const project of projects) {
    const ok = await generateImage(client, project, true);
    if (ok) success++;
    else fail++;
    // Small delay between requests
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`\nDone: ${success} success, ${fail} failed`);
}

main();
