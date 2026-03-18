/**
 * Premium Infographic Generator
 * Uses Nano Banana Pro (gemini-3-pro-image-preview)
 * Step 1: Haiku condenses analysis points to ≤25 chars
 * Step 2: Chinese prompt generates 4K marketing poster
 */
const PremiumInfographic = (function () {
  "use strict";

  const GEMINI_API = "/api/gemini";
  const CLAUDE_API = "/api/claude";
  const MODEL = "gemini-3-pro-image-preview";

  async function generate(industry, analysisHtml, onProgress) {
    const rawPoints = extractKeyPoints(analysisHtml);
    if (rawPoints.length === 0)
      throw new Error("\u7121\u6CD5\u63D0\u53D6\u5206\u6790\u8981\u9EDE");

    // Step 1: Haiku condenses long points to ≤25 char labels
    onProgress("\u6FC3\u7E2E\u5206\u6790\u8981\u9EDE...", 20);
    const condensed = await condensePoints(rawPoints.slice(0, 4));

    // Step 2: Generate image with condensed labels
    onProgress("\u751F\u6210\u884C\u696D\u5206\u6790\u6D77\u5831...", 40);
    try {
      const imgData = await generateCard(industry, condensed);
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
        points.push({ title, content: content.trim() });
      }
    });

    return points;
  }

  /**
   * Use Haiku to condense long analysis points into ≤25 char labels
   */
  async function condensePoints(points) {
    const pointsText = points
      .map(
        (p, i) => i + 1 + ". " + p.title + (p.content ? "：" + p.content : ""),
      )
      .join("\n");

    try {
      const res = await fetch(CLAUDE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 200,
          temperature: 0.3,
          system:
            "\u4F60\u662F\u6587\u6848\u6FC3\u7E2E\u5C08\u5BB6\u3002\u628A\u6BCF\u500B\u8981\u9EDE\u6FC3\u7E2E\u6210\u4E00\u53E5\u7CBE\u7149\u7684\u4E2D\u6587\uFF0C\u6BCF\u53E5\u4E0D\u8D85\u904E25\u500B\u5B57\u3002\u53EA\u8F38\u51FA\u6FC3\u7E2E\u5F8C\u7684\u53E5\u5B50\uFF0C\u6BCF\u884C\u4E00\u53E5\uFF0C\u4E0D\u8981\u7DE8\u865F\uFF0C\u4E0D\u8981\u5176\u4ED6\u6587\u5B57\u3002",
          messages: [
            {
              role: "user",
              content:
                "\u8ACB\u628A\u4EE5\u4E0B\u8981\u9EDE\u5404\u6FC3\u7E2E\u6210\u4E00\u53E5\u226425\u5B57\u7684\u7CBE\u7149\u4E2D\u6587\uFF1A\n" +
                pointsText,
            },
          ],
        }),
      });

      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lines.length >= points.length) {
        return lines.slice(0, 4).map((line) => ({ title: line }));
      }
    } catch (err) {
      console.warn("[PremiumInfographic] Haiku condense failed:", err);
    }

    // Fallback: use original titles if Haiku fails
    return points.map((p) => ({ title: p.title }));
  }

  /**
   * Build Chinese prompt following 2026 best practices
   */
  function buildPrompt(industry, points) {
    const p1 = points[0] || { title: "" };
    const p2 = points[1] || { title: "" };
    const p3 = points[2] || { title: "" };
    const p4 = points[3] || { title: "" };
    const year = new Date().getFullYear();

    return (
      "\u88FD\u4F5C\u4E00\u5F35\u9AD8\u7AEF\u5546\u696D\u884C\u92B7\u6D77\u5831\uFF0C\u91DD\u5C0D\u53F0\u7063\u7684" +
      industry +
      "\u884C\u696D\u3002\n\n" +
      "\u5834\u666F\uFF1A\u5DE6\u5074\u662F" +
      industry +
      "\u884C\u696D\u7684\u53F0\u7063\u4EBA\u5C08\u696D\u5834\u666F\u3002\n\n" +
      "\u6587\u5B57\u6392\u7248\uFF08\u73FE\u4EE3\u9ED1\u9AD4\uFF0C\u6E05\u6670\u6613\u8B80\uFF09\uFF1A\n" +
      "- \u7F6E\u4E2D\u4E0A\u65B9\uFF0C\u5927\u6A19\u984C\uFF1A\u300CAI \u667A\u80FD\u5927\u8166\u300D\n" +
      "- \u6B21\u6A19\u984C\uFF1A\u300C" +
      industry +
      " AI\u667A\u80FD\u89E3\u6C7A\u65B9\u6848\u300D\n" +
      "- \u53F3\u5074\u56DB\u500B\u9762\u677F\uFF1A\n" +
      "  - \u300C" +
      p1.title +
      "\u300D\n" +
      "  - \u300C" +
      p2.title +
      "\u300D\n" +
      "  - \u300C" +
      p3.title +
      "\u300D\n" +
      "  - \u300C" +
      p4.title +
      "\u300D\n" +
      "- \u5DE6\u4E0B\u89D2\u5C0F\u5B57\uFF1A\u300C\u00A9 " +
      year +
      " AI\u667A\u80FD\u5927\u8166\u300D\n\n" +
      "\u98A8\u683C\uFF1A\u9AD8\u7AEF\u5962\u83EF\u5546\u696D\u884C\u92B7\u6D77\u5831\u3002\u6BD4\u4F8B 9:16\uFF0C4K\uFF082160x3840\uFF09\u3002"
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
