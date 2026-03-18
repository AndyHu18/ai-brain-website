/**
 * 網站分析器 - 配置模組
 * @module website-analyzer/config
 */

const WebsiteAnalyzerConfig = {
  // API 端點 - 使用本地 Serverless Function
  API_URL: "/api/analyze",

  // 重試設定
  MAX_RETRIES: 2,
  RETRY_DELAY: 2000,

  // 漸近式進度條設定
  PROGRESS: {
    MAX_PERCENT: 92,
    UPDATE_INTERVAL: 200,
    FAST_PHASE_DURATION: 5000,
    FAST_PHASE_TARGET: 30,
    MEDIUM_PHASE_DURATION: 20000,
    MEDIUM_PHASE_TARGET: 70,
  },

  // 根據經過時間顯示的狀態訊息
  PROGRESS_MESSAGES: [
    { after: 0, text: "🔗 正在連接網站..." },
    { after: 2000, text: "📄 抓取網頁內容..." },
    { after: 4000, text: "🔍 解析頁面結構..." },
    { after: 6000, text: "🤖 AI 正在分析業務模式..." },
    { after: 10000, text: "💡 識別 AI 導入機會..." },
    { after: 15000, text: "⚡ 評估自動化潛力..." },
    { after: 20000, text: "📈 計算預估效益..." },
    { after: 28000, text: "✍️ 撰寫優化建議..." },
    { after: 38000, text: "📋 整理分析報告..." },
    { after: 50000, text: "🔬 內容較豐富，深度分析中..." },
    { after: 65000, text: "⏳ 幾乎完成了，請稍候..." },
  ],

  // 等待期間輪播的知識卡
  FUN_FACTS: [
    {
      icon: "💡",
      text: "AI 客服可以同時處理 100+ 組對話，人類客服只能 1-3 組",
    },
    { icon: "📊", text: "導入 AI 的企業平均節省 40% 客服人力成本" },
    { icon: "⚡", text: "AI 回覆速度 < 1 秒，客戶滿意度提升 35%" },
    { icon: "🌙", text: "24 小時不休息，凌晨的訂單也不漏接" },
    { icon: "🎯", text: "AI 語音客服能聽懂台語、客語等在地口音" },
    { icon: "📈", text: "自動 SEO 文章每月可帶來 3-5 倍自然流量成長" },
    { icon: "🤖", text: "全球已有 67% 消費者用過 AI 客服，接受度逐年提升" },
    { icon: "💰", text: "一套 AI 客服的月費，不到傳統客服人員日薪" },
    { icon: "🔒", text: "企業級 AI 採用 AES-256 加密，資料安全有保障" },
    { icon: "🚀", text: "AI 分析師正在掃描您的網站，找出最佳 AI 導入機會..." },
  ],
  FUN_FACT_INTERVAL: 4500,
  FUN_FACT_START_DELAY: 3000,

  // 完整分析器 URL
  FULL_ANALYZER_URL: "https://ai-website-analyzer-beta.vercel.app",
};

// 暴露到全域
window.WebsiteAnalyzerConfig = WebsiteAnalyzerConfig;
