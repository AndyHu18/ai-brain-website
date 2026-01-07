/**
 * 網站分析器 - UI 控制模組
 * @module website-analyzer/ui
 */

const WebsiteAnalyzerUI = {
    // DOM 元素快取
    elements: {
        urlInput: null,
        analyzeBtn: null,
        resultContainer: null,
        loadingState: null,
        errorState: null
    },

    /**
     * 初始化 DOM 元素
     */
    initElements() {
        this.elements.urlInput = document.getElementById('analyzer-url-input');
        this.elements.analyzeBtn = document.getElementById('analyzer-submit-btn');
        this.elements.resultContainer = document.getElementById('analyzer-result');
        this.elements.loadingState = document.getElementById('analyzer-loading');
        this.elements.errorState = document.getElementById('analyzer-error');
    },

    /**
     * 檢查元素是否存在
     * @returns {boolean}
     */
    hasElements() {
        return !!(this.elements.urlInput && this.elements.analyzeBtn);
    },

    /**
     * 取得 URL 輸入值
     * @returns {string}
     */
    getUrlValue() {
        return this.elements.urlInput?.value.trim() || '';
    },

    /**
     * 顯示載入狀態
     */
    showLoading() {
        if (this.elements.loadingState) this.elements.loadingState.style.display = 'flex';
        if (this.elements.analyzeBtn) this.elements.analyzeBtn.disabled = true;
    },

    /**
     * 隱藏載入狀態
     */
    hideLoading() {
        if (this.elements.loadingState) this.elements.loadingState.style.display = 'none';
        if (this.elements.analyzeBtn) this.elements.analyzeBtn.disabled = false;
    },

    /**
     * 顯示錯誤訊息
     * @param {string} message - 錯誤訊息
     */
    showError(message) {
        if (this.elements.errorState) {
            this.elements.errorState.textContent = message;
            this.elements.errorState.style.display = 'block';
        }
    },

    /**
     * 隱藏錯誤訊息
     */
    hideError() {
        if (this.elements.errorState) this.elements.errorState.style.display = 'none';
    },

    /**
     * 隱藏結果區域
     */
    hideResult() {
        if (this.elements.resultContainer) this.elements.resultContainer.style.display = 'none';
    },

    /**
     * 取得結果容器
     * @returns {HTMLElement|null}
     */
    getResultContainer() {
        return this.elements.resultContainer;
    }
};

// 暴露到全域
window.WebsiteAnalyzerUI = WebsiteAnalyzerUI;
