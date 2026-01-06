/**
 * AI 智能大腦公司 - Chatbot Hints 單元測試
 * 
 * @module tests/chatbot-hints.test
 * @description 測試 ChatbotHints 提示輪播功能
 */

// ============================================================
// DOM 模擬設定
// ============================================================
const createMockDOM = () => {
    document.body.innerHTML = `
        <div id="chatHint">
            <span id="chatHintText">有問題嗎？問我！</span>
        </div>
        <button id="chatToggle"></button>
        <div id="chatWindow"></div>
        <div class="chat-notification"></div>
    `;
};

// ============================================================
// 測試 ChatbotHints 模組
// ============================================================
describe('ChatbotHints', () => {
    let ChatbotHints;

    beforeEach(() => {
        jest.useFakeTimers();
        createMockDOM();

        // 定義 HINT_MESSAGES 常數
        const HINT_MESSAGES = [
            '有問題嗎？問我！',
            '想了解 AI 服務？',
            '24/7 線上諮詢',
            '免費 AI 導入評估',
            '點我開始對話'
        ];

        // 定義 ChatbotHints
        ChatbotHints = {
            chatHint: null,
            chatHintText: null,
            currentIndex: 0,
            rotationTimer: null,
            observer: null,
            messages: HINT_MESSAGES,

            init() {
                this.chatHint = document.getElementById('chatHint');
                this.chatHintText = document.getElementById('chatHintText');
            },

            startRotation() {
                this.rotationTimer = setInterval(() => {
                    this.rotateToNext();
                }, 4000);
            },

            stopRotation() {
                if (this.rotationTimer) {
                    clearInterval(this.rotationTimer);
                    this.rotationTimer = null;
                }
            },

            rotateToNext() {
                this.currentIndex = (this.currentIndex + 1) % this.messages.length;
                if (this.chatHintText) {
                    this.chatHintText.style.opacity = '0';
                    setTimeout(() => {
                        this.chatHintText.textContent = this.messages[this.currentIndex];
                        this.chatHintText.style.opacity = '1';
                    }, 300);
                }
            },

            hide() {
                if (this.chatHint) {
                    this.chatHint.style.display = 'none';
                }
            },

            show() {
                if (this.chatHint) {
                    this.chatHint.style.display = 'block';
                }
            },

            getCurrentMessage() {
                return this.messages[this.currentIndex];
            },

            getAllMessages() {
                return [...this.messages];
            },

            destroy() {
                this.stopRotation();
                if (this.observer) {
                    this.observer.disconnect();
                    this.observer = null;
                }
            }
        };

        ChatbotHints.init();
    });

    afterEach(() => {
        jest.useRealTimers();
        ChatbotHints.destroy();
    });

    // ----------------------------------------------------------
    // 初始化測試
    // ----------------------------------------------------------
    describe('初始化', () => {
        test('init 應正確綁定 DOM 元素', () => {
            expect(ChatbotHints.chatHint).not.toBeNull();
            expect(ChatbotHints.chatHintText).not.toBeNull();
        });

        test('初始索引應為 0', () => {
            expect(ChatbotHints.currentIndex).toBe(0);
        });

        test('getAllMessages 應回傳 5 則提示', () => {
            expect(ChatbotHints.getAllMessages().length).toBe(5);
        });
    });

    // ----------------------------------------------------------
    // 輪播功能測試
    // ----------------------------------------------------------
    describe('輪播功能', () => {
        test('rotateToNext 應切換到下一則提示', () => {
            ChatbotHints.rotateToNext();
            expect(ChatbotHints.currentIndex).toBe(1);
        });

        test('rotateToNext 應循環回第一則', () => {
            for (let i = 0; i < 5; i++) {
                ChatbotHints.rotateToNext();
            }
            expect(ChatbotHints.currentIndex).toBe(0);
        });

        test('startRotation 應設定定時器', () => {
            ChatbotHints.startRotation();
            expect(ChatbotHints.rotationTimer).not.toBeNull();
        });

        test('stopRotation 應清除定時器', () => {
            ChatbotHints.startRotation();
            ChatbotHints.stopRotation();
            expect(ChatbotHints.rotationTimer).toBeNull();
        });

        test('定時器應每 4 秒切換一次', () => {
            ChatbotHints.startRotation();

            jest.advanceTimersByTime(4000);
            expect(ChatbotHints.currentIndex).toBe(1);

            jest.advanceTimersByTime(4000);
            expect(ChatbotHints.currentIndex).toBe(2);
        });
    });

    // ----------------------------------------------------------
    // 顯示/隱藏測試
    // ----------------------------------------------------------
    describe('顯示/隱藏控制', () => {
        test('hide 應隱藏提示氣泡', () => {
            ChatbotHints.hide();
            expect(ChatbotHints.chatHint.style.display).toBe('none');
        });

        test('show 應顯示提示氣泡', () => {
            ChatbotHints.hide();
            ChatbotHints.show();
            expect(ChatbotHints.chatHint.style.display).toBe('block');
        });
    });

    // ----------------------------------------------------------
    // 訊息取得測試
    // ----------------------------------------------------------
    describe('訊息取得', () => {
        test('getCurrentMessage 應回傳目前提示', () => {
            expect(ChatbotHints.getCurrentMessage()).toBe('有問題嗎？問我！');
        });

        test('getCurrentMessage 在切換後應回傳新提示', () => {
            ChatbotHints.rotateToNext();
            expect(ChatbotHints.getCurrentMessage()).toBe('想了解 AI 服務？');
        });

        test('getAllMessages 應回傳所有提示的複本', () => {
            const messages = ChatbotHints.getAllMessages();
            messages.push('新增');
            expect(ChatbotHints.getAllMessages().length).toBe(5); // 原陣列不受影響
        });
    });

    // ----------------------------------------------------------
    // 銷毀功能測試
    // ----------------------------------------------------------
    describe('銷毀功能', () => {
        test('destroy 應停止輪播', () => {
            ChatbotHints.startRotation();
            ChatbotHints.destroy();
            expect(ChatbotHints.rotationTimer).toBeNull();
        });
    });

    // ----------------------------------------------------------
    // 邊界情況測試
    // ----------------------------------------------------------
    describe('邊界情況', () => {
        test('DOM 不存在時 init 不應報錯', () => {
            document.body.innerHTML = '';
            expect(() => {
                ChatbotHints.init();
            }).not.toThrow();
        });

        test('重複調用 stopRotation 不應報錯', () => {
            expect(() => {
                ChatbotHints.stopRotation();
                ChatbotHints.stopRotation();
            }).not.toThrow();
        });
    });
});
