const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

const API_KEY = "AIzaSyD3k7WcUyKJURDcmfygR_hBb4OuT_kT4ms";
const MODEL = "gemini-3-pro-image-preview";

// Read the existing LINE AI image as base64
const imgPath = path.join(__dirname, "images", "portfolio", "line-ai.jpg");
const imgData = fs.readFileSync(imgPath).toString("base64");

async function main() {
  const client = new GoogleGenAI({ apiKey: API_KEY });
  console.log("Editing LINE AI image with products...");
  try {
    const response = await client.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imgData
              }
            },
            {
              text: "Edit this image: Keep the hand holding phone with LINE app in the foreground exactly as is. Change the background to show a busy e-commerce warehouse or store shelf full of products, packages, and shipping boxes, creating a feeling of high sales volume and hot-selling products. Many colorful product boxes stacked, some with 'SOLD' stickers. Warm lighting. Keep the tech circuit pattern subtly blended. The overall feeling should be: this LINE AI chatbot is driving massive sales."
            }
          ]
        }
      ],
      config: { responseModalities: ["image", "text"] }
    });
    if (response.candidates && response.candidates[0]) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const buf = Buffer.from(part.inlineData.data, "base64");
          const fp = path.join(__dirname, "images", "portfolio", "line-ai-new.jpg");
          fs.writeFileSync(fp, buf);
          console.log("OK: " + fp + " (" + Math.round(buf.length / 1024) + "KB)");
          return;
        }
      }
    }
    console.log("No image returned");
  } catch (err) {
    console.error("ERR: " + err.message.slice(0, 150));
  }
}
main();
