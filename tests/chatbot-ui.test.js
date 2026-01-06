/**
 * AI 智能大腦公司 - Chatbot UI 單元測試
 * 
 * @module tests/chatbot-ui.test
 * @description 測試 ChatbotUI 介面互動功能
 */

// ============================================================
// DOM 模擬設定
// ============================================================
const createMockDOM = () => {
    document.body.innerHTML = `
        <button id="chatToggle"></button>
        <div id="chatWindow"></div>
        <button id="chatClose"></button>
        <form id="chatForm">
            <input id="chatInput" type="text" />
        </form>
        <div id="chatMessages"></div>
    `;
};

// Mock ChatbotCore
global.ChatbotCore = {
    conversationHistory: [],
    getHistoryLength: () => global.ChatbotCore.conversationHistory.length,
    sendMessage: jest.fn().mockResolvedValue('機器人回應')
};

// ============================================================
// 測試 ChatbotUI 模組
// ============================================================
describe('ChatbotUI', () => {
    let ChatbotUI;

    beforeEach(() => {
        createMockDOM();
        global.ChatbotCore.conversationHistory = [];
        global.ChatbotCore.sendMessage.mockClear();

        // 定義 ChatbotUI
        ChatbotUI = {
            chatWindow: null,
            chatToggle: null,
            chatMessages: null,

            init() {
                this.chatToggle = document.getElementById('chatToggle');
                this.chatWindow = document.getElementById('chatWindow');
                this.chatMessages = document.getElementById('chatMessages');
            },

            toggleWindow() {
                this.chatWindow.classList.toggle('active');
                this.chatToggle.classList.toggle('active');
            },

            closeWindow() {
                this.chatWindow.classList.remove('active');
                this.chatToggle.classList.remove('active');
            },

            addMessage(text, sender, isLoading = false) {
                const messageId = 'msg-' + Date.now();
                const messageDiv = document.createElement('div');
                messageDiv.className = `chat-message ${sender}`;
                messageDiv.id = messageId;

                if (isLoading) {
                    messageDiv.classList.add('loading');
                    messageDiv.innerHTML = '<div class="message-content">...</div>';
                } else {
                    messageDiv.innerHTML = `<div class="message-content">${this.formatMessage(text)}</div>`;
                }

                this.chatMessages.appendChild(messageDiv);
                return messageId;
            },

            removeMessage(messageId) {
                const message = document.getElementById(messageId);
                if (message) message.remove();
            },

            formatMessage(text) {
                return text
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br>');
            },

            isWindowOpen() {
                return this.chatWindow?.classList.contains('active') || false;
            }
        };

        ChatbotUI.init();
    });

    // ----------------------------------------------------------
    // 初始化測試
    // ----------------------------------------------------------
    describe('初始化', () => {
        test('init 應正確綁定 DOM 元素', () => {
            expect(ChatbotUI.chatToggle).not.toBeNull();
            expect(ChatbotUI.chatWindow).not.toBeNull();
            expect(ChatbotUI.chatMessages).not.toBeNull();
        });

        test('初始狀態視窗應為關閉', () => {
            expect(ChatbotUI.isWindowOpen()).toBe(false);
        });
    });

    // ----------------------------------------------------------
    // 視窗控制測試
    // ----------------------------------------------------------
    describe('視窗控制', () => {
        test('toggleWindow 應切換視窗狀態', () => {
            ChatbotUI.toggleWindow();
            expect(ChatbotUI.isWindowOpen()).toBe(true);

            ChatbotUI.toggleWindow();
            expect(ChatbotUI.isWindowOpen()).toBe(false);
        });

        test('closeWindow 應關閉視窗', () => {
            ChatbotUI.toggleWindow(); // 開啟
            ChatbotUI.closeWindow();
            expect(ChatbotUI.isWindowOpen()).toBe(false);
        });

        test('toggleWindow 應同時切換按鈕狀態', () => {
            ChatbotUI.toggleWindow();
            expect(ChatbotUI.chatToggle.classList.contains('active')).toBe(true);
        });
    });

    // ----------------------------------------------------------
    // 訊息顯示測試
    // ----------------------------------------------------------
    describe('訊息顯示', () => {
        test('addMessage 應新增用戶訊息', () => {
            const msgId = ChatbotUI.addMessage('測試訊息', 'user');

            const message = document.getElementById(msgId);
            expect(message).not.toBeNull();
            expect(message.classList.contains('user')).toBe(true);
        });

        test('addMessage 應新增機器人訊息', () => {
            const msgId = ChatbotUI.addMessage('機器人回應', 'bot');

            const message = document.getElementById(msgId);
            expect(message.classList.contains('bot')).toBe(true);
        });

        test('addMessage 載入狀態應有 loading class', () => {
            const msgId = ChatbotUI.addMessage('載入中', 'bot', true);

            const message = document.getElementById(msgId);
            expect(message.classList.contains('loading')).toBe(true);
        });

        test('removeMessage 應移除指定訊息', () => {
            const msgId = ChatbotUI.addMessage('待刪除', 'user');
            ChatbotUI.removeMessage(msgId);

            expect(document.getElementById(msgId)).toBeNull();
        });

        test('removeMessage 對不存在的訊息不應報錯', () => {
            expect(() => {
                ChatbotUI.removeMessage('non-existent-id');
            }).not.toThrow();
        });
    });

    // ----------------------------------------------------------
    // 訊息格式化測試
    // ----------------------------------------------------------
    describe('訊息格式化', () => {
        test('formatMessage 應處理粗體標記', () => {
            const result = ChatbotUI.formatMessage('這是**粗體**文字');
            expect(result).toBe('這是<strong>粗體</strong>文字');
        });

        test('formatMessage 應處理換行符', () => {
            const result = ChatbotUI.formatMessage('第一行\n第二行');
            expect(result).toBe('第一行<br>第二行');
        });

        test('formatMessage 應同時處理粗體和換行', () => {
            const result = ChatbotUI.formatMessage('**標題**\n內容');
            expect(result).toBe('<strong>標題</strong><br>內容');
        });

        test('formatMessage 對普通文字不做變更', () => {
            const result = ChatbotUI.formatMessage('普通文字');
            expect(result).toBe('普通文字');
        });
    });

    // ----------------------------------------------------------
    // 多訊息場景測試
    // ----------------------------------------------------------
    describe('多訊息場景', () => {
        test('應能累積多則訊息', () => {
            ChatbotUI.addMessage('訊息1', 'user');
            ChatbotUI.addMessage('回應1', 'bot');
            ChatbotUI.addMessage('訊息2', 'user');

            const messages = ChatbotUI.chatMessages.querySelectorAll('.chat-message');
            expect(messages.length).toBe(3);
        });
    });
});
