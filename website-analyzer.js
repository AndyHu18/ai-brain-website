/**
 * @file    : website-analyzer.js
 * @purpose : 調用 AI Website Analyzer API 進行網站分析
 * @depends : []
 * @usedBy  : [index.html]
 */

const WebsiteAnalyzer = (function () {
    'use strict';

    // API 端點
    const API_URL = 'https://ai-website-analyzer-andyhu18s-projects.vercel.app/api/analyze';

    // DOM 元素
    let urlInput, analyzeBtn, resultContainer, loadingState, errorState;

    /**
     * 初始化模組
     */
    function init() {
        urlInput = document.getElementById('analyzer-url-input');
        analyzeBtn = document.getElementById('analyzer-submit-btn');
        resultContainer = document.getElementById('analyzer-result');
        loadingState = document.getElementById('analyzer-loading');
        errorState = document.getElementById('analyzer-error');

        if (!urlInput || !analyzeBtn) {
            console.log('📍[WebsiteAnalyzer] 分析器區塊不存在，跳過初始化');
            return;
        }

        analyzeBtn.addEventListener('click', handleAnalyze);
        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleAnalyze();
        });

        console.log('📍[WebsiteAnalyzer] 初始化完成');
    }

    /**
     * 處理分析請求
     */
    async function handleAnalyze() {
        const url = urlInput.value.trim();
        if (!url) {
            showError('請輸入網站網址');
            return;
        }

        showLoading();
        hideError();
        hideResult();

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.report) {
                renderReport(data.report);
            } else {
                throw new Error(data.error || '分析失敗');
            }
        } catch (error) {
            console.error('📍[WebsiteAnalyzer] 錯誤:', error);
            showError(error.message || '網路錯誤，請稍後再試');
        } finally {
            hideLoading();
        }
    }

    /**
     * 渲染報告
     */
    function renderReport(report) {
        const sections = report.sections || [];
        let html = `
            <div class="analyzer-report">
                <div class="report-header">
                    <h3>AI 賦能分析報告</h3>
                    <p class="report-target">目標網站：${report.targetUrl || urlInput.value}</p>
                </div>
                <div class="report-sections">
        `;

        sections.forEach((section, index) => {
            html += `
                <div class="report-section">
                    <div class="section-header">
                        <span class="section-number">${String(index + 1).padStart(2, '0')}</span>
                        <h4>${section.title}</h4>
                    </div>
                    <div class="section-content">${formatContent(section.content)}</div>
                </div>
            `;
        });

        html += '</div></div>';
        resultContainer.innerHTML = html;
        resultContainer.style.display = 'block';
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * 格式化內容（處理換行和項目符號）
     */
    function formatContent(content) {
        if (!content) return '';
        return content
            .replace(/\n/g, '<br>')
            .replace(/•/g, '<span class="bullet">•</span>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }

    function showLoading() {
        if (loadingState) loadingState.style.display = 'flex';
        if (analyzeBtn) analyzeBtn.disabled = true;
    }

    function hideLoading() {
        if (loadingState) loadingState.style.display = 'none';
        if (analyzeBtn) analyzeBtn.disabled = false;
    }

    function showError(message) {
        if (errorState) {
            errorState.textContent = message;
            errorState.style.display = 'block';
        }
    }

    function hideError() {
        if (errorState) errorState.style.display = 'none';
    }

    function hideResult() {
        if (resultContainer) resultContainer.style.display = 'none';
    }

    // DOM 載入後初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return { init, handleAnalyze };
})();

window.WebsiteAnalyzer = WebsiteAnalyzer;
