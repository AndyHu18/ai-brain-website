/**
 * Premium Infographic Generator
 * Uses Nano Banana Pro (gemini-3-pro-image-preview)
 * Generates dynamic marketing poster with structured layout
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
        points.push({ title });
      }
    });

    return points;
  }

  /**
   * Build structured prompt for dynamic marketing poster
   */
  function buildPrompt(industry, points) {
    const p1 = points[0] || { title: "" };
    const p2 = points[1] || { title: "" };
    const p3 = points[2] || { title: "" };
    const p4 = points[3] || { title: "" };
    const year = new Date().getFullYear();

    return (
      "A professional, high-end digital marketing poster for a " +
      industry +
      " business in Taiwan. " +
      "Dark premium background with glowing gold and cyan data lines, network nodes, and subtle holographic tech UI elements. " +
      "On the left side, photorealistic Taiwanese people in a scene that represents the " +
      industry +
      " industry, dressed professionally. " +
      "Text layout is strictly structured and grid-based. Clean and highly legible text, integrated into the background with glassmorphism (translucent) panels. No solid white backgrounds: " +
      '- Top center, large prominent gold serif font: "AI \u667A\u80FD\u5927\u8166" ' +
      '- Below it, medium gold font: "' +
      industry +
      ' AI\u667A\u80FD\u89E3\u6C7A\u65B9\u6848" ' +
      "- Right side, 4 floating holographic glassmorphism panels, each showing ONLY a short label (no descriptions): " +
      '  - Panel 1: "' +
      p1.title +
      '" ' +
      '  - Panel 2: "' +
      p2.title +
      '" ' +
      '  - Panel 3: "' +
      p3.title +
      '" ' +
      '  - Panel 4: "' +
      p4.title +
      '" ' +
      '- Bottom right, glowing button: "\u7ACB\u5373\u8AEE\u8A62" ' +
      '- Bottom left, small text: "\u00A9 ' +
      year +
      ' AI\u667A\u80FD\u5927\u8166" ' +
      "Ultra-photorealistic subjects, cinematic lighting, futuristic luxurious commercial aesthetic. " +
      "NO messy overlapping text. 9:16 aspect ratio, 4K resolution (2160x3840)."
    );
  }

  /**
   * Generate marketing poster
   */
  async function generateCard(industry, points) {
    const prompt = buildPrompt(industry, points);

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
