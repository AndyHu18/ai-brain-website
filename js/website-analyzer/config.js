/**
 * 網站分析器 - 配置模組
 * @module website-analyzer/config
 */

const WebsiteAnalyzerConfig = {
    // API 端點 - 使用本地 Serverless Function
    API_URL: '/api/analyze',

    // 重試設定
    MAX_RETRIES: 2,
    RETRY_DELAY: 2000,

    // 進度條階段 - 更豐富的動態狀態訊息
    PROGRESS_STAGES: [
        { percent: 5, text: '🔗 正在連接網站...' },
        { percent: 12, text: '📡 建立安全連線中...' },
        { percent: 20, text: '📄 抓取網頁內容...' },
        { percent: 28, text: '🔍 解析頁面結構...' },
        { percent: 35, text: '📊 掃描服務項目...' },
        { percent: 45, text: '🤖 AI 正在分析業務模式...' },
        { percent: 55, text: '💡 識別 AI 導入機會...' },
        { percent: 65, text: '⚡ 評估自動化潛力...' },
        { percent: 75, text: '📈 計算預估效益...' },
        { percent: 85, text: '✍️ 撰寫優化建議...' },
        { percent: 92, text: '📋 整理分析報告...' },
        { percent: 98, text: '✅ 最終檢查中...' }
    ],

    // 完整分析器 URL
    FULL_ANALYZER_URL: 'https://ai-website-analyzer-beta.vercel.app'
};

// 暴露到全域
window.WebsiteAnalyzerConfig = WebsiteAnalyzerConfig;
