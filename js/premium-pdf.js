/**
 * Premium PDF Generator
 * Uses html2canvas to render Chinese text correctly, then embeds into jsPDF
 */
const PremiumPDF = (function () {
  "use strict";

  const LINE_URL = "https://line.me/ti/p/5gW0er9baG";

  async function generate(industry, analysisHtml, images, onProgress) {
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

    // Page 1: Cover
    onProgress("\u7D44\u88DD\u5C01\u9762...", 25);
    await addPageFromHtml(doc, buildCoverHtml(industry), W, H, false);

    // Page 2: Analysis
    onProgress("\u7D44\u88DD\u5206\u6790\u5167\u5BB9...", 45);
    await addPageFromHtml(
      doc,
      buildAnalysisHtml(industry, analysisHtml),
      W,
      H,
      true,
    );

    // Page 3+: Infographics
    if (images.length > 0) {
      onProgress("\u5D4C\u5165\u8CC7\u8A0A\u5716...", 65);
      for (let i = 0; i < images.length; i++) {
        await addPageFromHtml(doc, buildImageHtml(images[i], i), W, H, true);
      }
    }

    // Last page: CTA
    onProgress("\u52A0\u5165\u806F\u7D61\u8CC7\u8A0A...", 85);
    await addPageFromHtml(doc, buildCtaHtml(industry), W, H, true);

    onProgress("PDF \u5B8C\u6210", 100);
    return doc.output("blob");
  }

  async function loadDependencies() {
    if (window.PDFDependencies) {
      await window.PDFDependencies.load();
    } else {
      const deps = [
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
      ];
      for (const src of deps) {
        if (!document.querySelector('script[src="' + src + '"]')) {
          await new Promise((resolve, reject) => {
            const s = document.createElement("script");
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
          });
        }
      }
    }
  }

  /**
   * Render HTML string to canvas, then embed as full-page image in PDF
   */
  async function addPageFromHtml(doc, html, W, H, addPage) {
    const container = document.createElement("div");
    container.style.cssText =
      "position:fixed;left:-9999px;top:0;width:794px;height:1123px;overflow:hidden;font-family:'Noto Sans TC',sans-serif;";
    container.innerHTML = html;
    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        width: 794,
        height: 1123,
      });

      if (addPage) doc.addPage();
      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      doc.addImage(imgData, "JPEG", 0, 0, W, H);
    } finally {
      document.body.removeChild(container);
    }
  }

  // ── HTML Templates ──

  function buildCoverHtml(industry) {
    const date = new Date().toLocaleDateString("zh-TW");
    return (
      '<div style="width:794px;height:1123px;background:#1a1e23;color:#fff;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;position:relative;overflow:hidden;">' +
      '<div style="position:absolute;top:-60px;right:-60px;width:300px;height:300px;border-radius:50%;background:rgba(210,105,30,0.08);"></div>' +
      '<div style="position:absolute;bottom:100px;left:-40px;width:200px;height:200px;border-radius:50%;background:rgba(210,105,30,0.06);"></div>' +
      '<div style="font-size:18px;color:#d2691e;letter-spacing:4px;margin-bottom:20px;">AI \u884C\u696D\u5206\u6790\u5831\u544A</div>' +
      '<div style="font-size:48px;font-weight:700;color:#e07b3a;margin-bottom:16px;">' +
      escHtml(industry) +
      "</div>" +
      '<div style="font-size:16px;color:#a0a0a0;margin-bottom:40px;">\u5C08\u5C6C\u65BC\u60A8\u7684\u7DB2\u7AD9\u884C\u92B7 + AI \u61C9\u7528\u5206\u6790</div>' +
      '<div style="width:60px;height:3px;background:#d2691e;margin-bottom:40px;"></div>' +
      '<div style="font-size:13px;color:#888;">\u751F\u6210\u65E5\u671F\uFF1A' +
      date +
      "</div>" +
      '<div style="font-size:13px;color:#d2691e;margin-top:12px;">Powered by AI \u667A\u80FD\u5927\u8166</div>' +
      '<div style="position:absolute;bottom:80px;text-align:center;width:100%;">' +
      '<div style="font-size:14px;color:#a0a0a0;margin-bottom:16px;">\u5831\u544A\u5167\u5BB9</div>' +
      '<div style="font-size:12px;color:#888;line-height:2;">' +
      "\u2022 \u884C\u696D\u5C08\u5C6C AI \u8CE6\u80FD\u5206\u6790<br>" +
      "\u2022 \u7DB2\u7AD9\u884C\u92B7\u7B56\u7565\u5EFA\u8B70<br>" +
      "\u2022 \u670D\u52D9\u65B9\u6848\u63A8\u85A6\u8207\u9810\u671F\u6548\u679C<br>" +
      "\u2022 \u8996\u89BA\u5316\u8CC7\u8A0A\u5716\u5361<br>" +
      "\u2022 \u514D\u8CBB\u8AEE\u8A62\u806F\u7D61\u65B9\u5F0F" +
      "</div>" +
      "</div>" +
      "</div>"
    );
  }

  function buildAnalysisHtml(industry, analysisHtml) {
    return (
      '<div style="width:794px;min-height:1123px;background:#fff;padding:0;">' +
      '<div style="background:#1a1e23;padding:24px 40px;color:#fff;font-size:18px;font-weight:600;">' +
      escHtml(industry) +
      " \u2014 AI \u5206\u6790\u7D50\u679C" +
      "</div>" +
      '<div style="padding:32px 40px;font-size:14px;line-height:1.8;color:#333;">' +
      analysisHtml +
      "</div>" +
      '<div style="position:absolute;bottom:20px;width:100%;text-align:center;font-size:10px;color:#aaa;">' +
      "AI \u667A\u80FD\u5927\u8166 | ai-brain-website.vercel.app" +
      "</div>" +
      "</div>"
    );
  }

  function buildImageHtml(imgBase64, index) {
    return (
      '<div style="width:794px;height:1123px;background:#1a1e23;display:flex;flex-direction:column;align-items:center;">' +
      '<div style="background:#1a1e23;padding:16px 40px;color:#fff;font-size:14px;width:100%;">' +
      "\u8CC7\u8A0A\u5716 " +
      (index + 1) +
      "</div>" +
      '<div style="flex:1;display:flex;align-items:center;justify-content:center;padding:8px;">' +
      '<img src="data:image/png;base64,' +
      imgBase64 +
      '" style="max-height:1040px;max-width:720px;object-fit:contain;border-radius:8px;" />' +
      "</div>" +
      '<div style="padding:12px;text-align:center;font-size:10px;color:#888;">AI \u667A\u80FD\u5927\u8166</div>' +
      "</div>"
    );
  }

  function buildCtaHtml(industry) {
    return (
      '<div style="width:794px;height:1123px;background:#1a1e23;color:#fff;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;position:relative;">' +
      '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:500px;height:500px;border-radius:50%;background:rgba(210,105,30,0.05);"></div>' +
      '<div style="font-size:36px;font-weight:700;margin-bottom:20px;">\u60F3\u8B93\u7DB2\u7AD9\u81EA\u5DF1\u62DB\u5BA2\u55CE\uFF1F</div>' +
      '<div style="font-size:18px;color:#e07b3a;margin-bottom:50px;">\u52A0 LINE \u514D\u8CBB\u8AEE\u8A62\uFF0C\u8B93\u6211\u5011\u70BA ' +
      escHtml(industry) +
      " \u91CF\u8EAB\u6253\u9020</div>" +
      '<div style="font-size:20px;margin-bottom:8px;">LINE \u8AEE\u8A62</div>' +
      '<div style="font-size:14px;color:#a0a0a0;margin-bottom:60px;">' +
      LINE_URL +
      "</div>" +
      '<div style="font-size:16px;margin-bottom:16px;">\u6211\u5011\u7684\u670D\u52D9</div>' +
      '<div style="font-size:13px;color:#a0a0a0;line-height:2.2;">' +
      "\uD83C\uDF10 \u975C\u614B\u5F62\u8C61\u7DB2\u7AD9 NT$5,000 \u8D77<br>" +
      "\uD83D\uDCDD CMS \u53EF\u7BA1\u7406\u7DB2\u7AD9 NT$12,000 \u8D77<br>" +
      "\uD83D\uDED2 \u96FB\u5546\u91D1\u6D41\u4E32\u63A5 NT$8,000 \u8D77<br>" +
      "\uD83D\uDCC8 \u884C\u92B7\u5C0E\u5411\u7DB2\u7AD9 NT$15,000 \u8D77<br>" +
      "\uD83E\uDD16 AI \u667A\u80FD\u5BA2\u670D NT$3,000 \u8D77/\u6708<br>" +
      "\uD83C\uDFAC \u7D20\u6750\u8F49\u88FD\u670D\u52D9 NT$2,000 \u8D77" +
      "</div>" +
      '<div style="position:absolute;bottom:40px;text-align:center;">' +
      '<div style="font-size:12px;color:#d2691e;">AI \u667A\u80FD\u5927\u8166 | \u8B93\u7DB2\u7AD9\u81EA\u5DF1\u62DB\u651D\u5BA2\u6236</div>' +
      '<div style="font-size:10px;color:#888;margin-top:4px;">ai-brain-website.vercel.app</div>' +
      "</div>" +
      "</div>"
    );
  }

  function escHtml(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  return { generate };
})();
