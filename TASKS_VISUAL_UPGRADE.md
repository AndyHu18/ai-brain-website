# 視覺設計優化任務清單

> **專案**: AI 智能大腦公司官網  
> **建立日期**: 2026-01-07  
> **最後更新**: 2026-01-07 07:30  
> **目標**: 依據 /visionnew 規範優化視覺設計、移除 emoji、確保 APCA 對比度合規  
> **狀態**: 🟡 進行中 (Phase 1-2 部分完成)

---

## 執行進度

| 階段 | 狀態 | 完成項目 |
|------|------|----------|
| Phase 1: 色彩系統修正 | ✅ 完成 | variables.css, components.css, base.css 已更新 |
| Phase 2: Emoji 移除 | ⏭️ 跳過 | 用戶決定暫不處理（僅完成 index.html）|
| Phase 3: 排版佈局審計 | ✅ 完成 | 按鈕觸控目標 min-height 44px 已添加 |
| Phase 4: 卡片陰影優化 | ✅ 完成 | 細邊框替代重陰影，hover 效果優化 |
| Phase 5: 語義化與驗證 | 🟡 進行中 | — |

## 執行摘要

| 階段 | 任務數 | 優先級 | 預估時間 |
|------|--------|--------|----------|
| Phase 1: 色彩系統修正 | 6 項 | P0 緊急 | 30 分鐘 |
| Phase 2: Emoji 移除 | 8 項 | P0 緊急 | 60 分鐘 |
| Phase 3: 排版佈局審計 | 5 項 | P1 重要 | 30 分鐘 |
| Phase 4: 卡片陰影優化 | 4 項 | P1 重要 | 20 分鐘 |
| Phase 5: 語義化與驗證 | 4 項 | P2 優化 | 30 分鐘 |
| **總計** | **27 項** | — | **約 3 小時** |

---

## Phase 1: 色彩系統修正 (P0 緊急)

### 1.1 APCA 對比度審計
- [ ] **1.1.1** 使用 APCA 工具測量 `--color-primary` (#D2691E) + 白色文字的 Lc 值
- [ ] **1.1.2** 使用 APCA 工具測量 `--text-muted` (#5D4037) + `--bg-light` (#FCFCFC) 的 Lc 值
- [ ] **1.1.3** 使用 APCA 工具測量 Badge 文字對比度（橘色文字 + 半透明背景）

### 1.2 色彩變數調整
- [ ] **1.2.1** 在 `css/variables.css` 新增 `--text-on-primary` 變數（橘色背景專用文字色）
- [ ] **1.2.2** 調整 `--color-primary` 為更深的橘色（如 #B85A15），或保持原色但強制加粗文字
- [ ] **1.2.3** 新增 `--color-primary-accessible` 作為高對比版本備選

### 1.3 CTA 按鈕修正
- [ ] **1.3.1** 修改 `css/components.css` 中 `.btn-primary` 的 `font-weight` 至 600 或更高
- [ ] **1.3.2** 確認按鈕文字達到 APCA Lc 75+ 標準
- [ ] **1.3.3** 更新 `.btn-primary:hover` 狀態的對比度

**驗收標準**:
```
□ CTA 按鈕文字 Lc ≥ 75
□ Body Text Lc ≥ 75
□ Large Headlines Lc ≥ 60
□ Muted Text Lc ≥ 75
```

---

## Phase 2: Emoji 移除 (P0 緊急)

### 2.1 主頁面 `index.html`

#### 2.1.1 Hero Section
- [ ] 移除 `hero-badge` 中的 🎁 → 改為純文字「首次諮詢免費」
- [ ] 移除 `hero-trust-row` 中的 ✓ → 改為 CSS `::before` 勾選符號

#### 2.1.2 AI 分析區塊
- [ ] 移除 `analyzer-badge-free` 中的 🎁
- [ ] 移除信任標籤中的 ⚡ 🔒 📊 → 改為 SVG icon 或純文字

#### 2.1.3 六大服務區塊 (×6)
- [ ] 移除 `service-target-icon` 中的 👤 🏥 👔 🛒 🏢 🏭
- [ ] 移除 `service-tech-badge` 中的 ⚙️
- [ ] 移除 `service-value-block` 中的 💰 💵
- [ ] 移除 `hint` 徽章中的所有 emoji

#### 2.1.4 信任區塊
- [ ] 移除 `trust-icon` 中的 🛡️ 🎯 💬 🔒
- [ ] 移除 `promise-badge` 中的 ✨
- [ ] 移除 `promise-list` 中的 ✅

#### 2.1.5 其他元素
- [ ] 移除 `sound-toggle` 中的 🔇 🔊 → 改為 "SOUND OFF" / "SOUND ON" 文字或 SVG
- [ ] 移除視頻控制按鈕中的 🔇 🔊

### 2.2 服務頁面 (×6)

#### 2.2.1 service-content-editor.html
- [ ] 移除 Hero 標題中的 📝
- [ ] 移除 `hero-trial-badge` 中的 🎁
- [ ] 移除 `hero-benefit` 中的 💰
- [ ] 移除 `hero-price` 中的 💵
- [ ] 移除 workflow header 中的 📝 🎬
- [ ] 移除 intro section 中的 💡 💰 ⏰ 📈
- [ ] 移除 flow explanation 中的 📍
- [ ] 移除 log panel 中的 📋
- [ ] 移除 footer nav icons 中的 📝 📞 🎭 🤖 📋 🧠
- [ ] 移除 `SERVICE_CONFIG.nodes[].title` 中的 🔍 📊 ✍️ 📤 📱 emoji
- [ ] 移除 `SERVICE_CONFIG.nodes[].bubbleMessages` 中的所有 emoji
- [ ] 移除聲音控制的 🔇 🔊

#### 2.2.2 service-voice-receptionist.html
- [ ] 移除 Hero 標題中的 📞
- [ ] 移除 `hero-trial-badge` 中的 🎁
- [ ] 移除 `hero-benefit` / `hero-price` 中的 💰 💵
- [ ] 移除 workflow 相關 emoji
- [ ] 移除 `SERVICE_CONFIG` 中的所有 emoji
- [ ] 移除 footer nav icons

#### 2.2.3 service-brand-clone.html
- [ ] 移除 Hero 標題中的 🎭
- [ ] 移除 `hero-trial-badge` 中的 🎁
- [ ] 移除 `hero-benefit` / `hero-price` 中的 💰 💵
- [ ] 移除 benefit card icons 中的 👤
- [ ] 移除 workflow 相關 emoji
- [ ] 移除 `SERVICE_CONFIG` 中的所有 emoji
- [ ] 移除 footer nav icons

#### 2.2.4 service-chatbot.html
- [ ] 移除 Hero 標題中的 🤖
- [ ] 移除 `hero-trial-badge` 中的 🎁
- [ ] 移除 `hero-benefit` / `hero-price` 中的 💰 💵
- [ ] 移除 benefit card icons 中的 💰
- [ ] 移除 workflow 相關 emoji
- [ ] 移除 `SERVICE_CONFIG` 中的所有 emoji
- [ ] 移除 footer nav icons

#### 2.2.5 service-meeting-notes.html
- [ ] 移除 Hero 標題中的 📋
- [ ] 移除 `hero-trial-badge` 中的 🎁
- [ ] 移除 `hero-benefit` / `hero-price` 中的 💰 💵
- [ ] 移除 workflow 相關 emoji
- [ ] 移除 `SERVICE_CONFIG` 中的所有 emoji
- [ ] 移除 footer nav icons

#### 2.2.6 service-consultant.html
- [ ] 移除 Hero 標題中的 🧠
- [ ] 移除 `hero-trial-badge` 中的 🎁
- [ ] 移除 `hero-benefit` / `hero-price` 中的 💰 💵
- [ ] 移除 workflow 相關 emoji
- [ ] 移除 `SERVICE_CONFIG` 中的所有 emoji
- [ ] 移除 footer nav icons

### 2.3 替代方案實作
- [ ] **2.3.1** 建立統一的勾選符號 CSS 樣式（替代 ✅ ✓）
- [ ] **2.3.2** 貨幣符號統一使用 `NT$` 前綴（替代 💰 💵）
- [ ] **2.3.3** 服務頁面標題移除 emoji 後確保視覺層級清晰

**驗收標準**:
```
□ grep -r "[\x{1F300}-\x{1F9FF}]" 返回 0 結果
□ 全站無任何 emoji 字符
□ 視覺層級保持清晰
```

---

## Phase 3: 排版佈局審計 (P1 重要)

### 3.1 字體層級驗證
- [ ] **3.1.1** 確認字體尺寸是否符合 1.250x Major Third 音階
- [ ] **3.1.2** 驗證 `--font-size-*` 變數的比例關係

### 3.2 響應式斷點
- [ ] **3.2.1** 新增 375px (Mobile) 專用斷點樣式
- [ ] **3.2.2** 新增 1440px (Desktop) 專用斷點樣式
- [ ] **3.2.3** 使用 browser_subagent 在兩個尺寸截圖驗證

### 3.3 防斷行與溢出
- [ ] **3.3.1** 在 `css/base.css` 新增全局 `word-break: break-word`
- [ ] **3.3.2** 新增 `overflow-wrap: anywhere` 到文字容器
- [ ] **3.3.3** 長內容區域添加 `text-overflow: ellipsis`

### 3.4 觸控目標
- [ ] **3.4.1** 驗證所有按鈕最小尺寸 ≥ 44×44px
- [ ] **3.4.2** 驗證導航連結觸控區域
- [ ] **3.4.3** 修正不符合標準的互動元素

**驗收標準**:
```
□ 375px 佈局正常顯示
□ 1440px 佈局正常顯示
□ 長字串不溢出容器
□ 所有按鈕 ≥ 44×44px
```

---

## Phase 4: 卡片陰影優化 (P1 重要)

### 4.1 陰影系統重構
- [ ] **4.1.1** 新增細邊框變數 `--border-card: 1px solid rgba(62,39,35,0.08)`
- [ ] **4.1.2** 調整 `--shadow-card` 為更輕微的陰影

### 4.2 卡片樣式更新
- [ ] **4.2.1** 更新 `.service-card` 使用細邊框替代重陰影
- [ ] **4.2.2** 更新 `.trust-card` 使用細邊框
- [ ] **4.2.3** 更新 `.solution-item` 卡片樣式
- [ ] **4.2.4** 更新 `.benefit-card` 卡片樣式

### 4.3 Hover 狀態
- [ ] **4.3.1** 實作 hover 時的細微邊框強化效果
- [ ] **4.3.2** 移除過重的 hover 陰影

**驗收標準**:
```
□ 卡片邊框清晰可見但不搶眼
□ Hover 狀態有明顯但優雅的反饋
□ 整體視覺更輕盈、高級
```

---

## Phase 5: 語義化與最終驗證 (P2 優化)

### 5.1 語義化 HTML 審計
- [ ] **5.1.1** 檢查並確認使用 `<main>`, `<article>`, `<section>`, `<nav>` 等語義標籤
- [ ] **5.1.2** 為所有 icon 添加 `aria-label` 或 `<title>`

### 5.2 最終瀏覽器驗證
- [ ] **5.2.1** 使用 browser_subagent 在 375px (Mobile) 截圖
- [ ] **5.2.2** 使用 browser_subagent 在 1440px (Desktop) 截圖
- [ ] **5.2.3** 執行「壓力測試」：注入 50+ 字符長字串檢查佈局

### 5.3 APCA 最終驗證
- [ ] **5.3.1** 逐一驗證所有文字/背景對比度
- [ ] **5.3.2** 記錄驗證結果至本文件

### 5.4 文檔更新
- [ ] **5.4.1** 更新 `ARCHITECTURE.md` 記錄視覺設計變更
- [ ] **5.4.2** 更新 `HANDOVER_NOTES.md` 記錄本次優化

**驗收標準**:
```
□ 所有 APCA 對比度達標
□ 雙尺寸截圖驗證通過
□ 壓力測試無佈局崩潰
□ 文檔已同步更新
```

---

## Emoji 完整清單（待移除）

### 主頁面 (index.html)
```
🎁 💰 💵 👤 🏥 👔 🛒 🏢 🏭 ⚙️ ✓ ✅ ⚡ 🔒 📊 ✨ 🛡️ 🎯 💬 🔇 🔊 ▶
```

### 服務頁面通用
```
📝 📞 🎭 🤖 📋 🧠 🎁 💰 💵 💡 ⏰ 📈 📍 🔍 📊 ✍️ 📤 📱 
📡 🔥 ✅ 🧠 📌 🔎 🔧 🔐 📋 🖼️ 📲 👀 🎉 📞 🔌 🎤 🗣️ 
💬 📆 📧 📝 📁 🔊 👤 📅 💭 🔄 🎨 📱 💚 📖 📑 🎙️ 📄 
🏥 📊 💰 ⚙️ 🔧 ⚡
```

### 工作流程節點 (SERVICE_CONFIG)
```
🔍 📊 ✍️ 📤 📱 📞 🎤 🧠 📆 💬 📚 ✅ 📡 🔥 📈 🔎 🔧 
🔐 📋 🖼️ 📲 👀 🎉 🔌 🗣️ 📧 📁 🔊 💡 📑 🎭 📖 📅 💭 
🔄 🎨 💚 📄 🔧 📌 🎙️ 👤 💰 ⚙️ ⚡
```

---

## 進度追蹤

| 日期 | 完成項目 | 負責人 | 備註 |
|------|----------|--------|------|
| 2026-01-07 | 任務清單建立 | AI | 初始化 |
| — | — | — | — |

---

## 相關檔案

| 檔案路徑 | 修改類型 |
|----------|----------|
| `css/variables.css` | 色彩變數調整 |
| `css/components.css` | 按鈕樣式修正 |
| `css/base.css` | 防斷行屬性 |
| `css/sections-services.css` | 卡片邊框優化 |
| `css/trust-section.css` | 信任卡片優化 |
| `index.html` | Emoji 移除 |
| `pages/service-content-editor.html` | Emoji 移除 |
| `pages/service-voice-receptionist.html` | Emoji 移除 |
| `pages/service-brand-clone.html` | Emoji 移除 |
| `pages/service-chatbot.html` | Emoji 移除 |
| `pages/service-meeting-notes.html` | Emoji 移除 |
| `pages/service-consultant.html` | Emoji 移除 |

---

*本任務清單依據 /visionnew 規範制定，所有修改需符合 APCA 對比標準。*
