/**
 * Premium Content Generator - Main Coordinator
 * Orchestrates infographic, PDF, and podcast generation
 * New UI: chip status bar + hero image display
 */
const PremiumContent = (function () {
  "use strict";

  let panelEl, heroImageEl, actionsEl;
  let isRunning = false;

  function init() {
    panelEl = document.getElementById("iaPremiumPanel");
    if (!panelEl) return;
    heroImageEl = document.getElementById("pcHeroImage");
    actionsEl = panelEl.querySelector(".pc-actions");
  }

  function updateChip(taskId, state, statusText) {
    const chip = panelEl.querySelector(
      '.pc-task-chip[data-task="' + taskId + '"]',
    );
    if (!chip) return;

    chip.className =
      "pc-task-chip" +
      (state === "active"
        ? " active"
        : state === "done"
          ? " done"
          : state === "error"
            ? " error"
            : "");

    const statusEl = chip.querySelector(".pc-chip-status");
    if (statusEl) statusEl.textContent = statusText || "";
  }

  async function start(industry, analysisHtml) {
    if (isRunning) return;
    isRunning = true;

    if (!panelEl) init();
    if (!panelEl) return;

    // Show panel
    panelEl.classList.add("visible");
    panelEl.scrollIntoView({ behavior: "smooth", block: "center" });

    // Reset
    heroImageEl.classList.remove("visible");
    heroImageEl.innerHTML = "";
    actionsEl.classList.remove("visible");
    actionsEl.innerHTML = "";

    // Step 1: Infographic (1 image)
    const images = await runInfographic(industry, analysisHtml);

    // Step 2: PDF
    if (images && images.length > 0) {
      await runPDF(industry, analysisHtml, images);
    } else {
      updateChip("pdf", "error", "跳過");
    }

    // Step 3: Podcast
    await runPodcast(industry, analysisHtml);

    // Show completion toast
    showToast(
      "\u5206\u6790\u5B8C\u6210\uFF01\u8ACB\u6ED1\u5230\u4E0B\u65B9\u67E5\u770B\u5716\u5361\uFF0C\u6216\u9EDE\u64CA\u5E95\u90E8\u64AD\u653E\u8A9E\u97F3",
    );

    isRunning = false;
  }

  function showToast(text) {
    const toast = document.getElementById("pcToast");
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add("visible");
    setTimeout(() => toast.classList.remove("visible"), 4000);
  }

  async function runInfographic(industry, analysisHtml) {
    updateChip("infographic", "active", "生成中...");
    try {
      if (typeof PremiumInfographic === "undefined")
        throw new Error("模組未載入");
      const images = await PremiumInfographic.generate(
        industry,
        analysisHtml,
        (status) => {
          updateChip(
            "infographic",
            "active",
            status.replace(/.*\)/, "").trim() || "生成中...",
          );
        },
      );
      updateChip("infographic", "done", "完成");
      showHeroImage(images[0]);
      return images;
    } catch (err) {
      console.error("[PremiumContent] Infographic error:", err);
      updateChip("infographic", "error", "失敗");
      return [];
    }
  }

  async function runPDF(industry, analysisHtml, images) {
    updateChip("pdf", "active", "生成中...");
    try {
      if (typeof PremiumPDF === "undefined") throw new Error("模組未載入");
      const blob = await PremiumPDF.generate(
        industry,
        analysisHtml,
        images,
        (status) => {
          updateChip(
            "pdf",
            "active",
            status.replace(/.*\.\.\./, "").trim() || "生成中...",
          );
        },
      );
      updateChip("pdf", "done", "完成");
      showPDFButton(blob, industry);
    } catch (err) {
      console.error("[PremiumContent] PDF error:", err);
      updateChip("pdf", "error", "失敗");
    }
  }

  async function runPodcast(industry, analysisHtml) {
    updateChip("podcast", "active", "生成中...");
    try {
      if (typeof PremiumPodcast === "undefined") throw new Error("模組未載入");
      await PremiumPodcast.generate(industry, analysisHtml, (status) => {
        updateChip(
          "podcast",
          "active",
          status.replace(/.*\)/, "").trim() || "生成中...",
        );
      });
      updateChip("podcast", "done", "完成");
    } catch (err) {
      console.error("[PremiumContent] Podcast error:", err);
      updateChip("podcast", "error", "失敗");
    }
  }

  function showHeroImage(imgBase64) {
    if (!heroImageEl || !imgBase64) return;
    const img = document.createElement("img");
    img.src = "data:image/png;base64," + imgBase64;
    img.alt = "AI 行業分析資訊圖";
    img.loading = "eager";
    heroImageEl.innerHTML = "";
    heroImageEl.appendChild(img);
    heroImageEl.classList.add("visible");
  }

  function showPDFButton(blob, industry) {
    // Wire up the bottom bar PDF button
    const barPdfBtn = document.getElementById("pcBarPdfBtn");
    if (barPdfBtn) {
      barPdfBtn.addEventListener("click", () => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "AI\u667A\u80FD\u5206\u6790_" + industry + ".pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      });
    }
  }

  // Boot
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  return { start };
})();
