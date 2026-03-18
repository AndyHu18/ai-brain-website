/**
 * Premium Infographic Generator
 * Uses Nano Banana Pro (gemini-3-pro-image-preview)
 * Generates luxury promotional image based on industry analysis
 */
const PremiumInfographic = (function () {
  "use strict";

  const GEMINI_API = "/api/gemini";
  const MODEL = "gemini-3-pro-image-preview";

  async function generate(industry, analysisHtml, onProgress) {
    const points = extractKeyPoints(analysisHtml);
    if (points.length === 0)
      throw new Error("\u7121\u6CD5\u63D0\u53D6\u5206\u6790\u8981\u9EDE");

    onProgress("\u751F\u6210\u884C\u696D\u5206\u6790\u5716\u5361...", 30);

    try {
      const imgData = await generateCard(industry, points);
      if (imgData) return [imgData];
    } catch (err) {
      console.warn("[PremiumInfographic] Card failed:", err);
    }

    throw new Error("\u5716\u7247\u751F\u6210\u5931\u6557");
  }

  function extractKeyPoints(html) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const headings = tempDiv.querySelectorAll("h3, strong");
    const points = [];

    headings.forEach((el) => {
      const title = el.textContent.trim();
      let content = "";
      let sibling =
        el.tagName === "H3"
          ? el.nextElementSibling
          : el.parentElement?.nextElementSibling;
      while (
        sibling &&
        sibling.tagName !== "H3" &&
        !sibling.querySelector("strong")
      ) {
        content += sibling.textContent + " ";
        sibling = sibling.nextElementSibling;
      }
      if (!content.trim()) {
        const parent = el.closest("p, div, li");
        if (parent) content = parent.textContent.replace(title, "").trim();
      }
      if (title && title.length > 2) {
        points.push({ title, content: content.trim().slice(0, 80) });
      }
    });

    return points;
  }

  /**
   * Generate promotional image — text-only prompt
   */
  async function generateCard(industry, points) {
    const bullets = points
      .slice(0, 4)
      .map((p) => '"' + p.title.slice(0, 8) + '"')
      .join(", ");

    const prompt =
      "Generate a luxury promotional image for a " +
      industry +
      " business. Use Taiwanese people. " +
      "Luxury, high-end, photorealistic soft-sell marketing poster — must look like a real photograph, not AI-generated. " +
      "Text to include: " +
      '"AI \u667A\u80FD\u5927\u8166", "' +
      industry +
      ' AI \u61C9\u7528\u5206\u6790", ' +
      bullets +
      ', "LINE \u514D\u8CBB\u8AEE\u8A62"';

    const contents = [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ];

    const res = await fetch(GEMINI_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        contents,
        generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
      }),
    });

    const data = await res.json();
    if (!res.ok)
      throw new Error(data.error?.message || data.error || "Gemini API failed");

    const parts = data.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData && part.inlineData.mimeType?.startsWith("image/")) {
        return part.inlineData.data;
      }
    }
    throw new Error("No image in response");
  }

  return { generate };
})();
