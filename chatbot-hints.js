/**
 * AI 智能大腦公司 - Chatbot 提示輪播模組
 * 負責提示氣泡的輪播動畫與互動
 * 
 * @module chatbot-hints
 * @version 1.0.0
 * @dependencies chatbot-ui.js (ChatbotUI)
 * @exports ChatbotHints (全域)
 */

// ============================================================
// 提示文字配置
// ============================================================
const HINT_MESSAGES = [
    '有問題嗎？問我！',
    '想了解 AI 服務？',
    '24/7 線上諮詢',
    '免費 AI 導入評估',
    '點我開始對話'
];

/** @constant {number} 輪播間隔（毫秒） */
const ROTATION_INTERVAL = 4000;

/** @constant {number} 淡入淡出時間（毫秒） */
const FADE_DURATION = 300;

// ============================================================
// ChatbotHints 類別 - 提示輪播管理
// ============================================================
const ChatbotHints = {
    /** @type {HTMLElement|null} 提示氣泡 */
    chatHint: null,
    /** @type {HTMLElement|null} 提示文字 */
    chatHintText: null,
    /** @type {number} 當前提示索引 */
    currentIndex: 0,
    /** @type {number|null} 輪播定時器 ID */
    rotationTimer: null,
    /** @type {MutationObserver|null} DOM 觀察器 */
    observer: null,

    /**
     * 初始化提示輪播
     */
    init() {
        this.chatHint = document.getElementById('chatHint');
        this.chatHintText = document.getElementById('chatHintText');
        const chatToggle = document.getElementById('chatToggle');
        const chatWindow = document.getElementById('chatWindow');
        const chatNotification = document.querySelector('.chat-notification');

        if (!this.chatHint || !this.chatHintText) {
            console.warn('📍[ChatbotHints] 找不到提示氣泡元素');
            return;
        }

        // 啟動輪播
        this.startRotation();

        // 點擊提示氣泡開啟聊天
        this.chatHint.addEventListener('click', () => {
            chatToggle?.click();
        });

        // 監聽聊天視窗狀態
        if (chatWindow) {
            this.setupVisibilityObserver(chatWindow, chatNotification);
        }

        console.log('📍[ChatbotHints] 初始化完成');
    },

    /**
     * 啟動輪播
     */
    startRotation() {
        this.rotationTimer = setInterval(() => {
            this.rotateToNext();
        }, ROTATION_INTERVAL);
    },

    /**
     * 停止輪播
     */
    stopRotation() {
        if (this.rotationTimer) {
            clearInterval(this.rotationTimer);
            this.rotationTimer = null;
        }
    },

    /**
     * 切換到下一個提示
     */
    rotateToNext() {
        this.currentIndex = (this.currentIndex + 1) % HINT_MESSAGES.length;

        // 淡出
        this.chatHintText.style.opacity = '0';

        // 淡入新文字
        setTimeout(() => {
            this.chatHintText.textContent = HINT_MESSAGES[this.currentIndex];
            this.chatHintText.style.opacity = '1';
        }, FADE_DURATION);
    },

    /**
     * 設定視窗狀態觀察器
     * @param {HTMLElement} chatWindow - 聊天視窗
     * @param {HTMLElement|null} chatNotification - 通知元素
     */
    setupVisibilityObserver(chatWindow, chatNotification) {
        this.observer = new MutationObserver(() => {
            if (chatWindow.classList.contains('active')) {
                // 隱藏提示與通知
                this.hide();
                if (chatNotification) {
                    chatNotification.style.display = 'none';
                }
            } else {
                // 顯示提示
                this.show();
            }
        });

        this.observer.observe(chatWindow, {
            attributes: true,
            attributeFilter: ['class']
        });
    },

    /**
     * 隱藏提示氣泡
     */
    hide() {
        if (this.chatHint) {
            this.chatHint.style.display = 'none';
        }
    },

    /**
     * 顯示提示氣泡
     */
    show() {
        if (this.chatHint) {
            this.chatHint.style.display = 'block';
        }
    },

    /**
     * 取得當前提示訊息
     * @returns {string} 當前提示文字
     */
    getCurrentMessage() {
        return HINT_MESSAGES[this.currentIndex];
    },

    /**
     * 取得所有提示訊息
     * @returns {string[]} 提示訊息陣列
     */
    getAllMessages() {
        return [...HINT_MESSAGES];
    },

    /**
     * 銷毀模組（清理資源）
     */
    destroy() {
        this.stopRotation();
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        console.log('📍[ChatbotHints] 已銷毀');
    }
};

// 暴露到全域
window.ChatbotHints = ChatbotHints;

// ============================================================
// 頁面載入時初始化所有模組
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    // 依序初始化（確保依賴順序）
    if (window.ChatbotUI) {
        ChatbotUI.init();
    }
    ChatbotHints.init();

    console.log('📍[Chatbot] 所有模組初始化完成');
});
