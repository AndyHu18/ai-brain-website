/**
 * 網站分析器 - API 和進度模組
 * @module website-analyzer/api
 */

const WebsiteAnalyzerAPI = {
  /**
   * 延遲工具函數
   * @param {number} ms - 毫秒數
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  /**
   * 更新進度條
   * @param {number} percent - 進度百分比
   * @param {string} text - 進度文字
   */
  updateProgress(percent, text) {
    const progressBar = document.getElementById("analyzer-progress-bar");
    const progressText = document.getElementById("analyzer-progress-text");
    if (progressBar) progressBar.style.width = percent + "%";
    if (progressText) progressText.textContent = text;
  },

  /**
   * 驗證分析資料完整性
   * @param {Object} analysis - 分析結果
   * @returns {boolean}
   */
  validateAnalysisData(analysis) {
    const hasServices = analysis.services?.length > 0;
    const hasOpps = analysis.aiOpportunities?.length > 0;
    const hasDepts = analysis.departmentInsights?.length > 0;
    const hasSummary = analysis.summary?.length > 50;
    return hasServices || hasOpps || hasDepts || hasSummary;
  },

  /**
   * 根據經過時間取得對應的狀態訊息
   */
  getProgressMessage(elapsed) {
    const messages = window.WebsiteAnalyzerConfig.PROGRESS_MESSAGES;
    let msg = messages[0].text;
    for (const m of messages) {
      if (elapsed >= m.after) msg = m.text;
      else break;
    }
    return msg;
  },

  /**
   * 漸近式進度計算 — 永遠不會到頂，速度越來越慢
   */
  calcAsymptoticPercent(elapsed) {
    const p = window.WebsiteAnalyzerConfig.PROGRESS;
    const max = p.MAX_PERCENT;

    if (elapsed <= p.FAST_PHASE_DURATION) {
      return (elapsed / p.FAST_PHASE_DURATION) * p.FAST_PHASE_TARGET;
    }

    const base = p.FAST_PHASE_TARGET;
    const remaining = max - base;
    const t = elapsed - p.FAST_PHASE_DURATION;
    const timeConstant = 30000;
    return base + remaining * (1 - Math.exp(-t / timeConstant));
  },

  /**
   * 帶漸近式進度的 API 請求
   * @param {string} url - 待分析的網站 URL
   * @returns {Promise<Object>}
   */
  async fetchWithProgress(url) {
    const config = window.WebsiteAnalyzerConfig;
    let progressAnimationDone = false;
    const startTime = Date.now();

    const progressAnimation = () => {
      if (progressAnimationDone) return;
      const elapsed = Date.now() - startTime;
      const percent = this.calcAsymptoticPercent(elapsed);
      const text = this.getProgressMessage(elapsed);
      this.updateProgress(Math.round(percent), text);
      requestAnimationFrame(progressAnimation);
    };

    requestAnimationFrame(progressAnimation);

    // 知識卡輪播
    let funFactTimer = null;
    const funFactEl = document.getElementById("analyzer-fun-facts");
    if (funFactEl && config.FUN_FACTS?.length) {
      const facts = [...config.FUN_FACTS].sort(() => Math.random() - 0.5);
      let factIdx = 0;
      const showFact = () => {
        const fact = facts[factIdx % facts.length];
        funFactEl.innerHTML = `<div class="fun-fact-card"><span class="fun-fact-text">${fact.text}</span></div>`;
        funFactEl
          .querySelector(".fun-fact-card")
          .classList.add("fun-fact-enter");
        factIdx++;
      };
      funFactTimer = setTimeout(() => {
        showFact();
        funFactTimer = setInterval(showFact, config.FUN_FACT_INTERVAL);
      }, config.FUN_FACT_START_DELAY);
    }

    const stopFunFacts = () => {
      if (funFactTimer) {
        clearInterval(funFactTimer);
        clearTimeout(funFactTimer);
      }
      if (funFactEl) funFactEl.innerHTML = "";
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);

      const response = await fetch(config.API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      // 先取得原始文字，再嘗試解析 JSON
      const rawText = await response.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (parseErr) {
        // 非 JSON 回應（如 Vercel 超時的純文字錯誤）
        console.error("[診斷] 非 JSON 回應:", rawText.slice(0, 200));
        progressAnimationDone = true;
        stopFunFacts();
        if (rawText.includes("FUNCTION_INVOCATION_TIMEOUT")) {
          throw new Error(
            "伺服器處理超時（60 秒），請換一個較簡單的網站試試，或加 LINE 由我們為您分析。",
          );
        }
        throw new Error("伺服器回應異常: " + rawText.slice(0, 100));
      }

      // 診斷日誌
      console.group("[診斷] API 回傳");
      console.log("狀態:", response.status, response.ok ? "OK" : "FAIL");
      if (data.timing) {
        console.log("耗時:", data.timing);
      }
      if (data.step) {
        console.log("失敗步驟:", data.step);
      }
      if (data.content) {
        console.log(
          "來源:",
          data.content.source,
          "子頁面:",
          data.content.subPagesCount,
        );
      }
      console.groupEnd();

      progressAnimationDone = true;
      stopFunFacts();

      if (!response.ok) {
        const stepMsg =
          data.step === "scrape"
            ? "（抓取網站失敗）"
            : data.step === "ai"
              ? "（AI 分析失敗）"
              : "";
        throw new Error((data.message || `HTTP ${response.status}`) + stepMsg);
      }

      return data;
    } catch (error) {
      progressAnimationDone = true;
      stopFunFacts();
      if (error.name === "AbortError") {
        throw new Error(
          "前端等待超時（90 秒），請換一個較簡單的網站試試，或加 LINE 由我們為您分析。",
        );
      }
      throw error;
    }
  },
};

// 暴露到全域
window.WebsiteAnalyzerAPI = WebsiteAnalyzerAPI;
