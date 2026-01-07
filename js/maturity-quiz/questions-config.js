/**
 * AI 成熟度測驗 - 問題配置
 * @module maturity-quiz/questions-config
 * @version 2.0.0
 */

const QUIZ_QUESTIONS = [
    {
        id: 1,
        question: '您的團隊目前使用 AI 工具的情況？',
        options: [
            { text: '完全沒用過', score: 1 },
            { text: '用過基礎 AI 工具', score: 2 },
            { text: '有導入 1-2 個 AI 流程', score: 3 },
            { text: '多個流程已 AI 自動化', score: 4 }
        ]
    },
    {
        id: 2,
        question: '每週花多少時間在「重複性工作」上？',
        options: [
            { text: '超過 20 小時', score: 4 },
            { text: '10-20 小時', score: 3 },
            { text: '5-10 小時', score: 2 },
            { text: '少於 5 小時', score: 1 }
        ]
    },
    {
        id: 3,
        question: '是否有專人負責 AI 或數位轉型？',
        options: [
            { text: '沒有，也不知道從何開始', score: 1 },
            { text: '沒有，但老闆有興趣', score: 2 },
            { text: '有，但還在摸索', score: 3 },
            { text: '有專人或專案團隊', score: 4 }
        ]
    },
    {
        id: 4,
        question: '貴公司對 AI 的預算規劃？',
        options: [
            { text: '沒有預算', score: 1 },
            { text: '每月 NT$10,000 以下', score: 2 },
            { text: '每月 NT$10,000-50,000', score: 3 },
            { text: '每月 NT$50,000 以上', score: 4 }
        ]
    },
    {
        id: 5,
        question: '最想解決的問題是？',
        options: [
            { text: '客服/電話接聽', score: 0, tag: 'voice' },
            { text: '內容產出/SEO', score: 0, tag: 'content' },
            { text: '社群經營', score: 0, tag: 'brand' },
            { text: '整體數位轉型', score: 0, tag: 'consultant' }
        ]
    }
];

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QUIZ_QUESTIONS };
}
