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

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            // API 直接返回 Report 格式
            if (data.analysis) {
                renderReport(data);
            } else {
                throw new Error('分析結果格式錯誤');
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
        const analysis = report.analysis;
        let html = `
            <div class="analyzer-report">
                <div class="report-header">
                    <h3>AI 賦能分析報告</h3>
                    <p class="report-target">目標網站：${report.websiteUrl}</p>
                </div>
                <div class="report-sections">
        `;

        // Section 1: 服務項目
        html += renderSection('01', '網站服務項目識別',
            analysis.services.map(s => `<strong>${s.name}</strong>：${s.description}`).join('<br>'));

        // Section 2: AI 機會
        html += renderSection('02', 'AI 自動化潛力',
            analysis.aiOpportunities.map(o => `<strong>${o.area}</strong>：${o.application} (效益: ${o.estimatedBenefit})`).join('<br>'));

        // Section 3: 部門賦能
        html += renderSection('03', '不同部門的賦能機會',
            analysis.departmentInsights.map(d => `<strong>${d.department}</strong>：${d.opportunities.join('、')}`).join('<br>'));

        // Section 4: 職位層級
        html += renderSection('04', '職位層級賦能建議',
            analysis.positionOpportunities.map(p => `<strong>${p.levelName}</strong>：${p.opportunities.join('、')}`).join('<br>'));

        // Section 5: 網站優化
        html += renderSection('05', '網站 AI 賦能與優化建議',
            analysis.websiteOptimizations.map(o => `<strong>${o.type}</strong>：${o.suggestion}`).join('<br>'));

        // Section 6: 銷售漏斗
        html += renderSection('06', '銷售漏斗與成交跟進',
            analysis.salesFunnelAI.map(s => `<strong>${s.stage}</strong>：${s.aiApplication}`).join('<br>'));

        html += '</div></div>';
        resultContainer.innerHTML = html;
        resultContainer.style.display = 'block';
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function renderSection(num, title, content) {
        return `
            <div class="report-section">
                <div class="section-header">
                    <span class="section-number">${num}</span>
                    <h4>${title}</h4>
                </div>
                <div class="section-content">${content}</div>
            </div>
        `;
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
