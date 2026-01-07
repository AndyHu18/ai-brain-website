# 🏗️ AI 智能大腦公司官網 - 專案憲法

> **版本**: v1.2.1  
> **建立日期**: 2026-01-05  
> **最後更新**: 2026-01-07 (修復 Chatbot ID 碰撞問題)

---

## 📋 專案概述

| 項目 | 內容 |
|------|------|
| **專案名稱** | AI 智能大腦公司官網 |
| **專案類型** | 企業形象官網 + AI 客服系統 |
| **技術棧** | 純靜態 HTML/CSS/JS + Gemini API |
| **目標客群** | B2B 企業決策者、高淨值用戶 |

---

## 🔴 強制規則（違反 = 禁止提交）

### 規則 1：200 行熔斷原則

```
┌─────────────────────────────────────────────────────────────┐
│  📏 單一檔案行數限制                                         │
├─────────────────────────────────────────────────────────────┤
│  🟢 < 150 行    → 健康，繼續開發                              │
│  🟡 150-200 行  → 警告，考慮拆分                              │
│  🔴 > 200 行    → 熔斷，強制拆分後才能提交                     │
└─────────────────────────────────────────────────────────────┘
```

**適用範圍**：所有 `.js`、`.css`、`.html` 檔案

**拆分策略**：
- **JS 檔案**：按功能模組拆分（Core/UI/Utils）
- **CSS 檔案**：按元件拆分（container/content/responsive）
- **HTML 檔案**：使用 template 或 include 機制

### 規則 2：API Key 零暴露原則

```
❌ 禁止：
const API_KEY = 'sk-xxxxx';  // 前端硬編碼

✅ 正確：
// 透過 Cloudflare Worker 代理
const API_URL = 'https://your-worker.workers.dev/api/chat';
```

**強制措施**：
- 所有 API Key 必須透過後端代理
- 前端代碼禁止包含任何機密資訊
- 提交前必須檢查 `grep -r "API_KEY\|api_key\|apiKey" .`

### 規則 3：ADR 決策紀錄強制

**觸發條件**（符合任一必須產出 ADR）：
- 選擇特定的 Library 或框架
- 定義核心數據結構
- 更改 API 通訊協議
- 引入新的設計模式

**ADR 三要素**：
```markdown
## Context（為什麼需要決策）
## Decision（選擇什麼方案）
## Consequences（代價是什麼）
```

### 規則 4：測試覆蓋率門檻

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 測試覆蓋率要求                                           │
├─────────────────────────────────────────────────────────────┤
│  單元測試覆蓋率  ≥ 80%                                       │
│  關鍵路徑必須有  Happy Path + Error Path 測試                 │
│  新增功能必須同時提交測試                                     │
└─────────────────────────────────────────────────────────────┘
```

### 規則 5：文檔同步更新

每次功能修改後，必須同步更新：
- [ ] `PROJECT_MAP.md` - 模組狀態
- [ ] `HANDOVER_NOTES.md` - 交接紀錄
- [ ] `ARCHITECTURE.md` - 如有架構變更

---

## 📁 目錄結構規範

```
ai-brain-website/
├── index.html                 # 主頁面（唯一 HTML）
├── script-navigation.js       # 導航互動邏輯
├── script-interactions.js     # 頁面互動邏輯
│
├── chatbot-core.js            # API 通訊 (< 200 行)
├── chatbot-ui.js              # UI 互動 (< 200 行)
├── chatbot-hints.js           # 提示輪播 (< 200 行)
├── chatbot-api.js             # API 封裝 (< 200 行)
├── chatbot-config.js          # 配置項 (< 200 行)
│
├── pages/                     # 服務頁面
│   ├── service-content-editor.html    # 自動流量小編
│   ├── service-brand-clone.html       # 品牌分身術
│   ├── service-chatbot.html           # 客服機器人
│   ├── service-meeting-notes.html     # 會議記錄工
│   ├── service-voice-assistant.html   # 智慧接線生
│   ├── service-consultant.html        # AI 顧問
│   └── service-voice-receptionist.html # (舊版)
│
├── js/
│   └── workflow-engine.js     # n8n 工作流程引擎
│
├── css/
│   ├── variables.css          # CSS 變數（必須首先載入）
│   ├── base.css               # 基礎樣式
│   ├── layout.css             # 佈局
│   ├── components.css         # 通用元件
│   ├── animations-*.css       # 動畫（已拆分）
│   ├── sections-*.css         # 區塊樣式（已拆分）
│   ├── service-page-*.css     # 服務頁面樣式
│   ├── n8n-workflow.css       # n8n 工作流程樣式（來源專案）
│   ├── n8n-responsive.css     # n8n 響應式補充
│   └── chatbot/               # 聊天客服（已拆分）
│
├── adr/                       # 架構決策紀錄
│   ├── ADR-001-*.md
│   ├── ADR-002-*.md
│   └── ...
│
├── tests/                     # 測試套件
│   ├── package.json
│   ├── *.test.js
│   └── node_modules/
│
├── cloudflare-worker/         # API 代理
│   ├── worker.js
│   ├── wrangler.toml
│   └── README.md
│
├── assets/
│   ├── images/
│   └── videos/
│       └── services/          # 服務頁面視頻
│
├── _archive/                  # 廢棄檔案存檔（禁止物理刪除）
│
├── ARCHITECTURE.md            # 專案憲法（本文件）
├── PROJECT_MAP.md             # 專案地圖
├── HANDOVER_NOTES.md          # 交接紀錄
├── TASKS.md                   # 任務追蹤
└── README.md                  # 快速入門
```

---

## 🎨 CSS 架構規範

### 檔案命名規範

| 類型 | 命名格式 | 範例 |
|------|----------|------|
| 元件 CSS | `{component}.css` | `chatbot.css` |
| 區塊 CSS | `{section}.css` | `hero.css` |
| 工具 CSS | `{utility}.css` | `animations.css` |
| 子模組 | `{parent}-{child}.css` | `chatbot-window.css` |

### 超標檔案拆分策略

**chatbot.css (311 行) → 3 個檔案**：
```
css/chatbot/
├── chatbot-toggle.css     # 切換按鈕樣式 (~80 行)
├── chatbot-window.css     # 視窗主體樣式 (~120 行)
└── chatbot-messages.css   # 訊息樣式 (~110 行)
```

**sections.css (235 行) → 2 個檔案**：
```
css/
├── sections.css           # 通用區塊 (~120 行)
└── sections-services.css  # 服務區塊 (~115 行)
```

**service-fullscreen.css (296 行) → 2 個檔案**：
```
css/
├── service-fullscreen-layout.css   # 佈局 (~150 行)
└── service-fullscreen-cards.css    # 卡片樣式 (~146 行)
```

### CSS 變數強制使用

```css
/* ❌ 禁止硬編碼 */
.element {
    color: #E67E22;
    padding: 16px;
}

/* ✅ 使用變數 */
.element {
    color: var(--color-primary);
    padding: var(--spacing-md);
}
```

---

## 📜 JavaScript 架構規範

### 模組化原則

```javascript
/**
 * @file    : {filename}.js
 * @purpose : {一句話描述職責}
 * @depends : [{依賴的模組}]
 * @usedBy  : [{被誰使用}]
 */
```

### 全域變數暴露

```javascript
// ✅ 正確：明確暴露到 window
window.ChatbotCore = ChatbotCore;

// ❌ 禁止：隱式全域
ChatbotCore = { ... };
```

### 錯誤處理強制

```javascript
// ✅ 所有外部調用必須 try/catch
try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
} catch (error) {
    console.error('📍[模組名] 錯誤:', error);
    throw error; // 或返回預設值
}
```

---

## 🧪 測試規範

### 測試檔案命名

```
{module}.test.js
```

### 測試結構

```javascript
describe('模組名', () => {
    describe('功能分類', () => {
        test('應該 {預期行為}', () => {
            // Arrange → Act → Assert
        });
    });
});
```

### 必須測試的情境

- ✅ Happy Path（正常流程）
- ✅ Edge Cases（null/empty/極端值）
- ✅ Error Handling（錯誤捕獲）
- ✅ DOM 不存在時的行為

---

## 🔐 安全規範

### 禁止事項

| 🚫 禁止 | ✅ 替代方案 |
|---------|-------------|
| 前端存放 API Key | 使用 Cloudflare Worker 代理 |
| 使用 `eval()` | 使用安全的替代方案 |
| 直接拼接 SQL/HTML | 使用參數化/編碼 |
| 硬編碼環境變數 | 使用 `.env` 或環境變數 |

---

## 📊 提交前檢查清單

```
□ 所有檔案 ≤ 200 行？
□ 無硬編碼 API Key？
□ 測試全部通過？
□ ADR 已更新（如有架構變更）？
□ 文檔已同步更新？
□ `npm run lint` 無錯誤？
```

---

## 📌 快速參考

### 啟動本地伺服器
```bash
cd C:\Users\user\.gemini\antigravity\scratch\ai-brain-website
python -m http.server 8080
# 訪問 http://localhost:8080
```

### 執行測試
```bash
cd tests
npm install
npm test
npm run test:coverage
```

### 部署 Cloudflare Worker
```bash
cd cloudflare-worker
npx wrangler deploy
```

---

*本文件為專案憲法，所有開發必須遵守上述規則。*
