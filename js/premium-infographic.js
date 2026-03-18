/**
 * Premium Infographic Generator
 * Uses Nano Banana 2 (gemini-3.1-flash-image-preview)
 * Generates magazine-quality infographic card with text directly in image
 */
const PremiumInfographic = (function () {
  "use strict";

  const GEMINI_API = "/api/gemini";
  const MODEL = "gemini-3.1-flash-image-preview";

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

  // Cache reference image base64
  let refImageBase64 = null;

  async function loadReferenceImage() {
    if (refImageBase64) return refImageBase64;
    try {
      const res = await fetch("images/reference-infographic.jpg");
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          refImageBase64 = reader.result.split(",")[1];
          resolve(refImageBase64);
        };
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn(
        "[PremiumInfographic] Reference image not found, using text-only prompt",
      );
      return null;
    }
  }

  /**
   * Generate infographic card — few-shot with reference image
   */
  async function generateCard(industry, points) {
    const bullets = points
      .slice(0, 4)
      .map((p) => p.title)
      .join("\n");

    // Load reference image for few-shot
    const refBase64 = await loadReferenceImage();

    const newPrompt =
      "Now create a similar style promotional infographic card for the " +
      industry +
      " industry.\n\n" +
      "LAYOUT (same structure as the reference):\n" +
      "- TOP: Photorealistic hero image of a " +
      industry +
      " scene with people, warm lighting\n" +
      '- Brand logo area: "AI \u667A\u80FD\u5927\u8166" with tagline\n' +
      '- Large bold headline: "' +
      industry +
      ' AI \u61C9\u7528\u5206\u6790"\n' +
      "- Key service recommendations:\n" +
      bullets +
      "\n" +
      '- Bottom: "LINE \u514D\u8CBB\u8AEE\u8A62" + contact info area\n\n' +
      "IMPORTANT:\n" +
      "- Match the reference image quality and layout precision\n" +
      "- The hero image MUST be photorealistic, luxurious, and high-end — like a 5-star establishment or premium brand campaign\n" +
      "- Use real-world photography style: professional lighting, shallow depth of field, rich warm tones\n" +
      "- All Chinese text must be perfectly clear using bold sans-serif font\n" +
      "- Mobile aspect ratio 9:16\n" +
      "- Warm color scheme with orange (#D2691E) accents on dark background";

    // Build contents: few-shot if reference available, otherwise text-only
    const contents = [];
    if (refBase64) {
      // Turn 1: user shows reference
      contents.push({
        role: "user",
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: refBase64 } },
          {
            text: "This is a reference infographic card for a restaurant. Study its layout, typography, color scheme, and overall design quality. I want you to generate new cards in this exact same style and quality level for different industries.",
          },
        ],
      });
      // Turn 2: model acknowledges
      contents.push({
        role: "model",
        parts: [
          {
            text: "I've studied the reference card. It features: (1) photorealistic hero image with people dining at top, (2) brand logo with tagline, (3) large bold Chinese headline, (4) food photos with descriptions, (5) promotional offers section, (6) contact info at bottom. The style uses warm tones, professional photography, bold sans-serif Chinese typography, and a clean structured layout. I'll generate new cards matching this quality and structure.",
          },
        ],
      });
      // Turn 3: user requests new industry
      contents.push({
        role: "user",
        parts: [{ text: newPrompt }],
      });
    } else {
      contents.push({
        role: "user",
        parts: [{ text: newPrompt }],
      });
    }

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
