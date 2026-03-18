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
      const response = await fetch(config.API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      // 🔍 診斷模式：記錄 API 回傳的原始數據
      console.group("📊 [診斷] API 原始回傳數據");
      console.log("🌐 請求 URL:", url);
      console.log("📦 回應狀態:", response.status, response.ok ? "✅" : "❌");

      if (data.content) {
        console.log("📄 抓取內容:", {
          標題: data.content.title,
          描述: data.content.description?.slice(0, 100) + "...",
          textContent長度: data.content.textContent?.length || 0,
          導航項目數: data.content.navigation?.length || 0,
          導航項目: data.content.navigation,
        });
      }

      if (data.analysis) {
        console.log("🤖 AI 分析結果:", {
          services數量: data.analysis.services?.length || 0,
          services內容: data.analysis.services,
          aiOpportunities數量: data.analysis.aiOpportunities?.length || 0,
          departmentInsights數量: data.analysis.departmentInsights?.length || 0,
          positionOpportunities數量:
            data.analysis.positionOpportunities?.length || 0,
          websiteOptimizations數量:
            data.analysis.websiteOptimizations?.length || 0,
          salesFunnelAI數量: data.analysis.salesFunnelAI?.length || 0,
          summary長度: data.analysis.summary?.length || 0,
          summary前100字: data.analysis.summary?.slice(0, 100) + "...",
        });
      }

      console.log("📋 完整原始數據:", JSON.parse(JSON.stringify(data)));
      console.groupEnd();

      progressAnimationDone = true;
      stopFunFacts();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      progressAnimationDone = true;
      stopFunFacts();
      throw error;
    }
  },
};

// 暴露到全域
window.WebsiteAnalyzerAPI = WebsiteAnalyzerAPI;
