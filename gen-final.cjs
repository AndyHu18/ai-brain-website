const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

const API_KEY = "AIzaSyD3k7WcUyKJURDcmfygR_hBb4OuT_kT4ms";
const MODEL = "gemini-3-pro-image-preview";
const OUTPUT_DIR = path.join(__dirname, "images", "portfolio", "options");

const projects = [
  {
    name: "eternel-new",
    prompts: [
      "Extreme close-up of exquisite diamond engagement rings on black velvet. Multiple rings with different cuts (round, princess, oval) catching dramatic golden spotlight. Macro photography, shallow depth of field, sparkling reflections. Luxury jewelry advertisement. No people, no hands. 16:10.",
      "Top-down flat lay of luxury gold and diamond jewelry pieces on dark marble surface. Necklace chain flowing elegantly, earrings, bracelet, all catching warm golden light. Premium jewelry catalog photography. No people. 16:10.",
      "Close-up macro shot of a single stunning emerald-cut diamond ring on a reflective black surface. Rainbow light refractions through the stone. Dramatic cinematic lighting with warm gold accents. Ultra premium jewelry photography. No people. 16:10.",
      "Artistic arrangement of luxury pearl and diamond necklaces draped over black silk fabric. Soft golden backlighting creating a halo effect. Intimate, editorial jewelry photography style. No people, no hands. 16:10.",
      "Collection of luxury watches and bracelets with diamonds on polished dark wood surface. Warm golden hour light from the side. Premium brand product photography. Extreme detail, every gem facet visible. No people. 16:10."
    ]
  },
  {
    name: "bloom-new",
    prompts: [
      "A professional Taiwanese female microblading artist carefully working on a client's eyebrows. Close-up of hands holding microblading pen, colorful pigment bottles lined up nearby. Clean white aesthetic clinic setting. Warm professional lighting. 16:10.",
      "Beautiful Taiwanese woman showing off her perfectly microbladed eyebrows in a mirror at a premium beauty salon. Soft pink and white interior. Array of professional semi-permanent pigment bottles in gradient colors on the counter. 16:10.",
      "Overhead view of a Taiwanese aesthetician's workstation: rows of colorful semi-permanent pigment bottles arranged in a rainbow gradient, microblading tools, practice skin, and color swatches on a clean white surface. Premium beauty brand aesthetic. 16:10.",
      "A young Taiwanese female beauty instructor teaching microblading technique to students in a bright modern classroom. Color pigment bottles and practice materials on the table. Professional training atmosphere. Warm natural light. 16:10.",
      "Close-up of a Taiwanese woman's face showing beautiful natural-looking microbladed eyebrows result. Soft beauty lighting, clean skin, natural makeup. Professional before-after reveal style. Premium beauty clinic aesthetic. 16:10."
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
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const buf = Buffer.from(part.inlineData.data, "base64");
          const fp = path.join(OUTPUT_DIR, label + ".jpg");
          fs.writeFileSync(fp, buf);
          console.log("  [" + label + "] OK (" + Math.round(buf.length / 1024) + "KB)");
          return true;
        }
      }
    }
    console.log("  [" + label + "] no image");
    return false;
  } catch (err) {
    console.error("  [" + label + "] ERR: " + err.message.slice(0, 80));
    return false;
  }
}

async function main() {
  const client = new GoogleGenAI({ apiKey: API_KEY });
  let ok = 0, total = 0;
  for (const project of projects) {
    console.log("\n=== " + project.name + " ===");
    for (let i = 0; i < project.prompts.length; i++) {
      total++;
      if (await generateImage(client, project.name, project.prompts[i], i)) ok++;
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  console.log("\n\nDone: " + ok + "/" + total);
}
main();
