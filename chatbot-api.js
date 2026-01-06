/**
 * AI 智能大腦公司 - Chatbot API 通訊模組
 * 負責 HTTP 請求、超時控制與重試機制
 * 
 * @module chatbot-api
 * @version 1.0.0
 * @dependencies chatbot-config.js (API_CONFIG, isDevMode, getDevApiKey)
 * @exports ChatbotAPI (全域)
 */

// ============================================================
// ChatbotAPI - HTTP 通訊層
// ============================================================
const ChatbotAPI = {
    /**
     * 帶超時的 fetch
     * @param {string} url - 請求 URL
     * @param {object} options - fetch 選項
     * @returns {Promise<Response>} fetch 回應
     */
    async fetchWithTimeout(url, options) {
        const controller = new AbortController();
        const timeout = setTimeout(
            () => controller.abort(),
            API_CONFIG.TIMEOUT_MS
        );

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            return response;
        } finally {
            clearTimeout(timeout);
        }
    },

    /**
     * 帶重試的 fetch（指數退避）
     * @param {string} url - API URL
     * @param {object} options - fetch 選項
     * @returns {Promise<Response>} fetch 回應
     */
    async fetchWithRetry(url, options) {
        let lastError;

        for (let attempt = 0; attempt < API_CONFIG.MAX_RETRIES; attempt++) {
            try {
                console.log(`📍[ChatbotAPI] 嘗試第 ${attempt + 1} 次...`);
                const response = await this.fetchWithTimeout(url, options);

                // 成功或不可重試的錯誤，直接返回
                if (response.ok || !API_CONFIG.RETRYABLE_STATUS.includes(response.status)) {
                    return response;
                }

                // 可重試的錯誤
                lastError = new Error(`HTTP ${response.status}`);
                console.warn(`📍[ChatbotAPI] 可重試錯誤: ${response.status}`);

            } catch (error) {
                lastError = error;
                console.warn(`📍[ChatbotAPI] 請求失敗:`, error.message);
            }

            // 最後一次嘗試不需要等待
            if (attempt < API_CONFIG.MAX_RETRIES - 1) {
                const delay = API_CONFIG.RETRY_DELAYS[attempt] || 4000;
                console.log(`📍[ChatbotAPI] 等待 ${delay}ms 後重試...`);
                await new Promise(r => setTimeout(r, delay));
            }
        }

        throw lastError || new Error('所有重試均失敗');
    },

    /**
     * 開發模式：直接調用 Gemini API
     * @param {object} requestBody - 請求體
     * @param {string} apiKey - API Key
     * @returns {Promise<object>} API 回應
     */
    async sendToGeminiDirect(requestBody, apiKey) {
        const url = `${API_CONFIG.GEMINI_API_URL}?key=${apiKey}`;

        const response = await this.fetchWithRetry(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API Error: ${response.status}`);
        }

        return response.json();
    },

    /**
     * 生產模式：透過 Worker 代理調用
     * @param {object} requestBody - 請求體
     * @returns {Promise<object>} API 回應
     */
    async sendToWorker(requestBody) {
        const url = `${API_CONFIG.WORKER_URL}${API_CONFIG.CHAT_ENDPOINT}`;

        const response = await this.fetchWithRetry(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return response.json();
    }
};

// 暴露到全域
window.ChatbotAPI = ChatbotAPI;

console.log('📍[ChatbotAPI] 通訊層載入完成');
