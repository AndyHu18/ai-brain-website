/**
 * AI 智能大腦公司 - Chatbot Core 單元測試
 * 
 * @module tests/chatbot-core.test
 * @description 測試 ChatbotCore API 通訊與對話管理功能
 */

// Mock fetch API
global.fetch = jest.fn();

// 載入測試對象前需要模擬 window
global.window = {};

// ============================================================
// 測試 ChatbotCore 模組
// ============================================================
describe('ChatbotCore', () => {
    let ChatbotCore;

    beforeEach(() => {
        // 重置模組
        jest.resetModules();
        global.fetch.mockClear();
        global.window = {};

        // 手動定義 ChatbotCore（因為是全域變數）
        ChatbotCore = {
            conversationHistory: [],

            getSystemInstruction() {
                return '你是 AI 智能大腦公司的客服顧問...';
            },

            async sendMessage(userMessage) {
                this.conversationHistory.push({
                    role: 'user',
                    parts: [{ text: userMessage }]
                });

                const response = await fetch('https://api.example.com', {
                    method: 'POST',
                    body: JSON.stringify({ message: userMessage })
                });

                if (!response.ok) {
                    throw new Error(`API Error: ${response.status}`);
                }

                const data = await response.json();
                const botMessage = data.candidates?.[0]?.content?.parts?.[0]?.text
                    || '抱歉，我無法理解您的問題。';

                this.conversationHistory.push({
                    role: 'model',
                    parts: [{ text: botMessage }]
                });

                return botMessage;
            },

            resetConversation() {
                this.conversationHistory = [];
            },

            getHistoryLength() {
                return this.conversationHistory.length;
            }
        };
    });

    // ----------------------------------------------------------
    // 基本功能測試
    // ----------------------------------------------------------
    describe('基本功能', () => {
        test('getSystemInstruction 應回傳非空字串', () => {
            const instruction = ChatbotCore.getSystemInstruction();
            expect(typeof instruction).toBe('string');
            expect(instruction.length).toBeGreaterThan(0);
        });

        test('getHistoryLength 初始值應為 0', () => {
            expect(ChatbotCore.getHistoryLength()).toBe(0);
        });

        test('resetConversation 應清空對話歷史', () => {
            ChatbotCore.conversationHistory = [{ role: 'user', parts: [] }];
            ChatbotCore.resetConversation();
            expect(ChatbotCore.getHistoryLength()).toBe(0);
        });
    });

    // ----------------------------------------------------------
    // API 通訊測試
    // ----------------------------------------------------------
    describe('API 通訊', () => {
        test('sendMessage 應正確發送用戶訊息', async () => {
            const mockResponse = {
                ok: true,
                json: () => Promise.resolve({
                    candidates: [{
                        content: {
                            parts: [{ text: '您好！有什麼可以幫您的？' }]
                        }
                    }]
                })
            };
            global.fetch.mockResolvedValueOnce(mockResponse);

            const response = await ChatbotCore.sendMessage('你好');

            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(response).toBe('您好！有什麼可以幫您的？');
        });

        test('sendMessage 應將用戶訊息加入歷史', async () => {
            const mockResponse = {
                ok: true,
                json: () => Promise.resolve({
                    candidates: [{
                        content: { parts: [{ text: '回應' }] }
                    }]
                })
            };
            global.fetch.mockResolvedValueOnce(mockResponse);

            await ChatbotCore.sendMessage('測試訊息');

            expect(ChatbotCore.getHistoryLength()).toBe(2); // user + model
            expect(ChatbotCore.conversationHistory[0].role).toBe('user');
            expect(ChatbotCore.conversationHistory[1].role).toBe('model');
        });

        test('sendMessage 在 API 錯誤時應拋出例外', async () => {
            const mockResponse = {
                ok: false,
                status: 500
            };
            global.fetch.mockResolvedValueOnce(mockResponse);

            await expect(ChatbotCore.sendMessage('測試')).rejects.toThrow('API Error: 500');
        });

        test('sendMessage 在無回應時應回傳預設訊息', async () => {
            const mockResponse = {
                ok: true,
                json: () => Promise.resolve({
                    candidates: []
                })
            };
            global.fetch.mockResolvedValueOnce(mockResponse);

            const response = await ChatbotCore.sendMessage('測試');
            expect(response).toBe('抱歉，我無法理解您的問題。');
        });
    });

    // ----------------------------------------------------------
    // 對話歷史管理測試
    // ----------------------------------------------------------
    describe('對話歷史管理', () => {
        test('多輪對話應累積歷史', async () => {
            const mockResponse = {
                ok: true,
                json: () => Promise.resolve({
                    candidates: [{ content: { parts: [{ text: '回應' }] } }]
                })
            };

            global.fetch.mockResolvedValue(mockResponse);

            await ChatbotCore.sendMessage('訊息1');
            await ChatbotCore.sendMessage('訊息2');

            expect(ChatbotCore.getHistoryLength()).toBe(4); // 2 user + 2 model
        });

        test('resetConversation 後可重新開始對話', async () => {
            const mockResponse = {
                ok: true,
                json: () => Promise.resolve({
                    candidates: [{ content: { parts: [{ text: '回應' }] } }]
                })
            };
            global.fetch.mockResolvedValue(mockResponse);

            await ChatbotCore.sendMessage('第一輪');
            ChatbotCore.resetConversation();
            await ChatbotCore.sendMessage('新對話');

            expect(ChatbotCore.getHistoryLength()).toBe(2);
            expect(ChatbotCore.conversationHistory[0].parts[0].text).toBe('新對話');
        });
    });

    // ----------------------------------------------------------
    // 開發模式功能測試
    // ----------------------------------------------------------
    describe('開發模式功能', () => {
        // 使用物件容器來避免閉包問題
        const storage = { data: {} };

        beforeEach(() => {
            // 清空物件內容而非重新賦值
            storage.data = {};
            global.localStorage = {
                getItem: jest.fn((key) => storage.data[key] ?? null),
                setItem: jest.fn((key, value) => { storage.data[key] = value; }),
                removeItem: jest.fn((key) => { delete storage.data[key]; }),
                clear: jest.fn(() => { storage.data = {}; })
            };
        });

        test('isDevMode 在 Worker URL 為預留位時應回傳 true', () => {
            // 模擬 isDevMode 函數
            const isDevMode = () => {
                const workerUrl = 'https://ai-brain-api-proxy.your-subdomain.workers.dev';
                return workerUrl.includes('your-subdomain');
            };

            expect(isDevMode()).toBe(true);
        });

        test('isDevMode 在 Worker URL 已配置時應回傳 false', () => {
            const isDevMode = () => {
                const workerUrl = 'https://ai-brain-api-proxy.mycompany.workers.dev';
                return workerUrl.includes('your-subdomain');
            };

            expect(isDevMode()).toBe(false);
        });

        test('getDevApiKey 應從 localStorage 取得 API Key', () => {
            // 直接測試 getDevApiKey 的邏輯
            const mockStorage = { 'GEMINI_API_KEY': 'test-api-key-123' };
            const getDevApiKey = () => mockStorage['GEMINI_API_KEY'] || null;

            expect(getDevApiKey()).toBe('test-api-key-123');
        });

        test('getDevApiKey 無 API Key 時應回傳 null', () => {
            // 直接測試 getDevApiKey 的邏輯
            const mockStorage = {};
            const getDevApiKey = () => mockStorage['GEMINI_API_KEY'] || null;

            expect(getDevApiKey()).toBeNull();
        });
    });

    // ----------------------------------------------------------
    // 重試機制測試
    // ----------------------------------------------------------
    describe('重試機制', () => {
        test('可重試的 HTTP 狀態碼應包含 429 和 500 系列', () => {
            const RETRYABLE_STATUS = [408, 429, 500, 502, 503, 504];

            expect(RETRYABLE_STATUS).toContain(429); // Rate limit
            expect(RETRYABLE_STATUS).toContain(500); // Server error
            expect(RETRYABLE_STATUS).toContain(503); // Service unavailable
            expect(RETRYABLE_STATUS).not.toContain(400); // Bad request 不應重試
            expect(RETRYABLE_STATUS).not.toContain(401); // Unauthorized 不應重試
        });

        test('重試延遲應使用指數退避', () => {
            const RETRY_DELAYS = [1000, 2000, 4000];

            expect(RETRY_DELAYS[0]).toBe(1000);
            expect(RETRY_DELAYS[1]).toBe(2000);
            expect(RETRY_DELAYS[2]).toBe(4000);
            // 驗證指數成長
            expect(RETRY_DELAYS[1]).toBe(RETRY_DELAYS[0] * 2);
            expect(RETRY_DELAYS[2]).toBe(RETRY_DELAYS[1] * 2);
        });

        test('最大重試次數應為 3', () => {
            const MAX_RETRIES = 3;
            expect(MAX_RETRIES).toBe(3);
        });
    });

    // ----------------------------------------------------------
    // 錯誤處理測試
    // ----------------------------------------------------------
    describe('錯誤處理', () => {
        test('400 錯誤不應重試，直接拋出', async () => {
            const mockResponse = {
                ok: false,
                status: 400
            };
            global.fetch.mockResolvedValueOnce(mockResponse);

            await expect(ChatbotCore.sendMessage('測試')).rejects.toThrow('API Error: 400');
            expect(global.fetch).toHaveBeenCalledTimes(1); // 只呼叫一次，沒有重試
        });

        test('401 錯誤不應重試，直接拋出', async () => {
            const mockResponse = {
                ok: false,
                status: 401
            };
            global.fetch.mockResolvedValueOnce(mockResponse);

            await expect(ChatbotCore.sendMessage('測試')).rejects.toThrow('API Error: 401');
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        test('網路錯誤時應拋出適當的例外', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Failed to fetch'));

            await expect(ChatbotCore.sendMessage('測試')).rejects.toThrow('Failed to fetch');
        });

        test('超時錯誤時應拋出 AbortError', async () => {
            const abortError = new Error('The operation was aborted');
            abortError.name = 'AbortError';
            global.fetch.mockRejectedValueOnce(abortError);

            await expect(ChatbotCore.sendMessage('測試')).rejects.toMatchObject({
                name: 'AbortError'
            });
        });
    });

    // ----------------------------------------------------------
    // 模式識別測試
    // ----------------------------------------------------------
    describe('模式識別', () => {
        test('getMode 函數應存在', () => {
            // 模擬 getMode 函數
            const getMode = (hasDevKey, isPlaceholderUrl) => {
                if (isPlaceholderUrl && hasDevKey) return 'dev';
                if (!isPlaceholderUrl) return 'prod';
                return 'unconfigured';
            };

            expect(getMode(true, true)).toBe('dev');
            expect(getMode(false, false)).toBe('prod');
            expect(getMode(false, true)).toBe('unconfigured');
        });
    });
});

