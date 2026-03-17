/**
 * Premium Infographic Generator
 * Generates vertical infographic cards (1:4 ratio) using Nano Banana 2
 */
const PremiumInfographic = (function () {
  "use strict";

  const GEMINI_API =
    "https://getlove-api-proxy.getlove-ai.workers.dev/api/gemini";
  const MODEL = "gemini-3.1-flash-image-preview";

  /**
   * Main generation pipeline
   * @param {string} industry
   * @param {string} analysisHtml - raw HTML from analysis result
   * @param {function} onProgress - callback(statusText, percentage)
   * @returns {Promise<string[]>} array of base64 image data
   */
  async function generate(industry, analysisHtml, onProgress) {
    // Step 1: Extract key points from analysis
    const points = extractKeyPoints(analysisHtml);
    if (points.length === 0)
      throw new Error("\u7121\u6CD5\u63D0\u53D6\u5206\u6790\u8981\u9EDE");

    // Generate 2 infographic cards (balance between quality and API cost)
    const count = Math.min(points.length, 2);
    const images = [];

    for (let i = 0; i < count; i++) {
      onProgress(
        "\u751F\u6210\u8CC7\u8A0A\u5716 (" + (i + 1) + "/" + count + ")...",
        20 + (i / count) * 60,
      );
      const prompt = buildPrompt(industry, points[i], i);
      try {
        const imgData = await callNanoBanana2(prompt);
        if (imgData) images.push(imgData);
      } catch (err) {
        console.warn("[PremiumInfographic] Image " + (i + 1) + " failed:", err);
      }
    }

    if (images.length === 0)
      throw new Error("\u5716\u7247\u751F\u6210\u5931\u6557");
    return images;
  }

  /**
   * Extract key points (h3 sections) from analysis HTML
   */
  function extractKeyPoints(html) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const headings = tempDiv.querySelectorAll("h3");
    const points = [];

    headings.forEach((h3) => {
      const title = h3.textContent.trim();
      // Get content until next h3
      let content = "";
      let sibling = h3.nextElementSibling;
      while (sibling && sibling.tagName !== "H3") {
        content += sibling.textContent + " ";
        sibling = sibling.nextElementSibling;
      }
      if (title) {
        points.push({
          title: title,
          content: content.trim().slice(0, 200),
        });
      }
    });

    // Fallback: if no h3 found, use plain text chunks
    if (points.length === 0) {
      const plainText = tempDiv.textContent.trim();
      const sentences = plainText
        .split(/[。！？\n]/)
        .filter((s) => s.trim().length > 10);
      for (let i = 0; i < Math.min(sentences.length, 3); i++) {
        points.push({
          title: "\u5EFA\u8B70 " + (i + 1),
          content: sentences[i].trim().slice(0, 200),
        });
      }
    }

    return points;
  }

  /**
   * Build English prompt for Nano Banana 2
   */
  function buildPrompt(industry, point, index) {
    const colors = ["#D2691E", "#2874A6", "#2D7D5F"];
    const accentColor = colors[index % colors.length];

    return `Create a vertical infographic card image with aspect ratio 1:4 (width 400px, height 1600px).

Theme: "${industry}" industry - ${point.title}

Content to visualize:
${point.content}

Design requirements:
- Dark background (#1A1E23) with accent color ${accentColor}
- Modern minimalist tech style
- Include an icon or illustration at the top (related to ${industry})
- Title in bold Traditional Chinese: "${point.title}"
- 3-4 key data points or bullet items with icons
- Use clean sans-serif font for all text
- Include subtle gradient overlays and geometric decorative elements
- Bottom section: small "AI \u667A\u80FD\u5927\u8166" branding with orange (#D2691E) accent
- All Chinese text must be perfectly clear, accurate, and free of any garbled characters
- Use bold sans-serif font for Chinese text
- High contrast between text and background

Style: Professional infographic, suitable for a business consulting report. Think Mckinsey or BCG style infographic but more modern and tech-forward.`;
  }

  /**
   * Call Nano Banana 2 API
   * @returns {string|null} base64 image data
   */
  async function callNanoBanana2(prompt) {
    const res = await fetch(GEMINI_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
      }),
    });

    const data = await res.json();
    if (!res.ok)
      throw new Error(data.error || data.details || "Gemini API \u5931\u6557");

    // Extract image from response
    const parts = data.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData && part.inlineData.mimeType?.startsWith("image/")) {
        return part.inlineData.data;
      }
    }
    throw new Error("\u56DE\u61C9\u4E2D\u672A\u5305\u542B\u5716\u7247");
  }

  return { generate };
})();
