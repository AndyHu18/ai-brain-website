/**
 * Premium PDF Generator
 * Generates a professional PDF report with analysis + infographics + contact info
 * Reuses existing jsPDF infrastructure from pdf-generator/
 */
const PremiumPDF = (function () {
  "use strict";

  const LINE_URL = "https://line.me/ti/p/5gW0er9baG";
  const BRAND = {
    name: "AI \u667A\u80FD\u5927\u8166",
    tagline: "\u8B93\u7DB2\u7AD9\u81EA\u5DF1\u62DB\u651D\u5BA2\u6236",
    website: "ai-brain-website.vercel.app",
    primary: [210, 105, 30], // #D2691E
    dark: [26, 30, 35], // #1A1E23
    accent: [224, 123, 58], // #E07B3A
    textLight: [255, 255, 255],
    textMuted: [160, 160, 160],
  };

  /**
   * Generate PDF blob
   * @param {string} industry
   * @param {string} analysisHtml
   * @param {string[]} images - base64 image data array
   * @param {function} onProgress
   * @returns {Promise<Blob>}
   */
  async function generate(industry, analysisHtml, images, onProgress) {
    // Load jsPDF dependencies
    onProgress("\u8F09\u5165 PDF \u5F15\u64CE...", 10);
    await loadDependencies();

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const W = 210;
    const H = 297;
    const M = 15; // margin

    // Page 1: Cover
    onProgress("\u7D44\u88DD\u5C01\u9762...", 30);
    drawCoverPage(doc, industry, W, H, M);

    // Page 2: Analysis content
    onProgress("\u7D44\u88DD\u5206\u6790\u5167\u5BB9...", 50);
    drawAnalysisPage(doc, industry, analysisHtml, W, H, M);

    // Page 3+: Infographic images
    if (images.length > 0) {
      onProgress("\u5D4C\u5165\u8CC7\u8A0A\u5716...", 70);
      for (let i = 0; i < images.length; i++) {
        drawImagePage(doc, images[i], i, W, H, M);
      }
    }

    // Last page: Contact / CTA
    onProgress("\u52A0\u5165\u806F\u7D61\u8CC7\u8A0A...", 90);
    drawContactPage(doc, industry, W, H, M);

    onProgress("PDF \u5B8C\u6210", 100);
    return doc.output("blob");
  }

  async function loadDependencies() {
    if (window.PDFDependencies) {
      await window.PDFDependencies.load();
    } else {
      // Fallback: load jsPDF directly
      if (!window.jspdf) {
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src =
            "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
      }
    }
  }

  function drawCoverPage(doc, industry, W, H, M) {
    // Dark header band
    doc.setFillColor(...BRAND.dark);
    doc.rect(0, 0, W, 130, "F");

    // Accent circle decoration
    doc.setFillColor(...BRAND.primary);
    doc.setGState(new doc.GState({ opacity: 0.08 }));
    doc.circle(W - 25, 35, 50, "F");
    doc.circle(30, 110, 30, "F");
    doc.setGState(new doc.GState({ opacity: 1 }));

    // Title
    doc.setTextColor(...BRAND.textLight);
    doc.setFontSize(32);
    doc.text("AI \u884C\u696D\u5206\u6790\u5831\u544A", W / 2, 50, {
      align: "center",
    });

    // Industry name
    doc.setFontSize(22);
    doc.setTextColor(...BRAND.accent);
    doc.text(industry, W / 2, 70, { align: "center" });

    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(...BRAND.textMuted);
    doc.text(
      "\u5C08\u5C6C\u65BC\u60A8\u7684\u7DB2\u7AD9\u884C\u92B7 + AI \u61C9\u7528\u5206\u6790",
      W / 2,
      85,
      { align: "center" },
    );

    // Date
    doc.setFontSize(10);
    doc.text(
      "\u751F\u6210\u65E5\u671F\uFF1A" + new Date().toLocaleDateString("zh-TW"),
      W / 2,
      100,
      { align: "center" },
    );

    // Branding
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.primary);
    doc.text("Powered by " + BRAND.name, W / 2, 118, { align: "center" });

    // Below the dark band - intro text
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(11);
    const introText =
      "\u672C\u5831\u544A\u7531 AI \u667A\u80FD\u5927\u8166\u81EA\u52D5\u751F\u6210\uFF0C\u5305\u542B\u60A8\u7684\u884C\u696D\u5C08\u5C6C\u5206\u6790\u3001\u7DB2\u7AD9\u884C\u92B7\u5EFA\u8B70\u3001AI \u61C9\u7528\u65B9\u6848\u4EE5\u53CA\u8996\u89BA\u5316\u8CC7\u8A0A\u5716\u3002\u6B61\u8FCE\u900F\u904E LINE \u8207\u6211\u5011\u514D\u8CBB\u8AEE\u8A62\u3002";
    doc.text(introText, M, 150, { maxWidth: W - M * 2 });

    // Report contents
    doc.setFontSize(14);
    doc.setTextColor(...BRAND.primary);
    doc.text("\u5831\u544A\u5167\u5BB9", M, 180);

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    const items = [
      "\u2022 \u884C\u696D\u5C08\u5C6C AI \u8CE6\u80FD\u5206\u6790",
      "\u2022 \u7DB2\u7AD9\u884C\u92B7\u7B56\u7565\u5EFA\u8B70",
      "\u2022 \u670D\u52D9\u65B9\u6848\u63A8\u85A6\u8207\u9810\u671F\u6548\u679C",
      "\u2022 \u8996\u89BA\u5316\u8CC7\u8A0A\u5716\u5361",
      "\u2022 \u514D\u8CBB\u8AEE\u8A62\u806F\u7D61\u65B9\u5F0F",
    ];
    items.forEach((item, i) => {
      doc.text(item, M + 5, 192 + i * 8);
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.textMuted);
    doc.text(BRAND.website, W / 2, H - 10, { align: "center" });
  }

  function drawAnalysisPage(doc, industry, analysisHtml, W, H, M) {
    doc.addPage();

    // Header
    doc.setFillColor(...BRAND.dark);
    doc.rect(0, 0, W, 25, "F");
    doc.setTextColor(...BRAND.textLight);
    doc.setFontSize(14);
    doc.text(industry + " \u2014 AI \u5206\u6790\u7D50\u679C", M, 16);

    // Content
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = analysisHtml;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);

    let y = 35;
    const lineHeight = 6;
    const maxWidth = W - M * 2;

    // Split into paragraphs and render
    const paragraphs = plainText.split(/\n+/).filter((p) => p.trim());
    for (const para of paragraphs) {
      const lines = doc.splitTextToSize(para.trim(), maxWidth);
      for (const line of lines) {
        if (y > H - 20) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, M, y);
        y += lineHeight;
      }
      y += 3; // paragraph gap
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.textMuted);
    doc.text(BRAND.name + " | " + BRAND.website, W / 2, H - 10, {
      align: "center",
    });
  }

  function drawImagePage(doc, imgBase64, index, W, H, M) {
    doc.addPage();

    // Header
    doc.setFillColor(...BRAND.dark);
    doc.rect(0, 0, W, 20, "F");
    doc.setTextColor(...BRAND.textLight);
    doc.setFontSize(12);
    doc.text("\u8CC7\u8A0A\u5716 " + (index + 1), M, 14);

    // Image - 1:4 ratio, center on page
    // A4 printable area: 180mm wide. 1:4 → height = width * 4
    // Scale to fit: use width ~60mm → height ~240mm (too tall), so scale to fit height
    const maxImgH = H - 40; // leave room for header + footer
    const imgW = maxImgH / 4; // maintain 1:4 ratio
    const imgX = (W - imgW) / 2;

    try {
      doc.addImage(
        "data:image/png;base64," + imgBase64,
        "PNG",
        imgX,
        25,
        imgW,
        maxImgH,
      );
    } catch (e) {
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(11);
      doc.text("[\u5716\u7247\u8F09\u5165\u5931\u6557]", W / 2, H / 2, {
        align: "center",
      });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.textMuted);
    doc.text(BRAND.name, W / 2, H - 10, { align: "center" });
  }

  function drawContactPage(doc, industry, W, H, M) {
    doc.addPage();

    // Full dark page
    doc.setFillColor(...BRAND.dark);
    doc.rect(0, 0, W, H, "F");

    // Accent circle
    doc.setFillColor(...BRAND.primary);
    doc.setGState(new doc.GState({ opacity: 0.06 }));
    doc.circle(W / 2, H / 2, 80, "F");
    doc.setGState(new doc.GState({ opacity: 1 }));

    // Title
    doc.setTextColor(...BRAND.textLight);
    doc.setFontSize(28);
    doc.text(
      "\u60F3\u8B93\u7DB2\u7AD9\u81EA\u5DF1\u62DB\u5BA2\u55CE\uFF1F",
      W / 2,
      80,
      { align: "center" },
    );

    // Subtitle
    doc.setFontSize(14);
    doc.setTextColor(...BRAND.accent);
    doc.text(
      "\u52A0 LINE \u514D\u8CBB\u8AEE\u8A62\uFF0C\u8B93\u6211\u5011\u70BA " +
        industry +
        " \u91CF\u8EAB\u6253\u9020",
      W / 2,
      100,
      { align: "center" },
    );

    // LINE info
    doc.setFontSize(16);
    doc.setTextColor(...BRAND.textLight);
    doc.text("LINE \u8AEE\u8A62", W / 2, 135, { align: "center" });

    doc.setFontSize(11);
    doc.setTextColor(...BRAND.textMuted);
    doc.text(LINE_URL, W / 2, 148, { align: "center" });

    // Link (clickable)
    doc.link(M, 140, W - M * 2, 15, { url: LINE_URL });

    // Services list
    doc.setFontSize(12);
    doc.setTextColor(...BRAND.textLight);
    doc.text("\u6211\u5011\u7684\u670D\u52D9", W / 2, 180, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(...BRAND.textMuted);
    const services = [
      "\u{1F310} \u975C\u614B\u5F62\u8C61\u7DB2\u7AD9  NT$5,000 \u8D77",
      "\u{1F4DD} CMS \u53EF\u7BA1\u7406\u7DB2\u7AD9  NT$12,000 \u8D77",
      "\u{1F6D2} \u96FB\u5546\u91D1\u6D41\u4E32\u63A5  NT$8,000 \u8D77",
      "\u{1F4C8} \u884C\u92B7\u5C0E\u5411\u7DB2\u7AD9  NT$15,000 \u8D77",
      "\u{1F916} AI \u667A\u80FD\u5BA2\u670D  NT$3,000 \u8D77/\u6708",
      "\u{1F3AC} \u7D20\u6750\u8F49\u88FD\u670D\u52D9  NT$2,000 \u8D77",
    ];
    services.forEach((svc, i) => {
      doc.text(svc, W / 2, 196 + i * 10, { align: "center" });
    });

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.primary);
    doc.text(BRAND.name + " | " + BRAND.tagline, W / 2, H - 20, {
      align: "center",
    });
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.textMuted);
    doc.text(BRAND.website, W / 2, H - 12, { align: "center" });
  }

  return { generate };
})();
