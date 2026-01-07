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
    /** @type {number} 訊息 ID 計數器 - 防止同毫秒 ID 碰撞 */
    _messageIdCounter: 0,

    /**
     * 生成唯一訊息 ID（使用 UUID 或降級方案）
     * @returns {string} 唯一 ID
     */
    _generateUniqueId() {
        this._messageIdCounter++;
        // 優先使用 crypto.randomUUID()，若不支援則使用降級方案
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return 'msg-' + crypto.randomUUID();
        }
        // 降級方案：時間戳 + 計數器 + 隨機數
        const random = Math.random().toString(36).substring(2, 9);
        return `msg-${Date.now()}-${this._messageIdCounter}-${random}`;
    },

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

        // 首次開啟時發送歡迎訊息（使用 sessionStorage 避免每次刷新都重複）
        const hasShownWelcome = sessionStorage.getItem('chatbot_welcome_shown');
        if (this.chatWindow.classList.contains('active') && !hasShownWelcome) {
            sessionStorage.setItem('chatbot_welcome_shown', 'true');
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
        // 使用真正唯一的 ID（防止 ID 碰撞）
        const messageId = this._generateUniqueId();

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        messageDiv.id = messageId;
        // 添加 data 屬性作為備用識別方式
        messageDiv.dataset.msgId = messageId;
        messageDiv.dataset.sender = sender;
        messageDiv.dataset.isLoading = isLoading ? 'true' : 'false';

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

        // 詳細日誌追蹤
        console.log(`📍[ChatbotUI] addMessage: id=${messageId}, sender=${sender}, isLoading=${isLoading}, text=${isLoading ? '(loading)' : text.substring(0, 30)}...`);

        return messageId;
    },

    /**
     * 移除訊息
     * @param {string} messageId - 訊息 ID
     * @returns {boolean} 是否成功移除
     */
    removeMessage(messageId) {
        console.log(`📍[ChatbotUI] removeMessage: 嘗試移除 id=${messageId}`);

        // 方法 1: 使用 getElementById
        let message = document.getElementById(messageId);

        // 方法 2: 如果找不到，使用 data 屬性查找
        if (!message) {
            console.warn(`📍[ChatbotUI] removeMessage: getElementById 找不到，嘗試 data 屬性查找`);
            message = this.chatMessages.querySelector(`[data-msg-id="${messageId}"]`);
        }

        if (message) {
            // 驗證這是正確的訊息（檢查 loading 狀態）
            const isLoading = message.dataset.isLoading === 'true';
            console.log(`📍[ChatbotUI] removeMessage: 找到訊息，isLoading=${isLoading}，正在移除...`);
            message.remove();
            return true;
        } else {
            console.error(`📍[ChatbotUI] removeMessage: 無法找到訊息 id=${messageId}`);
            // 嘗試直接查找 loading 訊息並移除
            const loadingMessages = this.chatMessages.querySelectorAll('.chat-message.loading');
            if (loadingMessages.length > 0) {
                console.log(`📍[ChatbotUI] removeMessage: 找到 ${loadingMessages.length} 個 loading 訊息，移除第一個`);
                loadingMessages[0].remove();
                return true;
            }
            return false;
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
