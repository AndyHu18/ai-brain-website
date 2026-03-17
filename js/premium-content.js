/**
 * Premium Content Generator - Main Coordinator
 * Orchestrates podcast, infographic, and PDF generation after industry analysis
 */
const PremiumContent = (function () {
  "use strict";

  const TASKS = [
    {
      id: "podcast",
      icon: "\u{1F399}\uFE0F",
      name: "\u5c08\u5c6c Podcast",
      statusText: "\u6e96\u5099\u4e2d...",
    },
    {
      id: "infographic",
      icon: "\u{1F5BC}\uFE0F",
      name: "\u8cc7\u8a0a\u5716\u5361",
      statusText: "\u6e96\u5099\u4e2d...",
    },
    {
      id: "pdf",
      icon: "\u{1F4C4}",
      name: "PDF \u5831\u544a",
      statusText: "\u7b49\u5f85\u5716\u7247\u5b8c\u6210...",
    },
  ];

  let panelEl, tasksEl, galleryEl, actionsEl, lightboxEl;
  let isRunning = false;

  function init() {
    panelEl = document.getElementById("iaPremiumPanel");
    if (!panelEl) return;
    tasksEl = panelEl.querySelector(".pc-tasks");
    galleryEl = panelEl.querySelector(".pc-gallery");
    actionsEl = panelEl.querySelector(".pc-actions");

    // Lightbox
    lightboxEl = document.getElementById("pcLightbox");
    if (lightboxEl) {
      lightboxEl.addEventListener("click", () =>
        lightboxEl.classList.remove("visible"),
      );
    }
  }

  function updateTask(taskId, state, statusText, progress) {
    const card = tasksEl.querySelector(`[data-task="${taskId}"]`);
    if (!card) return;

    card.className =
      "pc-task" +
      (state === "active"
        ? " active"
        : state === "done"
          ? " done"
          : state === "error"
            ? " error"
            : "");
    card.querySelector(".pc-task-status").textContent = statusText || "";

    if (typeof progress === "number") {
      card.querySelector(".pc-progress-bar").style.width = progress + "%";
    }
  }

  async function start(industry, analysisHtml) {
    if (isRunning) return;
    isRunning = true;

    if (!panelEl) init();
    if (!panelEl) return;

    // Show panel
    panelEl.classList.add("visible");
    panelEl.scrollIntoView({ behavior: "smooth", block: "center" });

    // Reset UI
    galleryEl.classList.remove("visible");
    galleryEl.innerHTML = "";
    actionsEl.classList.remove("visible");

    // Run podcast + infographic in parallel; PDF waits for infographic
    const podcastPromise = runPodcast(industry, analysisHtml);
    const infographicPromise = runInfographic(industry, analysisHtml);

    // PDF depends on infographic images
    const pdfPromise = infographicPromise.then((images) => {
      if (images && images.length > 0) {
        return runPDF(industry, analysisHtml, images);
      }
      updateTask(
        "pdf",
        "error",
        "\u5716\u7247\u672a\u5b8c\u6210\uff0c\u7121\u6cd5\u751f\u6210",
        0,
      );
      return null;
    });

    await Promise.allSettled([podcastPromise, pdfPromise]);
    isRunning = false;
  }

  async function runPodcast(industry, analysisHtml) {
    updateTask(
      "podcast",
      "active",
      "\u6b63\u5728\u751f\u6210\u8a0e\u8ad6\u8173\u672c...",
      10,
    );
    try {
      if (typeof PremiumPodcast === "undefined")
        throw new Error("Podcast \u6a21\u7d44\u672a\u8f09\u5165");
      await PremiumPodcast.generate(industry, analysisHtml, (status, pct) => {
        updateTask("podcast", "active", status, pct);
      });
      updateTask(
        "podcast",
        "done",
        "\u5df2\u5b8c\u6210\uff01\u9ede\u53f3\u4e0b\u89d2\u64ad\u653e",
        100,
      );
    } catch (err) {
      console.error("[PremiumContent] Podcast error:", err);
      updateTask(
        "podcast",
        "error",
        "\u751f\u6210\u5931\u6557\uff1a" +
          (err.message || "\u672a\u77e5\u932f\u8aa4"),
        0,
      );
    }
  }

  async function runInfographic(industry, analysisHtml) {
    updateTask(
      "infographic",
      "active",
      "\u6b63\u5728\u751f\u6210\u8cc7\u8a0a\u5716...",
      10,
    );
    try {
      if (typeof PremiumInfographic === "undefined")
        throw new Error("\u8cc7\u8a0a\u5716\u6a21\u7d44\u672a\u8f09\u5165");
      const images = await PremiumInfographic.generate(
        industry,
        analysisHtml,
        (status, pct) => {
          updateTask("infographic", "active", status, pct);
        },
      );
      updateTask(
        "infographic",
        "done",
        images.length + " \u5f35\u5716\u7247\u5df2\u5b8c\u6210",
        100,
      );
      showGallery(images);
      return images;
    } catch (err) {
      console.error("[PremiumContent] Infographic error:", err);
      updateTask(
        "infographic",
        "error",
        "\u751f\u6210\u5931\u6557\uff1a" +
          (err.message || "\u672a\u77e5\u932f\u8aa4"),
        0,
      );
      return [];
    }
  }

  async function runPDF(industry, analysisHtml, images) {
    updateTask("pdf", "active", "\u6b63\u5728\u7d44\u88dd PDF...", 30);
    try {
      if (typeof PremiumPDF === "undefined")
        throw new Error("PDF \u6a21\u7d44\u672a\u8f09\u5165");
      const blob = await PremiumPDF.generate(
        industry,
        analysisHtml,
        images,
        (status, pct) => {
          updateTask("pdf", "active", status, pct);
        },
      );
      updateTask("pdf", "done", "PDF \u5df2\u5b8c\u6210", 100);
      showPDFButton(blob, industry);
    } catch (err) {
      console.error("[PremiumContent] PDF error:", err);
      updateTask(
        "pdf",
        "error",
        "\u751f\u6210\u5931\u6557\uff1a" +
          (err.message || "\u672a\u77e5\u932f\u8aa4"),
        0,
      );
    }
  }

  function showGallery(images) {
    galleryEl.innerHTML = "";
    images.forEach((imgData, i) => {
      const item = document.createElement("div");
      item.className = "pc-gallery-item";
      const img = document.createElement("img");
      img.src = "data:image/png;base64," + imgData;
      img.alt = "\u8cc7\u8a0a\u5716 " + (i + 1);
      img.loading = "lazy";
      item.appendChild(img);
      item.addEventListener("click", () => openLightbox(img.src));
      galleryEl.appendChild(item);
    });
    galleryEl.classList.add("visible");
  }

  function openLightbox(src) {
    if (!lightboxEl) return;
    lightboxEl.querySelector("img").src = src;
    lightboxEl.classList.add("visible");
  }

  function showPDFButton(blob, industry) {
    actionsEl.innerHTML = "";
    const btn = document.createElement("button");
    btn.className = "pc-action-btn pc-btn-pdf";
    btn.innerHTML = "\u{1F4E5} \u4E0B\u8F09 PDF \u5831\u544A";
    btn.addEventListener("click", () => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "AI\u667A\u80FD\u5206\u6790_" + industry + ".pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    });
    actionsEl.appendChild(btn);
    actionsEl.classList.add("visible");
  }

  // Boot
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  return { start };
})();
