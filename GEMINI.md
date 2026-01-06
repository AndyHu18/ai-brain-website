# 🤖 GEMINI.md - Gemini API 整合指南

> **版本**: v2.1.0  
> **建立日期**: 2026-01-05  
> **最後更新**: 2026-01-06  
> **狀態**: ✅ 開發模式就緒（生產環境需部署 Worker）

---

## 📋 概述

| 項目 | 內容 |
|------|------|
| **使用模型** | `gemini-2.0-flash` |
| **用途** | AI 智能客服聊天 |
| **API 版本** | v1beta |
| **客服人設** | 「小腦」- AI 智能大腦公司客服顧問 |

---

## 🔐 安全架構（必讀）

### 🔴 當前問題

```
⚠️ 警告：前端 API Key 暴露
位置：chatbot.js:7
風險等級：P0 嚴重
```

### ✅ 目標架構

```
                                    ┌─────────────────────┐
                                    │   Gemini API        │
                                    │   (Google Cloud)    │
                                    └─────────┬───────────┘
                                              │
                                              │ API Key 安全存放
                                              │
                              ┌───────────────▼───────────────┐
                              │   Cloudflare Worker           │
                              │   (API 代理)                   │
                              │                               │
                              │   - 驗證請求來源              │
                              │   - Rate Limiting             │
                              │   - CORS 處理                 │
                              └───────────────┬───────────────┘
                                              │
                                              │ 安全代理
                                              │
┌─────────────────────────────────────────────▼───────────────────────────────────┐
│                              Frontend (Browser)                                  │
│                                                                                  │
│   chatbot-core.js  ──►  fetch('/api/chat')  ──►  Worker URL                     │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 整合步驟

1. **部署 Cloudflare Worker**
   ```bash
   cd cloudflare-worker
   npx wrangler secret put GEMINI_API_KEY
   npx wrangler deploy
   ```

2. **更新 chatbot-core.js**
   ```javascript
   // 修改前
   const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/...';
   const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, ...);

   // 修改後
   const WORKER_URL = 'https://ai-brain-api-proxy.your-subdomain.workers.dev';
   const response = await fetch(`${WORKER_URL}/api/chat`, ...);
   ```

3. **刪除前端 API Key**
   - 移除 `chatbot.js` 或移至 `_archive/`
   - 確認沒有任何前端代碼包含 API Key

---

## 📝 System Instruction（客服人設）

```javascript
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
```

---

## ⚙️ API 配置

### Generation Config

```javascript
const generationConfig = {
    temperature: 0.7,      // 創意程度（0-1）
    topK: 40,              // Top-K 採樣
    topP: 0.95,            // Top-P 採樣
    maxOutputTokens: 1024  // 最大輸出 Token
};
```

### 建議調整

| 場景 | temperature | maxOutputTokens |
|------|-------------|-----------------|
| 客服諮詢 | 0.7 | 1024 |
| 技術支援 | 0.3 | 2048 |
| 創意內容 | 0.9 | 512 |

---

## 🔄 錯誤處理與韌性

### 超時機制 ✅ 已實作

```javascript
const TIMEOUT_MS = 15000; // 15 秒（已在 chatbot-core.js 實作）

async function fetchWithTimeout(url, options) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        return response;
    } finally {
        clearTimeout(timeout);
    }
}
```

### 重試策略 ✅ 已實作

```javascript
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // 指數退避

async function fetchWithRetry(url, options) {
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const response = await fetchWithTimeout(url, options);
            if (response.ok) return response;
            
            // 非重試錯誤直接拋出
            if (response.status === 400 || response.status === 401) {
                throw new Error(`Fatal Error: ${response.status}`);
            }
        } catch (error) {
            if (i === MAX_RETRIES - 1) throw error;
            await new Promise(r => setTimeout(r, RETRY_DELAYS[i]));
        }
    }
}
```

### 降級方案

```javascript
const FALLBACK_MESSAGES = [
    '抱歉，系統暫時忙碌中。請稍後再試，或直接填寫諮詢表單。',
    '目前無法連線到 AI 服務。您可以撥打客服專線：02-XXXX-XXXX',
    '服務暫時中斷，我們正在處理中。請稍後再試。'
];

function getFallbackMessage() {
    return FALLBACK_MESSAGES[0];
}
```

---

## 💰 成本估算

### Token 使用量

| 類型 | 平均 Token | 說明 |
|------|-----------|------|
| System Instruction | ~500 | 每次對話固定成本 |
| 用戶訊息 | 20-100 | 依問題長度 |
| 模型回應 | 100-500 | 依回答複雜度 |
| 對話歷史 | 累積 | 多輪對話會累積 |

### 預估成本（Gemini 2.0 Flash）

```
單次對話（5 輪）: ~2000 tokens
假設每日 100 次對話: ~200,000 tokens/day

Gemini Flash 定價:
- Input: $0.075 / 1M tokens
- Output: $0.30 / 1M tokens

預估月成本: < $30 USD
```

### 成本控制策略

1. **對話歷史限制**: 保留最近 10 輪對話
2. **最大輸出限制**: 設定 `maxOutputTokens: 1024`
3. **Rate Limiting**: 在 Worker 層限制每 IP 請求頻率

---

## 📊 監控指標

### 建議追蹤

| 指標 | 說明 | 警報閾值 |
|------|------|----------|
| 回應延遲 | API 回應時間 | > 5 秒 |
| 錯誤率 | API 錯誤次數 / 總次數 | > 5% |
| Token 使用量 | 每日消耗量 | > 500,000 |
| 用戶滿意度 | 用戶反饋 | < 80% 正面 |

---

## 🔗 相關文檔

- [ADR-001-gemini-api.md](adr/ADR-001-gemini-api.md) - API 選型決策
- [cloudflare-worker/README.md](cloudflare-worker/README.md) - Worker 部署指南
- [chatbot-core.js](chatbot-core.js) - API 調用實作

---

---

## 🔧 開發模式

### 快速設定（本地測試用）

在瀏覽器控制台執行：
```javascript
localStorage.setItem('GEMINI_API_KEY', '你的API金鑰');
location.reload();
```

### 模式說明

| 模式 | 條件 | 說明 |
|------|------|------|
| `dev` | localStorage 有 API Key | 直接調用 Gemini API |
| `prod` | Worker URL 已配置 | 透過 Cloudflare Worker 代理 |
| `unconfigured` | 兩者皆無 | 顯示友善錯誤訊息 |

### 生產環境部署

1. 部署 Cloudflare Worker（見 cloudflare-worker/README.md）
2. 更新 `chatbot-core.js` 中的 `WORKER_URL`
3. 清除 localStorage 中的開發用 API Key

---

*最後更新: 2026-01-06*
