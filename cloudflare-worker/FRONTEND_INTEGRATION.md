# 前端整合說明

本文件詳細說明如何修改 `chatbot.js` 以使用 Cloudflare Worker API 代理。

## 📋 修改清單

| 項目 | 修改前 | 修改後 |
|------|--------|--------|
| API Key | 暴露於前端 | 移除 |
| API URL | 直接呼叫 Google API | 呼叫 Worker 代理 |
| 請求格式 | 包含 API Key | 不包含 API Key |

## 🔧 詳細修改步驟

### 步驟 1: 更新 chatbot.js 開頭設定

**修改前:**

```javascript
// Gemini API 設定
const GEMINI_API_KEY = 'AIzaSyApMiwmJpbo0vX58K_n4sfCN6bqBDDd4Tk';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
```

**修改後:**

```javascript
// API 代理設定
// ⚠️ 請將 YOUR_SUBDOMAIN 替換為您的 Cloudflare Workers 子域名
const API_PROXY_URL = 'https://ai-brain-api-proxy.YOUR_SUBDOMAIN.workers.dev/api/chat';

// 本地開發時可使用：
// const API_PROXY_URL = 'http://localhost:8787/api/chat';
```

### 步驟 2: 修改 sendToGemini 函數

**修改前 (第 102-144 行):**

```javascript
async function sendToGemini(userMessage) {
    // 建立對話歷史
    conversationHistory.push({
        role: 'user',
        parts: [{ text: userMessage }]
    });

    const requestBody = {
        system_instruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }]
        },
        contents: conversationHistory,
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
        }
    };

    // ❌ 直接呼叫 Google API，暴露 API Key
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });

    // ... 其餘程式碼 ...
}
```

**修改後:**

```javascript
async function sendToGemini(userMessage) {
    // 建立對話歷史
    conversationHistory.push({
        role: 'user',
        parts: [{ text: userMessage }]
    });

    const requestBody = {
        system_instruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }]
        },
        contents: conversationHistory,
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
        }
        // 可選：指定其他模型
        // model: 'gemini-2.0-flash-thinking'
    };

    // ✅ 呼叫代理服務，API Key 安全儲存於後端
    const response = await fetch(API_PROXY_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        // 解析代理回傳的錯誤訊息
        let errorMessage = `API Error: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (e) {
            // 無法解析 JSON，使用預設錯誤訊息
        }
        throw new Error(errorMessage);
    }

    const data = await response.json();
    const botMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || '抱歉，我無法理解您的問題。';

    // 加入對話歷史
    conversationHistory.push({
        role: 'model',
        parts: [{ text: botMessage }]
    });

    return botMessage;
}
```

## 📝 完整修改版 chatbot.js 範例

以下是整合完成後的完整程式碼（僅顯示修改部分）：

```javascript
/**
 * AI 智能大腦公司 - Gemini 聊天客服
 * 使用 Cloudflare Worker 代理保護 API Key
 */

// =============================================================================
// API 設定
// =============================================================================

// 代理服務 URL（部署後請更新為實際網址）
const API_PROXY_URL = 'https://ai-brain-api-proxy.YOUR_SUBDOMAIN.workers.dev/api/chat';

// 客服人設 System Instructions
const SYSTEM_INSTRUCTION = `你是「AI 智能大腦公司」的專業 AI 客服顧問，名字叫「小腦」。
// ... 其餘人設保持不變 ...
`;

// 對話歷史
let conversationHistory = [];

// =============================================================================
// API 通訊
// =============================================================================

/**
 * 發送訊息到 Gemini API（透過代理）
 * @param {string} userMessage - 使用者訊息
 * @returns {Promise<string>} - AI 回應
 */
async function sendToGemini(userMessage) {
    conversationHistory.push({
        role: 'user',
        parts: [{ text: userMessage }]
    });

    const requestBody = {
        system_instruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }]
        },
        contents: conversationHistory,
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
        }
    };

    const response = await fetch(API_PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        let errorMessage = `API Error: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (e) { /* 略過 JSON 解析錯誤 */ }
        throw new Error(errorMessage);
    }

    const data = await response.json();
    const botMessage = data.candidates?.[0]?.content?.parts?.[0]?.text 
        || '抱歉，我無法理解您的問題。';

    conversationHistory.push({
        role: 'model',
        parts: [{ text: botMessage }]
    });

    return botMessage;
}

// ... 其餘程式碼保持不變 ...
```

## ✅ 驗證整合

### 1. 本地測試

```bash
# 在 cloudflare-worker 目錄啟動本地代理
cd cloudflare-worker
npx wrangler dev --var GEMINI_API_KEY:your-test-key

# 開啟另一個終端，啟動前端
cd ..
python -m http.server 8080
```

### 2. 瀏覽器測試

1. 開啟 `http://localhost:8080`
2. 點擊聊天圖示開啟對話視窗
3. 輸入測試訊息
4. 確認收到 AI 回應

### 3. 檢查開發者工具

開啟瀏覽器開發者工具 (F12)，確認：

- Network 面板：請求發送到 `localhost:8787/api/chat`（本地）或您的 Worker URL（生產）
- Console 面板：無 API Key 洩漏警告
- 請求 Payload：不包含 API Key

## 🔒 安全性確認

整合完成後，請確認以下事項：

- [ ] chatbot.js 中不再包含 `GEMINI_API_KEY` 變數
- [ ] 所有 API 請求都透過代理發送
- [ ] 瀏覽器 Network 面板看不到 Google API 直接呼叫
- [ ] 原始碼中搜尋不到 API Key 字串

## 🚨 常見問題

### CORS 錯誤

若出現 CORS 相關錯誤，請確認：
1. Worker 已正確部署
2. 使用正確的 Worker URL
3. 請求 Content-Type 設為 `application/json`

### 連線逾時

Worker 免費方案有 10ms CPU 時間限制。若經常逾時，可考慮：
1. 升級到 Workers Paid 方案
2. 縮短 `maxOutputTokens` 設定

### API Key 無效

```bash
# 重新設定 API Key
npx wrangler secret put GEMINI_API_KEY
```

---

*最後更新: 2026-01-05*
