# 📋 TASKS.md - AI 智能大腦官網開發任務追蹤

> **建立日期**: 2026-01-05  
> **最後更新**: 2026-01-07 17:21  
> **審計依據**: /bigevent + /AI-MASTER

---

## 📊 總體進度概覽

| 階段 | 狀態 | 完成日期 |
|------|------|----------|
| Phase 1: 代碼合規修復 | ✅ 完成 | 2026-01-05 |
| Phase 2: 200 行原則合規 | ✅ 完成 | 2026-01-05 |
| Phase 3: 文檔補全 | ✅ 完成 | 2026-01-05 |
| Phase 4: 強化測試 | ✅ 完成 | 2026-01-05 |
| Phase 5: 服務頁面開發 | ✅ 完成 | 2026-01-06 |
| Phase 6: Veo 3.1 影片生成 | ✅ 完成 | 2026-01-06 |
| Phase 7: WCAG 可及性優化 | 🔲 待處理 | - |
| Phase 8: BIGEVENT 審計改進 | ✅ 完成 | 2026-01-06 |
| Phase 9: 程式碼重構 | 🔶 規劃中 | - |
| Phase 10: 計劃文件清理 | ✅ 完成 | 2026-01-07 |

> 📌 **Phase 9 詳細計劃**：見 [TASKS_REFACTOR.md](./TASKS_REFACTOR.md)
> 📁 **已歸檔計劃**：見 `_archive/completed_plans/`

---

## ✅ 已完成任務

### Phase 1-4: 代碼合規與基礎建設 (2026-01-05)

<details>
<summary>點擊展開詳細內容</summary>

#### Task 1.1: 移除 API Key 暴露 ✅
- [x] 修改 `chatbot-core.js` 使用 Cloudflare Worker 代理 URL
- [x] 刪除 `chatbot.js` 中的 `GEMINI_API_KEY` 常數
- [x] 將原始 `chatbot.js` 移至 `_archive/chatbot.js.deprecated`
- [x] 更新 `index.html` 確認只載入拆分後的模組

#### Task 1.2: 清理重複的 chatbot.js ✅
- [x] 確認 `index.html` 載入順序正確
- [x] 建立 `_archive` 資料夾
- [x] 移動 `chatbot.js` 到 `_archive/`

#### Task 2.1-2.5: CSS/JS 拆分 ✅
- [x] 拆分 chatbot.css (311 行 → 3 檔案)
- [x] 拆分 service-fullscreen.css (296 行 → 2 檔案)
- [x] 拆分 sections.css (235 行 → 2 檔案)
- [x] 拆分 digital-workforce.css (223 行 → 2 檔案)
- [x] 拆分 script.js (206 行 → 2 檔案)

#### Task 3.1-3.2: 文檔補全 ✅
- [x] 建立 GEMINI.md
- [x] 補充 ADR 文檔 (ADR-004, ADR-005, ADR-006)

#### Task 4.1: 測試配置 ✅
- [x] 配置測試覆蓋率門檻 (≥60%)
- [x] 40 個測試全部通過

</details>

---

### Phase 5: 服務詳情頁面開發 (2026-01-06) ✅

#### Task 5.1: 建立 6 個服務詳情頁面 ✅

| 頁面 | 路徑 | 狀態 |
|------|------|------|
| 自動流量小編 | `pages/service-content-editor.html` | ✅ |
| 智慧接線生 | `pages/service-voice-receptionist.html` | ✅ |
| 品牌分身 | `pages/service-brand-clone.html` | ✅ |
| AI 顧問 | `pages/service-consultant.html` | ✅ |
| 智慧財務長 (CFO) | `pages/service-chatbot.html` | ✅ |
| 情報腦 | `pages/service-meeting-notes.html` | ✅ |

**頁面功能**:
- [x] Hero 區塊 + 背景影片
- [x] 服務詳細說明（適用對象、解決問題、體驗描述）
- [x] 技術實力展示
- [x] 功能特色卡片
- [x] 聲音開關控制
- [x] 統一導航列
- [x] RWD 響應式設計

#### Task 5.2: 首頁連結整合 ✅

- [x] 為 6 個服務區塊新增「了解更多」按鈕
- [x] 按鈕連結到對應的服務詳情頁面
- [x] 瀏覽器測試驗證所有連結正常運作

---

### Phase 6: Veo 3.1 影片生成 (2026-01-06) ✅

#### Task 6.1: 生成服務介紹影片 ✅

**API 配置**:
- 模型: `veo-3.1-fast-generate-preview`
- 時長: 8 秒
- 解析度: 16:9
- 原生音訊: 啟用

**生成的影片**:

| 影片 | 路徑 | 大小 |
|------|------|------|
| 自動流量小編 | `assets/videos/services/service_content_editor.mp4` | 2.57 MB |
| 智慧接線生 | `assets/videos/services/service_voice_receptionist.mp4` | 1.81 MB |
| 品牌分身 | `assets/videos/services/service_brand_clone.mp4` | 2.46 MB |
| AI 顧問 | `assets/videos/services/service_consultant.mp4` | 2.49 MB |
| 智慧財務長 | `assets/videos/services/service_chatbot.mp4` | 2.53 MB |
| 情報腦 | `assets/videos/services/service_meeting_notes.mp4` | 2.62 MB |

#### Task 6.2: 影片整合至服務頁面 ✅

- [x] 所有服務頁面使用生成的影片作為背景
- [x] 影片自動播放、靜音、循環
- [x] 聲音開關功能正常

---

### Phase 8: BIGEVENT 審計改進 (2026-01-06) ✅

#### Task 8.1: 聊天客服功能修復 ✅

**改進內容**:
- [x] 新增開發模式支援（localStorage API Key）
- [x] 新增生產模式支援（Cloudflare Worker 代理）
- [x] 實作 `_fetchWithRetry` 重試機制（指數退避）
- [x] 實作 `_fetchWithTimeout` 超時保護
- [x] 改善錯誤訊息顯示（區分未配置/網路錯誤/一般錯誤）
- [x] 新增 `getMode()` 方法識別當前模式
- [x] 失敗時自動移除用戶訊息，避免歷史污染

#### Task 8.2: 測試案例補充 ✅

- [x] 新增開發模式功能測試（4 個測試案例）
- [x] 新增重試機制測試（3 個測試案例）
- [x] 新增錯誤處理測試（4 個測試案例）
- [x] 新增模式識別測試（1 個測試案例）
- [x] 全部 52 個測試通過

#### Task 8.3: 文檔更新 ✅

- [x] GEMINI.md 更新版本至 v2.1.0
- [x] 標記「超時機制」為已實作
- [x] 標記「重試策略」為已實作
- [x] 新增「開發模式」設定說明

---

## 🔲 待處理任務

### Phase 7: WCAG 可及性優化 (優先順序: 低)

#### Task 7.1: 對比度檢查 🔲

**待處理項目**:
- [ ] 檢查所有文字與背景的對比度是否達到 WCAG AA 標準 (4.5:1)
- [ ] 調整低對比度的顏色組合
- [ ] 驗證按鈕、連結的可及性

#### Task 7.2: 輔助功能增強 🔲

- [ ] 確保所有圖片有 `alt` 屬性
- [ ] 確保所有互動元素有 `aria-label`
- [ ] 鍵盤導航支援
- [ ] 螢幕閱讀器測試

---

## 📁 專案結構

```
ai-brain-website/
├── index.html                        # 主頁面
├── pages/                            # 服務詳情頁面
│   ├── service-content-editor.html   # 自動流量小編
│   ├── service-voice-receptionist.html # 智慧接線生
│   ├── service-brand-clone.html      # 品牌分身
│   ├── service-consultant.html       # AI 顧問
│   ├── service-chatbot.html          # 智慧財務長
│   └── service-meeting-notes.html    # 情報腦
├── assets/
│   └── videos/
│       └── services/                 # Veo 3.1 生成的服務影片
│           ├── service_content_editor.mp4
│           ├── service_voice_receptionist.mp4
│           ├── service_brand_clone.mp4
│           ├── service_consultant.mp4
│           ├── service_chatbot.mp4
│           └── service_meeting_notes.mp4
├── css/                              # 樣式檔案（已拆分）
├── scripts/                          # Python 腳本
│   └── generate_service_videos.py    # Veo 3.1 影片生成腳本
├── cloudflare-worker/                # API 代理
├── tests/                            # 測試套件
├── adr/                              # 架構決策紀錄
├── _archive/                         # 廢棄檔案存檔
├── ARCHITECTURE.md                   # 專案憲法
├── PROJECT_MAP.md                    # 專案地圖
├── HANDOVER_NOTES.md                 # 交接紀錄
└── TASKS.md                          # 任務追蹤（本文件）
```

---

## 🔧 快速指令

### 啟動本地伺服器
```powershell
cd C:\Users\user\.gemini\antigravity\scratch\ai-brain-website
python -m http.server 8080
# 訪問 http://localhost:8080
```

### 生成服務影片 (需要 API Key)
```powershell
cd scripts
python generate_service_videos.py
```

### 執行測試
```powershell
cd tests
npm install
npm test
```

---

## 📝 重要備註

### Veo 3.1 API 注意事項

1. **SDK 參數名稱**: 使用 `GenerateVideosConfig` (複數) 而非單數
2. **輪詢機制**: 使用 `client.operations.get(operation)` 傳入 operation 物件
3. **影片下載**: 透過 `video.video.uri` 取得下載連結
4. **配額限制**: 備用 API Key 已使用，注意配額狀態

### 設計規範

- 深色主題背景 (`#0a0a0a` - `#1a0a2e`)
- 主色調: 紫色漸層
- 字體: Noto Sans TC
- 按鈕樣式統一使用 `.btn-primary` / `.btn-secondary`

---

*最後更新: 2026-01-06 01:38*
