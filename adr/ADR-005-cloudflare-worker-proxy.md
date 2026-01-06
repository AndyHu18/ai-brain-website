# ADR-005: Cloudflare Worker API 代理

| 狀態 | 日期 | 決策者 |
|------|------|--------|
| **已接受** | 2026-01-05 | AI Brain Team |

## Context（背景）

原始實現中，Gemini API Key 直接硬編碼在前端 JavaScript 中：

```javascript
// ❌ 嚴重安全漏洞
const GEMINI_API_KEY = 'AIzaSy...';
```

這導致：
- API Key 可被任何人透過瀏覽器開發者工具取得
- 惡意用戶可濫用 API 配額
- 無法實施 Rate Limiting
- 無法追蹤 API 使用情況

## Decision（決策）

引入 Cloudflare Worker 作為 API 代理層：

### 架構

```
瀏覽器
   │
   │ POST /api/chat
   ▼
Cloudflare Worker (API 代理)
   │
   │ + API Key (環境變數)
   ▼
Gemini API
```

### Worker 功能

1. **安全性**
   - API Key 存放在 Worker 環境變數中
   - 前端無法取得 API Key

2. **CORS 處理**
   - 自動處理跨域請求

3. **錯誤處理**
   - 統一的錯誤回應格式

4. **可擴展性**
   - 未來可加入 Rate Limiting
   - 可加入請求日誌

### 部署方式

```bash
cd cloudflare-worker
npx wrangler secret put GEMINI_API_KEY
npx wrangler deploy
```

## Consequences（後果）

### 正面

- ✅ API Key 完全隱藏
- ✅ 可實施請求限制
- ✅ 統一的錯誤處理
- ✅ Cloudflare 全球邊緣網路加速
- ✅ 免費額度足夠小型網站

### 負面

- ⚠️ 增加一層網路請求延遲（通常 10-50ms）
- ⚠️ 需要 Cloudflare 帳號
- ⚠️ 需要維護 Worker 代碼

### 成本分析

| 項目 | Cloudflare Workers 免費方案 |
|------|---------------------------|
| 每日請求數 | 100,000 |
| CPU 時間 | 10ms/請求 |
| 足夠支撐 | 中小型網站 |

## 相關文檔

- [cloudflare-worker/README.md](../cloudflare-worker/README.md) - 部署指南
- [GEMINI.md](../GEMINI.md) - API 整合指南
- [chatbot-core.js](../chatbot-core.js) - 前端調用代碼
