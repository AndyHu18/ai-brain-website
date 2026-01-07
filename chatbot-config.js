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
    // Vercel Serverless Function（生產環境使用相對路徑）
    // 留空表示使用相對路徑 /api/chat
    WORKER_URL: '',

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
AI 智能大腦公司是一家專注於企業級 AI 導入的技術服務商。我們提供以下六大核心服務：

1. **自動流量小編** - AI 自動產出 SEO 優化文章，幫企業做內容行銷
2. **智慧接線生** - 24/7 AI 電話客服、語音預約系統、客戶意圖識別
3. **品牌分身術** - 複製品牌語調，自動回覆社群貼文和私訊
4. **客服機器人** - 智能 FAQ 問答，減少 80% 重複問題
5. **智慧會議秘書** - 會議錄音自動轉逐字稿並生成摘要
6. **AI 顧問** - 企業 AI 導入規劃與諮詢服務

## 成功案例
- 上市公司財報分析系統：5分鐘完成150頁財報專業解讀
- AI 語音預約代理：支援中文自然對話，零漏接
- 影音內容智能轉錄平台：本地處理保護隱私
- 企業自動化框架：工業級穩定性

## 你的回應規則
1. 使用繁體中文回應
2. 語氣專業、友善、有溫度
3. 回答要簡潔有力，避免過長
4. **不要自我介紹**，系統已經向用戶顯示了歡迎訊息，直接回答問題即可
5. 若用戶詢問價格，請說「我們提供客製化方案，建議留下聯繫方式，專人為您報價」
6. 若用戶想深入了解某項服務，提供更多細節並引導填寫諮詢表單
7. 若問題超出服務範圍，禮貌說明並引導回公司服務
8. 任何與 AI 相關的需求都可以接洽討論`;

// ============================================================
// 環境偵測函數
// ============================================================

/**
 * 檢查是否為開發模式
 * @returns {boolean} 是否使用開發模式（直接調用 Gemini API）
 */
function isDevMode() {
    // 只有當 localStorage 有 API Key 時才是開發模式
    // 生產環境使用 Vercel Serverless Function（WORKER_URL 為空 = 使用相對路徑）
    return !!localStorage.getItem('GEMINI_API_KEY');
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
