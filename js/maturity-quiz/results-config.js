/**
 * AI 成熟度測驗 - 結果配置
 * @module maturity-quiz/results-config
 * @version 2.0.0
 */

const QUIZ_RESULTS = {
    beginner: {
        title: '探索新手',
        icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="9" r="1.5" fill="currentColor"/><circle cx="15" cy="9" r="1.5" fill="currentColor"/></svg>',
        headline: '您的 AI 旅程即將開始',
        painPoint: '我們理解您可能正面臨：團隊對 AI 既期待又擔憂、不知道從哪裡開始、害怕投資後看不到回報。',
        insight: '好消息是，超過 78% 的企業都是從您現在的位置起步的。最聰明的做法是：先找一個低風險、高回報的切入點。',
        recommendation: '客服機器人',
        link: 'pages/service-chatbot.html',
        reason: '它能在 7 天內上線、不需要改變現有流程、立即減少 40% 重複問答工作',
        range: [4, 8]
    },
    explorer: {
        title: '積極探索者',
        icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>',
        headline: '您已經邁出關鍵第一步',
        painPoint: '您可能已經感受到：AI 工具用了但效果有限、團隊各自為政缺乏整合、想擴大應用但不知如何規模化。',
        insight: '根據您的回答，您每週有 10+ 小時花在重複性工作。若能自動化其中 60%，一年可省下 300+ 小時，相當於多出 1.5 個月的產能。',
        recommendation: '自動流量小編',
        link: 'pages/service-content-editor.html',
        reason: '它能自動生產品牌內容、一鍵發布多平台、讓內容產出從 3 天縮短到 30 分鐘',
        range: [9, 12]
    },
    adopter: {
        title: '數位先驅',
        icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
        headline: '您已準備好全面升級',
        painPoint: '到了這個階段，您面對的挑戰是：如何讓各個 AI 工具協同運作、如何評估 ROI、如何建立可持續的 AI 文化。',
        insight: '您的成熟度已超越 85% 的台灣中小企業。此時最關鍵的不是「要不要做」，而是「做對的順序」。一個錯誤的優先級可能浪費 3-6 個月。',
        recommendation: 'AI 顧問諮詢',
        link: 'pages/service-consultant.html',
        reason: '我們會為您量身打造 AI 導入路線圖，確保每一分投資都花在刀口上',
        range: [13, 16]
    }
};

// 標籤對應的服務推薦
const TAG_RECOMMENDATIONS = {
    voice: {
        link: 'pages/service-voice-receptionist.html',
        name: '智慧接線生',
        reason: '24 小時自動接聽、智慧轉接、不漏接任何商機'
    },
    content: {
        link: 'pages/service-content-editor.html',
        name: '自動流量小編',
        reason: '一鍵生成品牌文案、自動發布多平台、節省 80% 內容產出時間'
    },
    brand: {
        link: 'pages/service-brand-clone.html',
        name: '品牌分身術',
        reason: '複製您的專業知識、讓 AI 以您的風格對話、擴大影響力'
    },
    consultant: {
        link: 'pages/service-consultant.html',
        name: 'AI 顧問',
        reason: '量身打造 AI 導入路線圖、評估優先順序、確保投資回報'
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QUIZ_RESULTS, TAG_RECOMMENDATIONS };
}
