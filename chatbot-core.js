/**
 * AI 智能大腦公司 - Chatbot 核心模組
 * 負責對話管理與狀態控制
 * 
 * @module chatbot-core
 * @version 3.0.0
 * @dependencies chatbot-config.js, chatbot-api.js
 * @exports ChatbotCore (全域)
 */

// ============================================================
// ChatbotCore 類別 - 對話管理核心
// ============================================================
const ChatbotCore = {
    /** @type {Array} 對話歷史 */
    conversationHistory: [],

    /** @type {boolean} 是否已顯示開發模式提示 */
    _devModeNotified: false,

    /**
     * 取得 System Instruction
     * @returns {string} System Instruction 內容
     */
    getSystemInstruction() {
        return window.SYSTEM_INSTRUCTION;
    },

    /**
     * 發送訊息到 Gemini API
     * 自動偵測開發/生產模式
     * @param {string} userMessage - 用戶訊息
     * @returns {Promise<string>} AI 回應文字
     * @throws {Error} API 錯誤
     */
    async sendMessage(userMessage) {
        console.log('📍[ChatbotCore] 發送訊息:', userMessage.substring(0, 50));

        // 加入用戶訊息到歷史
        this.conversationHistory.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        // 準備請求體
        const requestBody = {
            system_instruction: {
                parts: [{ text: window.SYSTEM_INSTRUCTION }]
            },
            contents: this.conversationHistory,
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        };

        try {
            let data;
            const devApiKey = window.getDevApiKey();

            // 判斷使用開發模式還是生產模式
            if (window.isDevMode() && devApiKey) {
                // 開發模式提示（只顯示一次）
                if (!this._devModeNotified) {
                    console.log('📍[ChatbotCore] ⚠️ 開發模式：直接調用 Gemini API');
                    console.log('📍[ChatbotCore] 生產環境請部署 Cloudflare Worker');
                    this._devModeNotified = true;
                }
                data = await window.ChatbotAPI.sendToGeminiDirect(requestBody, devApiKey);
            } else if (window.isDevMode() && !devApiKey) {
                // Worker 未配置且無開發 API Key
                throw new Error(
                    '聊天功能尚未配置。\n\n' +
                    '開發者請在控制台執行：\n' +
                    'localStorage.setItem("GEMINI_API_KEY", "你的金鑰")'
                );
            } else {
                // 生產模式
                data = await window.ChatbotAPI.sendToWorker(requestBody);
            }

            const botMessage = data.candidates?.[0]?.content?.parts?.[0]?.text
                || '抱歉，我無法理解您的問題。';

            // 加入 AI 回應到歷史
            this.conversationHistory.push({
                role: 'model',
                parts: [{ text: botMessage }]
            });

            console.log('📍[ChatbotCore] 收到回應:', botMessage.substring(0, 50));
            return botMessage;

        } catch (error) {
            // 移除失敗的用戶訊息，避免歷史污染
            this.conversationHistory.pop();
            console.error('📍[ChatbotCore] API 錯誤:', error);
            throw error;
        }
    },

    /**
     * 重置對話歷史
     */
    resetConversation() {
        this.conversationHistory = [];
        console.log('📍[ChatbotCore] 對話已重置');
    },

    /**
     * 取得對話歷史長度
     * @returns {number} 歷史訊息數量
     */
    getHistoryLength() {
        return this.conversationHistory.length;
    },

    /**
     * 取得當前模式
     * @returns {string} 'dev' | 'prod' | 'unconfigured'
     */
    getMode() {
        const devApiKey = window.getDevApiKey();
        if (window.isDevMode() && devApiKey) return 'dev';
        if (!window.isDevMode()) return 'prod';
        return 'unconfigured';
    }
};

// 暴露到全域
window.ChatbotCore = ChatbotCore;

// 啟動時顯示模式資訊
console.log(`📍[ChatbotCore] 模式: ${ChatbotCore.getMode()}`);
if (ChatbotCore.getMode() === 'unconfigured') {
    console.log('📍[ChatbotCore] 💡 設定開發模式：localStorage.setItem("GEMINI_API_KEY", "你的金鑰")');
}
