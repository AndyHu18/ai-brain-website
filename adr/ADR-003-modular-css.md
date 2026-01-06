# ADR-003: 模組化 CSS 架構決策

## Status
**Accepted** - 2026-01-05

## Context
AI 智能腦官方網站的 CSS 隨著功能增加而逐漸膨脹，單一 CSS 檔案已超過 500 行，造成以下問題：
- 樣式衝突風險增加
- 團隊協作時容易產生合併衝突
- 難以定位特定元件的樣式
- 違反 Antigravity Workflow 的「200 行原則」

### 考量因素
- 可維護性：團隊成員需快速定位樣式
- 可擴展性：未來新增功能時需易於擴展
- 效能：避免過度拆分導致 HTTP 請求增加
- 一致性：確保設計系統的統一性

## Decision
採用**按功能模組拆分 CSS 檔案**的架構策略。

### 檔案結構
```
css/
├── base/
│   ├── reset.css          # CSS Reset
│   ├── typography.css     # 排版系統
│   └── variables.css      # CSS 變數（色彩、間距）
├── components/
│   ├── navbar.css         # 導航列
│   ├── hero.css           # 首頁橫幅
│   ├── chatbot.css        # 聊天機器人
│   ├── features.css       # 功能區塊
│   └── footer.css         # 頁尾
├── layout/
│   ├── grid.css           # 網格系統
│   └── containers.css     # 容器
├── utilities/
│   └── helpers.css        # 工具類別
└── main.css               # 主入口（僅 @import）
```

### 命名規範
- 檔案名使用 **kebab-case**
- 類別名使用 **BEM 命名法**（Block__Element--Modifier）
- CSS 變數以 `--` 開頭，如 `--color-primary`

## Consequences

### 正面影響
- ✅ **便於維護**：每個檔案職責單一，易於定位與修改
- ✅ **避免樣式衝突**：模組化減少全域污染風險
- ✅ **團隊協作友善**：不同人可同時修改不同模組
- ✅ **符合 200 行原則**：每個模組控制在 200 行以內
- ✅ **易於測試**：可針對單一模組進行視覺回歸測試

### 潛在風險
- ⚠️ 需要建立清晰的模組劃分標準
- ⚠️ 開發環境需設定適當的 CSS 合併/壓縮流程
- ⚠️ 新成員需要時間熟悉檔案結構

### 緩解措施
- 在 `main.css` 中使用 `@import` 統一管理載入順序
- 生產環境使用建構工具合併壓縮 CSS
- 撰寫清晰的 README 說明檔案結構

## References
- Antigravity Workflow「200 行原則」
- BEM 命名規範文檔
- ADR-002: 暖橘配色決策（variables.css 實作）
