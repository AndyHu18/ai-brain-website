/**
 * 網站分析器 - 主入口模組
 * @module website-analyzer/index
 * @depends config.js, api.js, ui.js, render-sections.js, render-report.js
 */

const WebsiteAnalyzer = (function () {
  "use strict";

  const config = () => window.WebsiteAnalyzerConfig;
  const api = () => window.WebsiteAnalyzerAPI;
  const ui = () => window.WebsiteAnalyzerUI;
  const report = () => window.WebsiteAnalyzerReport;

  /**
   * 初始化模組
   */
  function init() {
    ui().initElements();

    if (!ui().hasElements()) {
      console.log("📍[WebsiteAnalyzer] 分析器區塊不存在，跳過初始化");
      return;
    }

    ui().elements.analyzeBtn.addEventListener("click", handleAnalyze);
    ui().elements.urlInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleAnalyze();
    });

    console.log("📍[WebsiteAnalyzer] 初始化完成");
  }

  /**
   * 處理分析請求（含重試機制）
   */
  async function handleAnalyze() {
    const url = ui().getUrlValue();
    if (!url) {
      ui().showError("請輸入網站網址");
      return;
    }

    ui().showLoading();
    ui().hideError();
    ui().hideResult();
    api().updateProgress(0, "準備分析...");

    let lastError = null;
    for (let attempt = 0; attempt <= config().MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          api().updateProgress(
            5,
            `重試中 (${attempt}/${config().MAX_RETRIES})...`,
          );
          await api().sleep(config().RETRY_DELAY);
        }

        const data = await api().fetchWithProgress(url);

        // 驗證資料完整性
        if (data.analysis && api().validateAnalysisData(data.analysis)) {
          api().updateProgress(100, "分析完成！");
          await api().sleep(300);
          report().renderReport(data, ui().getResultContainer());
          ui().hideLoading();

          // 自動觸發語音播報生成
          if (window.AnalyzerTTS) {
            window.AnalyzerTTS.generate(data);
          }
          return;
        } else {
          throw new Error("分析結果資料不完整，正在重試...");
        }
      } catch (error) {
        console.error(`📍[WebsiteAnalyzer] 嘗試 ${attempt + 1} 失敗:`, error);
        lastError = error;
      }
    }

    // 所有重試都失敗
    ui().showError(lastError?.message || "分析失敗，請稍後再試");
    ui().hideLoading();
  }

  // DOM 載入後初始化
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  return { init, handleAnalyze };
})();

// 掛載到全域
window.WebsiteAnalyzer = WebsiteAnalyzer;

console.log("📍[WebsiteAnalyzer] 模組載入完成");
