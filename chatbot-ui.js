/**
 * AI 智能大腦公司 - Chatbot UI 模組
 * 負責聊天視窗的 UI 互動與訊息顯示
 * 
 * @module chatbot-ui
 * @version 1.0.0
 * @dependencies chatbot-core.js (ChatbotCore)
 * @exports ChatbotUI (全域)
 */

// ============================================================
// ChatbotUI 類別 - UI 互動管理
// ============================================================
const ChatbotUI = {
    /** @type {HTMLElement|null} 聊天視窗 */
    chatWindow: null,
    /** @type {HTMLElement|null} 聊天按鈕 */
    chatToggle: null,
    /** @type {HTMLElement|null} 訊息容器 */
    chatMessages: null,

    /**
     * 初始化聊天客服 UI
     */
    init() {
        this.chatToggle = document.getElementById('chatToggle');
        this.chatWindow = document.getElementById('chatWindow');
        this.chatMessages = document.getElementById('chatMessages');
        const chatClose = document.getElementById('chatClose');
        const chatForm = document.getElementById('chatForm');
        const chatInput = document.getElementById('chatInput');

        if (!this.chatToggle || !this.chatWindow) {
            console.warn('📍[ChatbotUI] 找不到必要的 DOM 元素');
            return;
        }

        // 開啟/關閉聊天視窗
        this.chatToggle.addEventListener('click', () => {
            this.toggleWindow();
        });

        // 關閉按鈕
        chatClose?.addEventListener('click', () => {
            this.closeWindow();
        });

        // 送出訊息
        chatForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const message = chatInput.value.trim();
            if (!message) return;

            await this.handleSendMessage(message, chatInput);
        });

        console.log('📍[ChatbotUI] 初始化完成');
    },

    /**
     * 切換聊天視窗開關
     */
    toggleWindow() {
        this.chatWindow.classList.toggle('active');
        this.chatToggle.classList.toggle('active');

        // 首次開啟時發送歡迎訊息
        if (this.chatWindow.classList.contains('active') &&
            ChatbotCore.getHistoryLength() === 0) {
            setTimeout(() => {
                this.addMessage(
                    '您好！我是 AI 智能大腦的客服顧問「小腦」。請問有什麼我可以協助您的嗎？',
                    'bot'
                );
            }, 500);
        }
    },

    /**
     * 關閉聊天視窗
     */
    closeWindow() {
        this.chatWindow.classList.remove('active');
        this.chatToggle.classList.remove('active');
    },

    /**
     * 處理發送訊息
     * @param {string} message - 用戶訊息
     * @param {HTMLInputElement} inputElement - 輸入框元素
     */
    async handleSendMessage(message, inputElement) {
        // 顯示用戶訊息
        this.addMessage(message, 'user');
        inputElement.value = '';

        // 顯示載入中
        const loadingId = this.addMessage('思考中...', 'bot', true);

        // 發送到 API
        try {
            const response = await ChatbotCore.sendMessage(message);
            this.removeMessage(loadingId);
            this.addMessage(response, 'bot');
        } catch (error) {
            this.removeMessage(loadingId);

            // 根據錯誤類型顯示不同訊息
            let errorMessage;
            if (error.message.includes('尚未配置')) {
                // 未配置錯誤 - 顯示友善提示
                errorMessage = '🔧 AI 客服功能正在準備中，請稍後再試。\n\n如需即時協助，歡迎直接透過諮詢表單聯繫我們！';
            } else if (error.message.includes('Failed to fetch') || error.name === 'AbortError') {
                // 網路錯誤
                errorMessage = '📡 網路連線似乎有問題，請檢查您的網路後再試一次。';
            } else {
                // 其他錯誤
                errorMessage = '抱歉，系統暫時無法回應。請稍後再試或直接填寫諮詢表單，我們會盡快與您聯繫。';
            }

            this.addMessage(errorMessage, 'bot');
            console.error('📍[ChatbotUI] API 錯誤:', error);
        }
    },

    /**
     * 新增訊息到聊天視窗
     * @param {string} text - 訊息內容
     * @param {string} sender - 發送者 ('user' | 'bot')
     * @param {boolean} isLoading - 是否為載入狀態
     * @returns {string} 訊息 ID
     */
    addMessage(text, sender, isLoading = false) {
        const messageId = 'msg-' + Date.now();

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        messageDiv.id = messageId;

        if (isLoading) {
            messageDiv.classList.add('loading');
            messageDiv.innerHTML = `
                <div class="message-content">
                    <span class="loading-dots">
                        <span></span><span></span><span></span>
                    </span>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">${this.formatMessage(text)}</div>
            `;
        }

        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

        return messageId;
    },

    /**
     * 移除訊息
     * @param {string} messageId - 訊息 ID
     */
    removeMessage(messageId) {
        const message = document.getElementById(messageId);
        if (message) {
            message.remove();
        }
    },

    /**
     * 格式化訊息（處理換行和粗體）
     * @param {string} text - 原始文字
     * @returns {string} 格式化後的 HTML
     */
    formatMessage(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    },

    /**
     * 取得聊天視窗狀態
     * @returns {boolean} 是否開啟
     */
    isWindowOpen() {
        return this.chatWindow?.classList.contains('active') || false;
    }
};

// 暴露到全域
window.ChatbotUI = ChatbotUI;
