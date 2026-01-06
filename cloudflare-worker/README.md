# AI 智能大腦 - Gemini API 代理

Cloudflare Worker 實現的 Gemini API 代理服務，用於保護 API Key 不暴露於前端。

## 📋 目錄

- [功能特點](#-功能特點)
- [快速開始](#-快速開始)
- [部署指南](#-部署指南)
- [API 說明](#-api-說明)
- [前端整合](#-前端整合)
- [常見問題](#-常見問題)

## ✨ 功能特點

- 🔒 **API Key 保護** - 密鑰安全儲存於 Cloudflare Workers Secrets
- 🌐 **CORS 支援** - 完整的跨域請求處理
- ⚡ **邊緣運算** - 利用 Cloudflare 全球節點，低延遲回應
- 📝 **請求驗證** - 自動驗證請求格式，預防無效呼叫
- 🔄 **透通轉發** - 支援 system_instruction 和對話歷史

## 🚀 快速開始

### 1. 安裝 Wrangler CLI

```bash
# 使用 npm 安裝
npm install -g wrangler

# 或使用 npx（無需全域安裝）
npx wrangler --version
```

### 2. 登入 Cloudflare

```bash
npx wrangler login
```

這會開啟瀏覽器進行 OAuth 授權。

### 3. 設定 Gemini API Key

```bash
npx wrangler secret put GEMINI_API_KEY
```

系統會提示您輸入 API Key，該值會被加密儲存。

> 💡 **取得 API Key**: 前往 [Google AI Studio](https://aistudio.google.com/apikey) 建立。

### 4. 部署 Worker

```bash
npx wrangler deploy
```

部署成功後，您會看到類似以下的輸出：

```
Published ai-brain-api-proxy (x.xx sec)
  https://ai-brain-api-proxy.your-subdomain.workers.dev
```

## 📚 部署指南

### 本地開發測試

```bash
# 啟動本地開發伺服器
npx wrangler dev

# 指定本地測試用的 API Key（僅限開發）
npx wrangler dev --var GEMINI_API_KEY:your-test-api-key
```

本地伺服器預設在 `http://localhost:8787` 運行。

### 多環境部署

若需要區分 staging/production 環境，可以在 `wrangler.toml` 中設定：

```toml
[env.staging]
name = "ai-brain-api-proxy-staging"

[env.production]
name = "ai-brain-api-proxy"
```

部署指令：

```bash
# 部署到 staging
npx wrangler deploy --env staging

# 部署到 production
npx wrangler deploy --env production
```

### 自訂域名

1. 前往 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 選擇 Workers & Pages → 您的 Worker
3. 點擊 Triggers → Add Custom Domain
4. 輸入您的子域名（例如：`api.your-domain.com`）

## 📡 API 說明

### POST /api/chat

發送聊天訊息到 Gemini API。

**請求格式:**

```json
{
  "system_instruction": {
    "parts": [{ "text": "你是一個專業的 AI 助手..." }]
  },
  "contents": [
    {
      "role": "user",
      "parts": [{ "text": "你好！" }]
    }
  ],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 1024
  },
  "model": "gemini-2.0-flash"
}
```

**回應格式:**

```json
{
  "candidates": [
    {
      "content": {
        "parts": [{ "text": "您好！有什麼我可以協助您的嗎？" }],
        "role": "model"
      }
    }
  ]
}
```

### GET /health

健康檢查端點。

```json
{
  "status": "ok",
  "service": "ai-brain-api-proxy",
  "timestamp": "2026-01-05T12:00:00.000Z"
}
```

## 🔧 前端整合

### 修改 chatbot.js

將原本直接呼叫 Gemini API 的程式碼改為呼叫代理服務：

#### 步驟 1: 更新 API 設定

```javascript
// 移除這些行（不再需要）
// const GEMINI_API_KEY = 'your-api-key';
// const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// 新增代理 URL
const API_PROXY_URL = 'https://ai-brain-api-proxy.your-subdomain.workers.dev/api/chat';
```

#### 步驟 2: 修改 sendToGemini 函數

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
        // 可選：指定模型
        // model: 'gemini-2.0-flash'
    };

    // 改為呼叫代理服務（不再需要 API Key）
    const response = await fetch(API_PROXY_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API Error: ${response.status}`);
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

### 完整前端範例

詳細的前端整合範例請參閱 [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md)。

## ❓ 常見問題

### Q: 部署後出現「API Key 未設定」錯誤？

確保已執行 `npx wrangler secret put GEMINI_API_KEY` 設定密鑰。

### Q: 出現 CORS 錯誤？

Worker 預設允許所有來源（`Access-Control-Allow-Origin: *`）。若仍有問題，請檢查：
- 請求是否使用正確的 HTTP 方法（POST）
- Content-Type 是否設為 `application/json`

### Q: 如何更新 API Key？

```bash
npx wrangler secret put GEMINI_API_KEY
# 輸入新的 API Key
```

### Q: 如何查看 Worker 日誌？

```bash
# 即時查看日誌
npx wrangler tail

# 或在 Cloudflare Dashboard 檢視
```

### Q: 如何刪除 Worker？

```bash
npx wrangler delete
```

## 📄 授權

MIT License

---

*AI 智能大腦公司 © 2026*
