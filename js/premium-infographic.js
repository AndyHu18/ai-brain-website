/**
 * Premium Infographic Generator
 * Uses Nano Banana Pro (gemini-3-pro-image-preview)
 * Generates dynamic marketing poster with structured layout
 */
const PremiumInfographic = (function () {
  "use strict";

  const GEMINI_API = "/api/gemini";
  const MODEL = "gemini-3-pro-image-preview";

  /** Title max 6 chars, description max 15 chars */
  const MAX_TITLE_LEN = 6;
  const MAX_DESC_LEN = 15;

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
        points.push({
          title: title.slice(0, MAX_TITLE_LEN),
          content: content.trim().slice(0, MAX_DESC_LEN),
        });
      }
    });

    return points;
  }

  /**
   * Build structured prompt for dynamic marketing poster
   */
  function buildPrompt(industry, points) {
    const p1 = points[0] || { title: "", content: "" };
    const p2 = points[1] || { title: "", content: "" };
    const p3 = points[2] || { title: "", content: "" };
    const p4 = points[3] || { title: "", content: "" };
    const year = new Date().getFullYear();

    return (
      "A professional, high-end digital marketing poster. Dark navy blue background with glowing gold and cyan data lines, network nodes, and subtle holographic tech UI elements floating in the air. " +
      "On the left side, an elegant Taiwanese couple: a woman in a black evening gown and a man in a tuxedo, posing gracefully. Next to them, a classic wooden large-format studio camera on a tripod, emitting a subtle holographic scanning light. " +
      "Text layout is strictly structured and grid-based. The text must be clean and highly legible, integrated seamlessly into the high-tech background without any solid white paper backgrounds: " +
      '- Top center, large prominent clean gold serif font: "AI \u667A\u80FD\u5927\u8166" ' +
      '- Below it, medium gold font: "' +
      industry +
      ' AI\u667A\u80FD\u89E3\u6C7A\u65B9\u6848" ' +
      "- On the right side, floating holographic tech panels with subtle glassmorphism (translucent) effect containing clean lists: " +
      '  - Panel 1 (Top) with a sleek icon: "' +
      p1.title +
      '" and "' +
      p1.content +
      '" ' +
      '  - Panel 2 with a star icon: "' +
      p2.title +
      '" and "' +
      p2.content +
      '" ' +
      '  - Panel 3 with a brain icon: "' +
      p3.title +
      '" and "' +
      p3.content +
      '" ' +
      '  - Panel 4 (Bottom) with a cloud icon: "' +
      p4.title +
      '" and "' +
      p4.content +
      '" ' +
      '- Bottom right, a glowing tech-style button: "\u7ACB\u5373\u8AEE\u8A62" next to a chat icon ' +
      '- Bottom left edge, small vertical text: "\u00A9 ' +
      year +
      ' AI\u667A\u80FD\u5927\u8166" ' +
      "Ultra-photorealistic subjects, crisp vector-like graphic design elements, cinematic lighting, futuristic yet luxurious commercial aesthetic. NO messy overlapping text. Ensure exact text rendering for all specified text. " +
      "Mobile aspect ratio 9:16 (1080x1920)."
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
