/**
 * 網站分析器 - 報告主體渲染模組
 * @module website-analyzer/render-report
 */

const WebsiteAnalyzerReport = {
  /**
   * 渲染完整報告
   * @param {Object} report - 分析報告數據
   * @param {HTMLElement} resultContainer - 結果容器元素
   */
  renderReport(report, resultContainer) {
    const config = window.WebsiteAnalyzerConfig;
    const sections = window.WebsiteAnalyzerSections;
    const analysis = report.analysis;
    const generatedTime = new Date(report.generatedAt).toLocaleString("zh-TW");

    let html = `
            <div class="analyzer-report">
                <div class="report-header">
                    <h3>30 秒看懂：AI 能幫你省多少？</h3>
                    <p class="report-title">${report.websiteTitle}</p>
                    <p class="report-meta">網址：${report.websiteUrl} | 生成時間：${generatedTime}</p>
                </div>
        `;

    // 📥 PDF 下載 + 🔊 語音播報區塊
    html += this._renderDownloadSection(report);

    // 摘要（智能分段 + 重點標記）
    if (analysis.summary) {
      html += this._renderSummary(analysis.summary);
    }

    html += '<div class="report-sections">';
    html += sections.renderServicesSection(analysis.services);
    html += sections.renderOpportunitiesTable(analysis.aiOpportunities);
    html += sections.renderDepartmentsSection(analysis.departmentInsights);
    html += sections.renderPositionsSection(analysis.positionOpportunities);
    html += sections.renderOptimizationsSection(analysis.websiteOptimizations);
    html += sections.renderSalesFunnelSection(analysis.salesFunnelAI);
    html += "</div>";

    // 🏢 公司介紹區塊
    html += this._renderCompanyIntro();

    // 📥 底部 PDF 下載區塊
    html += this._renderDownloadSection(report, true);

    // LINE 諮詢 CTA
    html += `
            <div class="report-cta report-cta-line">
                <p class="cta-text">想進一步了解如何導入 AI？歡迎直接聯繫我們</p>
                <a href="https://line.me/ti/p/5gW0er9baG" target="_blank" rel="noopener" class="cta-button cta-button-line">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
                    LINE 免費諮詢
                </a>
            </div>
        `;

    html += "</div>";
    resultContainer.innerHTML = html;
    resultContainer.style.display = "block";
    resultContainer.scrollIntoView({ behavior: "smooth", block: "start" });

    // 綁定事件
    this._bindPDFButtons(report);
    this._bindTTSButton(report);
  },

  /**
   * 渲染執行摘要（智能分段 + 重點標記）
   */
  _renderSummary(summary) {
    const sentences = summary
      .replace(/；/g, "。")
      .split(/(?<=[。！？\n])/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // 分組：每 2-3 句一段
    const paragraphs = [];
    let current = [];
    for (const s of sentences) {
      current.push(s);
      if (current.join("").length > 80 || current.length >= 3) {
        paragraphs.push(current.join(""));
        current = [];
      }
    }
    if (current.length > 0) paragraphs.push(current.join(""));

    // 標記數字和百分比
    const highlight = (text) =>
      text
        .replace(
          /(\d+(?:\.\d+)?%)/g,
          '<strong class="summary-stat">$1</strong>',
        )
        .replace(
          /(\d+(?:\.\d+)?)\s*倍/g,
          '<strong class="summary-stat">$1 倍</strong>',
        );

    let html = '<div class="report-summary">';
    html += "<h4>執行摘要</h4>";
    html += '<div class="summary-content">';
    for (const p of paragraphs) {
      html += `<p>${highlight(p)}</p>`;
    }
    html += "</div></div>";
    return html;
  },

  /**
   * 渲染下載區塊
   */
  _renderDownloadSection(report, isBottom = false) {
    const id = isBottom ? "download-pdf-btn-bottom" : "download-pdf-btn";
    const cls = isBottom
      ? "report-download-section report-download-bottom"
      : "report-download-section";
    const btnCls = isBottom
      ? "pdf-download-btn pdf-download-btn-bottom"
      : "pdf-download-btn";
    const btnText = isBottom ? "下載完整 PDF 報告" : "下載 PDF 報告";

    const ttsBtn = isBottom
      ? ""
      : `<button class="tts-generate-btn" id="analyzer-tts-btn" data-report='${JSON.stringify(report).replace(/'/g, "\\'")}'>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                    </svg>
                    <span class="tts-btn-text">語音播報</span>
                    <span class="tts-spinner"></span>
                </button>`;

    return `
            <div class="${cls}">
                <button class="${btnCls}" id="${id}" data-report='${JSON.stringify(report).replace(/'/g, "\\'")}'>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7,10 12,15 17,10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    <span class="btn-text">${btnText}</span>
                </button>
                ${ttsBtn}
                ${isBottom ? '<p class="download-hint">包含所有分析結果與 AI 智能大腦公司介紹</p>' : ""}
            </div>
        `;
  },

  /**
   * 渲染公司介紹區塊
   */
  _renderCompanyIntro() {
    return `
            <div class="company-intro-section">
                <div class="company-intro-header">
                    <div class="company-logo-placeholder">AI</div>
                    <div>
                        <h4>AI 智能大腦公司</h4>
                        <p>企業級 AI 導入專家</p>
                    </div>
                </div>
                <div class="company-intro-content">
                    <p>我們專注於將人工智慧技術轉化為可落地的商業解決方案，協助企業降低營運成本、提升服務效率、創造競爭優勢。</p>
                    <div class="company-services-grid">
                        <div class="company-service-tag">自動流量小編</div>
                        <div class="company-service-tag">智慧接線生</div>
                        <div class="company-service-tag">品牌分身術</div>
                        <div class="company-service-tag">客服機器人</div>
                        <div class="company-service-tag">智慧會議秘書</div>
                        <div class="company-service-tag">AI 顧問</div>
                    </div>
                </div>
            </div>
        `;
  },

  /**
   * 渲染 Email CTA
   */
  _renderEmailCTA() {
    return `
            <div class="report-email-cta">
                <div class="email-cta-header">
                    <span class="email-icon">
                        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="2" y="4" width="20" height="16" rx="2"/>
                            <polyline points="22,6 12,13 2,6"/>
                        </svg>
                    </span>
                    <h4>將報告寄到您的信箱</h4>
                    <p>保存這份分析結果，隨時回顧</p>
                </div>
                <form class="email-capture-form" id="report-email-form">
                    <input type="email" id="report-email-input" placeholder="請輸入您的 Email" required>
                    <button type="submit" class="email-submit-btn">寄送報告</button>
                </form>
                <p class="email-hint">建議使用公司信箱，方便團隊討論</p>
            </div>
        `;
  },

  /**
   * 綁定 PDF 下載按鈕事件
   */
  _bindPDFButtons(report) {
    const pdfButtons = [
      document.getElementById("download-pdf-btn"),
      document.getElementById("download-pdf-btn-bottom"),
    ];

    pdfButtons.forEach((pdfBtn) => {
      if (pdfBtn) {
        pdfBtn.addEventListener("click", async function () {
          const btn = this;
          const originalText = btn.querySelector(".btn-text").textContent;

          try {
            btn.classList.add("pdf-generating");
            btn.querySelector(".btn-text").textContent = "生成中...";
            btn.disabled = true;

            await window.PDFGenerator.generatePDF(report);

            btn.querySelector(".btn-text").textContent = "下載完成！";
            setTimeout(() => {
              btn.querySelector(".btn-text").textContent = originalText;
              btn.classList.remove("pdf-generating");
              btn.disabled = false;
            }, 2000);
          } catch (error) {
            console.error("📍[WebsiteAnalyzer] PDF 生成失敗:", error);
            btn.querySelector(".btn-text").textContent = "生成失敗";
            setTimeout(() => {
              btn.querySelector(".btn-text").textContent = originalText;
              btn.classList.remove("pdf-generating");
              btn.disabled = false;
            }, 2000);
          }
        });
      }
    });
  },

  /**
   * 綁定語音播報按鈕事件
   */
  _bindTTSButton(report) {
    const ttsBtn = document.getElementById("analyzer-tts-btn");
    if (ttsBtn && window.AnalyzerTTS) {
      ttsBtn.addEventListener("click", function () {
        if (ttsBtn.classList.contains("tts-ready")) {
          // 已生成，直接播放
          const bar = document.getElementById("analyzerBottomBar");
          if (bar && bar.classList.contains("visible")) {
            const playBtn = document.getElementById("analyzerBarPlayBtn");
            if (playBtn) playBtn.click();
          }
          return;
        }
        window.AnalyzerTTS.generate(report);
      });
    }
  },

  /**
   * 綁定 Email 表單事件
   */
  _bindEmailForm(report) {
    const emailForm = document.getElementById("report-email-form");
    if (emailForm) {
      emailForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("report-email-input").value;
        this._handleEmailSubmit(email, report);
      });
    }
  },

  /**
   * 處理 Email 提交
   */
  _handleEmailSubmit(email, report) {
    const form = document.getElementById("report-email-form");
    const submitBtn = form.querySelector(".email-submit-btn");

    if (!email || !email.includes("@")) {
      alert("請輸入有效的 Email 地址");
      return;
    }

    submitBtn.textContent = "發送中...";
    submitBtn.disabled = true;

    setTimeout(() => {
      form.innerHTML = `
                <div class="email-success">
                    <span class="success-icon">✅</span>
                    <p>報告已發送至 <strong>${email}</strong></p>
                    <p class="success-hint">同時，我們會在 24 小時內與您聯繫</p>
                </div>
            `;
      console.log(
        "📧 [Lead Capture] Email:",
        email,
        "Website:",
        report.websiteUrl,
      );
    }, 1500);
  },
};

// 暴露到全域
window.WebsiteAnalyzerReport = WebsiteAnalyzerReport;
