const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

const API_KEY = "AIzaSyD3k7WcUyKJURDcmfygR_hBb4OuT_kT4ms";
const MODEL = "gemini-3-pro-image-preview";
const OUTPUT_DIR = path.join(__dirname, "images", "portfolio", "options");

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const projects = [
  {
    name: "fufu-villa",
    prompts: [
      "Aerial view of an ultra-luxury wellness resort nestled in lush green mountains with a crystal-clear lake. Modern architecture with floor-to-ceiling glass, infinity pool overlooking misty valleys. Golden hour lighting. Premium real estate advertisement aesthetic. No text. 16:10 aspect ratio.",
      "Elegant elderly couple walking through a manicured Japanese garden in a luxury wellness community. Modern villas with zen architecture in the background, surrounded by pristine nature. Warm golden light filtering through bamboo trees. Premium lifestyle photography. No text. 16:10.",
      "Interior of a luxury wellness villa: minimalist cream and gold design, floor-to-ceiling windows overlooking mountains, smart home panel on wall, orchids on marble table. Spa-like atmosphere. Premium interior design photography. No text. 16:10.",
      "Panoramic view of a high-end health resort campus with terraced gardens, yoga pavilion by a lake, modern medical building, and walking trails through forest. Mountains and mist in background. Drone photography style. No text. 16:10.",
      "A serene wellness spa scene: infinity hot spring pool with mountain view at sunset, stone and wood luxury architecture, steam rising, lanterns glowing warm amber. Premium resort aesthetic. No text. 16:10."
    ]
  },
  {
    name: "eternel",
    prompts: [
      "High-fashion jewelry campaign: elegant woman in black evening gown wearing stunning diamond necklace and earrings, dramatic studio lighting with golden rim light, black velvet background. Editorial luxury jewelry photography. No text. 16:10.",
      "Close-up of a model's hands and neck adorned with exquisite gold and diamond jewelry pieces, warm golden lighting, soft bokeh, black silk fabric background. Luxury jewelry brand campaign aesthetic. No text. 16:10.",
      "Fashion editorial: sophisticated woman at a grand piano wearing pearl and diamond bracelet, elegant updo, golden chandelier light, marble interior. Luxury lifestyle meets jewelry. No text. 16:10.",
      "Dramatic jewelry photography: multiple luxury rings, necklaces and bracelets arranged on a dark marble surface with golden light rays, rose petals scattered, cinematic lighting. Premium jewelry brand aesthetic. No text. 16:10.",
      "Elegant couple at a luxury gala event, woman wearing statement diamond necklace and man in tuxedo, champagne glasses, warm ambient ballroom lighting, soft focus background. Aspirational luxury lifestyle. No text. 16:10."
    ]
  },
  {
    name: "line-ai",
    prompts: [
      "Smartphone showing LINE messaging app with glowing green chat interface, AI chatbot responding with warm orange energy particles around the phone. Dark tech background with circuit patterns. LINE green (#06C755) and warm orange (#d2691e) color scheme. No text except LINE logo. 16:10.",
      "Split screen concept: left side shows a sleeping business owner at night, right side shows their LINE chatbot actively serving multiple customers with green chat bubbles. Warm cozy lighting vs cool tech glow. No text. 16:10.",
      "A busy cafe owner smiling while looking at her phone showing LINE OA dashboard with AI responses. Green LINE accent colors. Coffee shop background with warm lighting. Happy business owner lifestyle. No text. 16:10.",
      "Futuristic holographic LINE chat interface floating above a smartphone, with multiple conversation threads being handled simultaneously by AI. Green (#06C755) neon glow, dark background, tech aesthetic. No text. 16:10.",
      "Minimalist illustration style: a giant LINE green speech bubble transforming into a helpful AI assistant robot, serving multiple happy customers icons. Clean white background, modern flat design with warm orange accents. No text. 16:10."
    ]
  }
];

async function generateImage(client, name, prompt, index) {
  const label = name + "-" + (index + 1);
  console.log("  [" + label + "] generating...");
  try {
    const response = await client.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { responseModalities: ["image", "text"] }
    });
    if (response.candidates && response.candidates[0]) {
      const parts = response.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData) {
          const buffer = Buffer.from(part.inlineData.data, "base64");
          const filePath = path.join(OUTPUT_DIR, label + ".jpg");
          fs.writeFileSync(filePath, buffer);
          console.log("  [" + label + "] OK (" + Math.round(buffer.length / 1024) + "KB)");
          return true;
        }
      }
    }
    console.log("  [" + label + "] no image returned");
    return false;
  } catch (err) {
    console.error("  [" + label + "] ERR: " + err.message.slice(0, 100));
    return false;
  }
}

async function main() {
  const client = new GoogleGenAI({ apiKey: API_KEY });
  let total = 0;
  let ok = 0;

  for (const project of projects) {
    console.log("\n=== " + project.name + " ===");
    for (let i = 0; i < project.prompts.length; i++) {
      total++;
      const success = await generateImage(client, project.name, project.prompts[i], i);
      if (success) ok++;
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  console.log("\n\nDone: " + ok + "/" + total + " images generated");
}

main();
