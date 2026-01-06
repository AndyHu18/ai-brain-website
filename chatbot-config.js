/**
 * AI 智能大腦公司 - Chatbot 配置模組
 * 負責 API 端點配置與環境偵測
 * 
 * @module chatbot-config
 * @version 1.0.0
 * @dependencies 無
 * @exports API_CONFIG, SYSTEM_INSTRUCTION, isDevMode, getDevApiKey (全域)
 */

// ============================================================
// API 設定 - 雙模式支援（開發 / 生產）
// ============================================================

/**
 * API 端點配置
 * 
 * 🔧 開發模式設定方式：
 * 在瀏覽器控制台執行：
 * localStorage.setItem('GEMINI_API_KEY', '你的API金鑰');
 * 然後重新整理頁面
 * 
 * ⚠️ 生產環境部署時，請更新 WORKER_URL 並清除 localStorage
 */
const API_CONFIG = {
    // Cloudflare Worker URL（生產環境使用）
    // 格式：https://ai-brain-api-proxy.{your-subdomain}.workers.dev
    WORKER_URL: 'https://ai-brain-api-proxy.your-subdomain.workers.dev',

    // 直接 Gemini API URL（開發環境使用）
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',

    // API 端點
    CHAT_ENDPOINT: '/api/chat',

    // 超時設定（毫秒）
    TIMEOUT_MS: 15000,

    // 重試設定
    MAX_RETRIES: 3,
    RETRY_DELAYS: [1000, 2000, 4000],

    // 可重試的 HTTP 狀態碼
    RETRYABLE_STATUS: [408, 429, 500, 502, 503, 504]
};

// ============================================================
// 客服人設 System Instructions
// ============================================================
const SYSTEM_INSTRUCTION = `你是「AI 智能大腦公司」的專業 AI 客服顧問，名字叫「小腦」。

## 公司介紹
AI 智能大腦公司是一家專注於企業級 AI 導入的技術服務商。我們提供以下四大核心服務：

1. **智能語音服務** - 24/7 AI 電話客服、語音預約系統、客戶意圖識別
2. **智能數據分析** - 財報自動解讀、多源數據整合、風險預警
3. **流程自動化** - 企業工作流編排、跨系統資料同步、排程任務
4. **內容智能生成** - 影音轉錄摘要、品牌內容批量產出、SEO 優化

## 成功案例
- 上市公司財報分析系統：5分鐘完成150頁財報專業解讀
- AI 語音預約代理：支援中文自然對話，零漏接
- 影音內容智能轉錄平台：本地處理保護隱私
- 企業自動化框架：工業級穩定性

## 你的回應規則
1. 使用繁體中文回應
2. 語氣專業、友善、有溫度
3. 回答要簡潔有力，避免過長
4. 若用戶詢問價格，請說「我們提供客製化方案，建議留下聯繫方式，專人為您報價」
5. 若用戶想深入了解某項服務，提供更多細節並引導填寫諮詢表單
6. 若問題超出服務範圍，禮貌說明並引導回公司服務
7. 任何與 AI 相關的需求都可以接洽討論

## 開場白
首次互動時，請簡短自我介紹並詢問如何協助。`;

// ============================================================
// 環境偵測函數
// ============================================================

/**
 * 檢查是否為開發模式
 * @returns {boolean} 是否使用開發模式（直接調用 Gemini API）
 */
function isDevMode() {
    const hasDevKey = !!localStorage.getItem('GEMINI_API_KEY');
    const isPlaceholderUrl = API_CONFIG.WORKER_URL.includes('your-subdomain');
    return hasDevKey || isPlaceholderUrl;
}

/**
 * 取得開發模式的 API Key
 * @returns {string|null} API Key 或 null
 */
function getDevApiKey() {
    return localStorage.getItem('GEMINI_API_KEY');
}

// 暴露到全域（供其他模組使用）
window.API_CONFIG = API_CONFIG;
window.SYSTEM_INSTRUCTION = SYSTEM_INSTRUCTION;
window.isDevMode = isDevMode;
window.getDevApiKey = getDevApiKey;

console.log('📍[ChatbotConfig] 配置載入完成');
