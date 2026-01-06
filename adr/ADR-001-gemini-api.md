# ADR-001: 選擇 Gemini API 作為聊天客服後端

## Status
**Accepted** - 2026-01-05

## Context
AI 智能腦官方網站需要一個 AI 聊天功能，用於提供 24/7 即時客服支援。我們需要選擇一個可靠、高效且具成本效益的 AI API 作為聊天後端。

### 考量因素
- 回應速度：用戶期望即時回應
- 語言支援：主要服務繁體中文用戶
- 成本：需要控制 API 呼叫成本
- 整合複雜度：需要易於整合的 API

## Decision
選擇 **Google Gemini 2.0 Flash** 作為聊天客服的 AI 後端。

### 選擇理由
1. **速度優勢**：Flash 模型專為低延遲設計，回應速度極快
2. **成本效益**：相比其他大型模型，Flash 版本價格更低
3. **繁體中文支援**：原生支援繁體中文，回應品質優秀
4. **Google 生態整合**：未來可輕鬆整合其他 Google Cloud 服務

## Consequences

### 正面影響
- ✅ **成本低**：Flash 模型的定價約為標準模型的 1/10
- ✅ **速度快**：平均回應時間 < 500ms
- ✅ **支援繁體中文**：無需額外翻譯層，直接生成高品質繁體中文內容
- ✅ **易於維護**：Google 提供完善的 SDK 與文檔

### 潛在風險
- ⚠️ 需要考慮 API Rate Limit 管理
- ⚠️ 需要透過 Cloudflare Worker 代理來保護 API Key
- ⚠️ 需要設計降級機制（當 API 不可用時的備案）

## References
- [Gemini API Documentation](https://ai.google.dev/docs)
- ADR-003: 模組化 CSS 架構（前端整合相關）
