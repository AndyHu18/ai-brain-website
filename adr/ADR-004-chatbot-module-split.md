# ADR-004: Chatbot 模組拆分決策

| 狀態 | 日期 | 決策者 |
|------|------|--------|
| **已接受** | 2026-01-05 | AI Brain Team |

## Context（背景）

原始的 `chatbot.js` 檔案超過 213 行，違反了專案的「200 行熔斷原則」。該檔案混合了多個職責：

1. API 通訊邏輯（Gemini API 調用）
2. UI 交互邏輯（視窗開關、訊息顯示）
3. 提示輪播邏輯（hint 氣泡文字切換）

這種混合導致：
- 代碼難以維護和測試
- 職責不清晰
- 無法獨立迭代各功能

## Decision（決策）

將 `chatbot.js` 拆分為三個獨立模組：

| 模組 | 職責 | 行數 |
|------|------|------|
| `chatbot-core.js` | API 通訊、對話歷史管理 | ~142 行 |
| `chatbot-ui.js` | UI 交互、訊息渲染、格式化 | ~159 行 |
| `chatbot-hints.js` | 提示氣泡輪播、計時器管理 | ~170 行 |

### 模組依賴關係

```
chatbot-core.js (無依賴)
       ↑
chatbot-ui.js (依賴 core)
       ↑
chatbot-hints.js (獨立)
```

### HTML 載入順序

```html
<script src="chatbot-core.js"></script>
<script src="chatbot-ui.js"></script>
<script src="chatbot-hints.js"></script>
```

## Consequences（後果）

### 正面

- ✅ 每個模組單一職責，易於理解
- ✅ 可獨立測試每個模組
- ✅ 符合 200 行原則
- ✅ CSS 對應拆分更清晰

### 負面

- ⚠️ HTTP 請求增加（3 個 JS 檔案而非 1 個）
- ⚠️ 需注意載入順序，否則會報錯

### 風險緩解

1. **HTTP 請求增加**
   - 生產環境可使用打包工具（如 Webpack）合併
   - 使用 HTTP/2 多路復用降低開銷

2. **載入順序依賴**
   - 在 HTML 中加入註解說明順序
   - 測試時確認模組正確載入

## 相關文檔

- [ARCHITECTURE.md](../ARCHITECTURE.md) - 200 行原則定義
- [chatbot-core.test.js](../tests/chatbot-core.test.js) - Core 模組測試
- [chatbot-ui.test.js](../tests/chatbot-ui.test.js) - UI 模組測試
- [chatbot-hints.test.js](../tests/chatbot-hints.test.js) - Hints 模組測試
