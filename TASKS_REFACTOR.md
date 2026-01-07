# 🔧 程式碼重構執行計劃

> **建立日期**：2026-01-07  
> **專案進度**：約 1/5（活躍開發中）  
> **目標**：將超標檔案拆分至符合 200 行原則，並建立預防機制

---

## 📋 執行摘要

| 項目 | 內容 |
|------|------|
| **背景** | 8 個檔案超過 200 行原則，專案僅完成 1/5，需及早重構 |
| **策略** | 分階段漸進式重構 + 建立預防規範 |
| **預估時間** | Phase 0-1：約 6 小時；Phase 2-3：依開發進度觸發 |
| **風險等級** | 中（有測試保護可降至 10-15% 殘留風險） |

---

## 📊 待處理檔案清單

| 優先級 | 檔案 | 行數 | 超標倍數 | 處理策略 |
|--------|------|------|----------|----------|
| 🔴 P0 | css/p1-marketing.css | 1580 | 7.9x | Phase 1 拆分 |
| 🔴 P0 | css/n8n-workflow.css | 1493 | 7.5x | Phase 1 拆分 |
| 🟠 P1 | js/pdf-generator.js | 763 | 3.8x | Phase 2 觸發拆分 |
| 🟠 P1 | js/website-analyzer.js | 622 | 3.1x | Phase 2 觸發拆分 |
| 🟠 P1 | js/workflow-engine.js | 583 | 2.9x | Phase 2 觸發拆分 |
| 🟡 P2 | js/maturity-quiz.js | 311 | 1.6x | Phase 1 拆分 |
| 🟡 P2 | js/chatbot-ui.js | 245 | 1.2x | Phase 2 觸發拆分 |
| ⚪ P3 | index.html | 1127 | 5.6x | Phase 3 評估 SSG |

---

## 🎯 Phase 0：準備工作（今天執行）

### 0.1 Git 安全備份
```bash
# 創建備份分支
git checkout -b backup/pre-refactor-20260107
git push origin backup/pre-refactor-20260107

# 創建工作分支
git checkout main
git checkout -b feature/code-refactor
```

- [ ] 創建備份分支 `backup/pre-refactor-20260107`
- [ ] 創建工作分支 `feature/code-refactor`
- [ ] 確認備份已推送到遠端

### 0.2 視覺基準線建立
- [ ] 截取 index.html 首頁（桌面版 1920x1080）
- [ ] 截取 index.html 首頁（手機版 375x812）
- [ ] 截取 6 個服務頁面（各截一張）
- [ ] 將截圖存放在 `.refactor-baseline/` 目錄

### 0.3 測試基準確認
```bash
# 確認現有測試全部通過
npm test
```
- [ ] 52 個測試全部通過
- [ ] 記錄測試通過時間戳

### 0.4 更新 ARCHITECTURE.md
- [ ] 新增「全域變數註冊表」章節
- [ ] 新增「CSS 命名規範」章節
- [ ] 新增「新功能開發 Checklist」章節
- [ ] 記錄本次重構決策的 ADR

---

## 🎯 Phase 1：高優先級拆分（本週執行）

### 1.1 拆分 css/p1-marketing.css（1580 行 → 約 12 個檔案）

#### 預計拆分結構
```
css/p1-marketing/
├── _index.css              # 主入口（import 所有子檔案）
├── _variables.css          # 區塊共用變數（~20 行）
├── not-for-section.css     # 負面過濾區塊（~60 行）
├── origin-story.css        # 嚮導起源故事（~80 行）
├── real-scenario.css       # 真實場景模擬（~100 行）
├── workflow-layers.css     # 分層技術展示（~90 行）
├── industries.css          # 適合行業列表（~70 行）
├── guarantee.css           # 保證區塊（~60 行）
├── voice-collection.css    # 聲音收集區塊（~50 行）
├── maturity-quiz.css       # 成熟度測驗（~150 行）
├── content-nurture.css     # 內容培育（~80 行）
├── scarcity.css            # 稀缺性系統（~60 行）
└── responsive.css          # 響應式覆蓋（~200 行）
```

#### 執行步驟
- [ ] Step 1.1.1：創建 `css/p1-marketing/` 目錄
- [ ] Step 1.1.2：創建 `_variables.css` 並移動區塊變數
- [ ] Step 1.1.3：逐一拆分各區塊 CSS
- [ ] Step 1.1.4：創建 `_index.css` 整合所有 import
- [ ] Step 1.1.5：更新 `index.html` 的 CSS 引用
- [ ] Step 1.1.6：**驗證閘門**（Console 檢查 + 截圖對比）
- [ ] Step 1.1.7：Git commit `refactor(css): split p1-marketing.css into modules`

#### 驗證 Checklist
- [ ] Console 零錯誤
- [ ] 首頁視覺對比無差異
- [ ] 所有服務頁面視覺對比無差異
- [ ] 響應式斷點正常（Mobile/Tablet/Desktop）

---

### 1.2 拆分 css/n8n-workflow.css（1493 行 → 約 10 個檔案）

#### 預計拆分結構
```
css/n8n-workflow/
├── _index.css              # 主入口
├── _variables.css          # 配色與動畫變數（~60 行）
├── base-reset.css          # Reset 與基礎樣式（~50 行）
├── container.css           # 容器與佈局（~80 行）
├── intro-section.css       # 介紹區塊（~100 行）
├── status-bar.css          # 狀態列（~70 行）
├── canvas.css              # 畫布區域（~80 行）
├── nodes.css               # 節點樣式（~200 行）
├── connections.css         # 連線樣式（~100 行）
├── animations.css          # 動畫 @keyframes（~200 行）
└── responsive.css          # 響應式（~150 行）
```

#### 執行步驟
- [ ] Step 1.2.1：創建 `css/n8n-workflow/` 目錄
- [ ] Step 1.2.2：抽取 CSS 變數到 `_variables.css`
- [ ] Step 1.2.3：逐一拆分各區塊
- [ ] Step 1.2.4：創建 `_index.css` 整合
- [ ] Step 1.2.5：更新所有服務頁面的 CSS 引用
- [ ] Step 1.2.6：**驗證閘門**
- [ ] Step 1.2.7：Git commit `refactor(css): split n8n-workflow.css into modules`

---

### 1.3 拆分 js/maturity-quiz.js（311 行 → 約 3 個檔案）

#### 預計拆分結構
```
js/maturity-quiz/
├── index.js                # 主入口 + 初始化（~50 行）
├── questions-config.js     # 問題配置數據（~100 行）
├── results-config.js       # 結果配置數據（~50 行）
└── quiz-logic.js           # 測驗邏輯（~100 行）
```

#### 執行步驟
- [ ] Step 1.3.1：創建 `js/maturity-quiz/` 目錄
- [ ] Step 1.3.2：抽取問題配置到 `questions-config.js`
- [ ] Step 1.3.3：抽取結果配置到 `results-config.js`
- [ ] Step 1.3.4：抽取邏輯到 `quiz-logic.js`
- [ ] Step 1.3.5：創建 `index.js` 整合
- [ ] Step 1.3.6：更新 HTML script 引用
- [ ] Step 1.3.7：**驗證閘門**（測驗流程完整測試）
- [ ] Step 1.3.8：Git commit `refactor(js): split maturity-quiz.js into modules`

---

## 🎯 Phase 2：觸發式拆分（依開發進度執行）

### 觸發條件
當需要**修改超過 50 行**或**新增功能**到以下檔案時，觸發拆分：

| 檔案 | 當前行數 | 觸發拆分時機 |
|------|----------|--------------|
| js/pdf-generator.js | 763 | 新增報告類型時 |
| js/website-analyzer.js | 622 | 新增分析維度時 |
| js/workflow-engine.js | 583 | 新增工作流類型時 |
| js/chatbot-ui.js | 245 | 新增 UI 功能時 |

### 2.1 pdf-generator.js 拆分計劃（觸發時執行）

```
js/pdf-generator/
├── index.js                # 主入口（~50 行）
├── dependencies.js         # 依賴載入（~50 行）
├── cover-page.js           # 封面頁生成（~100 行）
├── sections.js             # 區塊渲染（~150 行）
├── company-intro.js        # 公司介紹（~100 行）
├── services-section.js     # 服務區塊（~80 行）
├── opportunities-section.js# 機會區塊（~80 行）
├── departments-section.js  # 部門區塊（~80 行）
└── utils.js                # 工具函數（~50 行）
```

### 2.2 website-analyzer.js 拆分計劃（觸發時執行）

```
js/website-analyzer/
├── index.js                # 主入口（~50 行）
├── api.js                  # API 請求（~100 行）
├── progress.js             # 進度動畫（~80 行）
├── validation.js           # 數據驗證（~50 行）
├── render-report.js        # 報告渲染（~150 行）
├── render-sections.js      # 子區塊渲染（~150 行）
└── ui-helpers.js           # UI 輔助函數（~50 行）
```

### 2.3 workflow-engine.js 拆分計劃（觸發時執行）

```
js/workflow-engine/
├── index.js                # 主入口（~50 行）
├── config.js               # 配置（~30 行）
├── icons.js                # SVG 圖標定義（~80 行）
├── engine.js               # 引擎核心（~150 行）
├── nodes.js                # 節點管理（~100 行）
├── connections.js          # 連線管理（~80 行）
├── animations.js           # 動畫控制（~60 行）
└── preview.js              # 預覽生成（~80 行）
```

---

## 🎯 Phase 3：長期優化（評估後執行）

### 3.1 index.html 模組化方案評估

#### 觸發條件
- index.html 超過 1500 行
- 需要頻繁修改 HTML 結構
- 多人協作開發

#### 方案選項
| 方案 | 複雜度 | 維護性 | 推薦場景 |
|------|--------|--------|----------|
| A. JavaScript fetch() 載入 | 低 | 中 | 小範圍區塊共用 |
| B. PHP include | 低 | 中 | 已有 PHP 環境 |
| C. Eleventy (11ty) SSG | 中 | 高 | 長期維護專案 |
| D. Astro SSG | 中 | 高 | 需要元件化 |

#### 評估清單
- [ ] 評估 SEO 影響（JS fetch 方案不利 SEO）
- [ ] 評估部署複雜度增加
- [ ] 評估學習成本
- [ ] 產出 ADR-008 記錄決策

---

## 🛡️ 預防規範（Phase 0 建立）

### 規範 1：CSS 命名規範

```markdown
## CSS 命名規範

### 功能前綴規則
| 前綴 | 用途 | 範例 |
|------|------|------|
| .hero-* | Hero 區塊 | .hero-title, .hero-cta |
| .service-* | 服務區塊 | .service-card, .service-icon |
| .pricing-* | 定價相關 | .pricing-table, .pricing-tier |
| .blog-* | 部落格 | .blog-card, .blog-meta |
| .quiz-* | 測驗相關 | .quiz-option, .quiz-result |
| .workflow-* | 工作流相關 | .workflow-node, .workflow-canvas |

### 禁止事項
- ❌ 禁止使用 !important（除非覆蓋第三方庫）
- ❌ 禁止直接修改超過 200 行的 CSS 檔案
- ❌ 禁止使用過於通用的選擇器（如 .card, .button）

### 新增 CSS 規則
1. 新功能 CSS 必須放在獨立檔案
2. 檔案名稱格式：`{功能名}-{區塊名}.css`
3. 新檔案行數限制：200 行以內
```

### 規範 2：JS 全域變數註冊表

```markdown
## 全域變數註冊表

| 變數名 | 來源檔案 | 用途 | 最後更新 |
|--------|----------|------|----------|
| window.ChatbotCore | js/chatbot-core.js | API 通訊 | 2026-01-07 |
| window.ChatbotUI | js/chatbot-ui.js | UI 控制 | 2026-01-07 |
| window.ChatbotHints | js/chatbot-hints.js | 提示輪播 | 2026-01-07 |
| window.WebsiteAnalyzer | js/website-analyzer.js | 網站分析 | 2026-01-07 |
| window.PDFGenerator | js/pdf-generator.js | PDF 生成 | 2026-01-07 |
| window.WorkflowEngine | js/workflow-engine.js | 工作流模擬 | 2026-01-07 |
| window.MaturityQuiz | js/maturity-quiz.js | 成熟度測驗 | 2026-01-07 |

### 新增模組規則
1. 在此表格登記後才能使用 window.XXX
2. 優先使用命名空間：`window.AIBrain.ModuleName`
3. 衝突檢查：新增前搜尋現有名稱
```

### 規範 3：新功能開發 Checklist

```markdown
## 新功能開發 Checklist

### 開發前
- [ ] 確認不修改現有超標檔案
- [ ] 規劃新檔案結構（遵循 200 行原則）
- [ ] 檢查 CSS 命名前綴無衝突
- [ ] 檢查 JS 全域變數無衝突

### 開發中
- [ ] CSS 使用功能前綴命名
- [ ] JS 使用 IIFE 封裝
- [ ] 加入適當的錯誤處理 try/catch
- [ ] 編寫對應的 Unit Test

### 開發後
- [ ] 更新全域變數註冊表
- [ ] 更新 PROJECT_MAP.md
- [ ] 運行全部測試確認無迴歸
- [ ] 視覺驗證無樣式衝突
```

---

## 📋 驗證閘門定義

### 閘門 1：Console 零錯誤
```
驗證方式：
1. 開啟瀏覽器 DevTools Console
2. 重新整理頁面
3. 確認無任何紅色錯誤訊息

通過標準：
✅ Console 無 Error
✅ Console 無 Warning（排除第三方庫警告）
```

### 閘門 2：功能快速驗證
```
驗證清單：
- [ ] Chatbot：可開啟、發送訊息、收到回應
- [ ] 成熟度測驗：可完成 5 題、顯示結果
- [ ] 網站分析器：可輸入 URL、開始分析
- [ ] 工作流模擬器：動畫正常播放
- [ ] PDF 生成：可成功下載

通過標準：
✅ 核心功能可正常使用
```

### 閘門 3：視覺對比驗證
```
驗證方式：
1. 截取拆分後頁面截圖
2. 與基準線對比（.refactor-baseline/）
3. 人工確認無明顯差異

通過標準：
✅ 佈局無偏移
✅ 顏色無變化
✅ 字體無變化
✅ 間距無變化
```

---

## 📅 時間預估

| Phase | 任務 | 預估時間 | 狀態 |
|-------|------|----------|------|
| Phase 0 | 準備工作 | 1 小時 | ⬜ 待執行 |
| Phase 1.1 | 拆分 p1-marketing.css | 2 小時 | ⬜ 待執行 |
| Phase 1.2 | 拆分 n8n-workflow.css | 1.5 小時 | ⬜ 待執行 |
| Phase 1.3 | 拆分 maturity-quiz.js | 1 小時 | ⬜ 待執行 |
| Phase 1 驗證 | 完整功能測試 | 0.5 小時 | ⬜ 待執行 |
| **合計 Phase 0-1** | | **6 小時** | |

---

## 📝 進度追蹤

### Phase 0 進度
- [ ] 0.1 Git 安全備份
- [ ] 0.2 視覺基準線建立
- [ ] 0.3 測試基準確認
- [ ] 0.4 更新 ARCHITECTURE.md

### Phase 1 進度
- [ ] 1.1 拆分 css/p1-marketing.css
- [ ] 1.2 拆分 css/n8n-workflow.css
- [ ] 1.3 拆分 js/maturity-quiz.js
- [ ] 最終驗證

### Phase 2 進度（觸發時勾選）
- [ ] 2.1 拆分 pdf-generator.js
- [ ] 2.2 拆分 website-analyzer.js
- [ ] 2.3 拆分 workflow-engine.js
- [ ] 2.4 拆分 chatbot-ui.js

### Phase 3 進度（評估後勾選）
- [ ] 3.1 index.html 模組化方案選定
- [ ] 3.2 執行 HTML 模組化

---

## 🔗 相關文檔

- [ARCHITECTURE.md](./ARCHITECTURE.md) - 架構規範
- [TASKS.md](./TASKS.md) - 任務追蹤
- [PROJECT_MAP.md](./PROJECT_MAP.md) - 專案地圖
- [adr/ADR-006-200-line-principle.md](./adr/ADR-006-200-line-principle.md) - 200 行原則 ADR

---

## 📋 ADR-007：程式碼重構決策

### Context
專案目前僅完成約 1/5 進度，有 8 個檔案超過 200 行原則。經過成本效益分析，決定採取分階段重構策略。

### Decision
1. Phase 0-1 立即執行高優先級拆分（CSS + 測驗模組）
2. Phase 2 採用「觸發式拆分」策略（修改時順便拆分）
3. Phase 3 評估 index.html 模組化方案
4. 建立預防規範避免未來技術債累積

### Consequences
**正面**：
- 降低未來維護成本
- 建立可擴展的程式碼結構
- 預防技術債指數增長

**負面**：
- 短期需要投入 6 小時進行重構
- 存在 10-15% 殘留風險（可透過測試降低）

**風險緩解**：
- Git 分支策略保護
- 三層驗證閘門
- 人工最終審核

---

*最後更新：2026-01-07*
