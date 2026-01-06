# AI 智能大腦公司官網

展示 AI 智能大腦公司的企業形象與四大核心服務的靜態官網。

## 🚀 快速開始

```bash
python -m http.server 8080
# 訪問 http://localhost:8080
```

## 📋 功能列表

- ✅ Hero Section 影片背景
- ✅ 響應式導覽列（滾動變色）
- ✅ 四大服務卡片展示
- ✅ 成功案例解決方案
- ✅ 聯繫表單 UI
- ✅ AI 聊天客服（Gemini API）
- ✅ 暖橘 Hermès 配色主題

## ⚠️ 已知問題

1. **chatbot.js 超過 200 行** - 需拆分
2. **API Key 暴露於前端** - 需建立後端代理
3. **無 API 超時/重試機制** - 需加入韌性處理

## 📁 目錄說明

| 檔案/目錄 | 說明 |
|----------|------|
| `index.html` | 主頁面 |
| `script.js` | 導覽、滾動、音量控制 |
| `chatbot.js` | AI 聊天客服邏輯 |
| `css/` | 模組化 CSS（8 個檔案） |
| `assets/` | 影片與圖片素材 |

## 🔗 相關連結

- Gemini API: https://ai.google.dev/
- 專案審計報告: 見 `HANDOVER_NOTES.md`
