# ADR-006: 200 行熔斷原則

| 狀態 | 日期 | 決策者 |
|------|------|--------|
| **已接受** | 2026-01-05 | AI Brain Team |

## Context（背景）

在大型專案中，單一檔案過長會導致：

1. **維護困難**
   - 難以快速定位功能位置
   - 多人協作時容易產生衝突

2. **認知負擔**
   - 開發者需要理解過多上下文
   - 代碼審查效率下降

3. **測試困難**
   - 模組邊界不清晰
   - 難以進行單元測試

4. **AI 開發者 Context 限制**
   - AI 工具的 context window 有限
   - 長檔案可能超出處理能力

## Decision（決策）

實施「200 行熔斷原則」：

### 規則定義

| 行數範圍 | 狀態 | 行動 |
|---------|------|------|
| < 150 行 | 🟢 健康 | 繼續開發 |
| 150-200 行 | 🟡 警告 | 考慮拆分 |
| > 200 行 | 🔴 熔斷 | **強制拆分後才能提交** |

### 適用範圍

- ✅ JavaScript 檔案 (.js)
- ✅ CSS 檔案 (.css)
- ✅ HTML 檔案 (.html)
- ❌ Markdown 文檔（不適用）
- ❌ 配置檔案（不適用）

### 拆分策略

**JavaScript**：按功能模組拆分
```
chatbot.js (213 行)
    ↓ 拆分
├── chatbot-core.js (API)
├── chatbot-ui.js (UI)
└── chatbot-hints.js (提示)
```

**CSS**：按元件或區塊拆分
```
chatbot.css (311 行)
    ↓ 拆分
├── chatbot-toggle.css (按鈕)
├── chatbot-window.css (視窗)
└── chatbot-messages.css (訊息)
```

### 執行機制

1. **提交前檢查**
   ```bash
   # 檢查超標檔案
   find . -name "*.js" -o -name "*.css" | xargs wc -l | awk '$1 > 200'
   ```

2. **CI 整合**（建議未來加入）
   ```yaml
   - name: Check file length
     run: |
       for file in $(find . -name "*.js" -o -name "*.css"); do
         lines=$(wc -l < "$file")
         if [ $lines -gt 200 ]; then
           echo "ERROR: $file has $lines lines (max 200)"
           exit 1
         fi
       done
   ```

## Consequences（後果）

### 正面

- ✅ 代碼更易維護
- ✅ 模組邊界清晰
- ✅ 更容易進行單元測試
- ✅ 減少合併衝突
- ✅ AI 工具處理更高效

### 負面

- ⚠️ HTTP 請求可能增加
- ⚠️ 需要維護更多檔案
- ⚠️ 拆分需要額外工作

### 緩解措施

1. **HTTP 請求增加**
   - 生產環境使用打包工具合併
   - 使用 HTTP/2 多路復用

2. **檔案數量增加**
   - 使用清晰的命名規範
   - 維護良好的目錄結構

## 相關文檔

- [ARCHITECTURE.md](../ARCHITECTURE.md) - 專案憲法
- [TASKS.md](../TASKS.md) - 拆分任務追蹤
