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

    // 進度條階段
    const PROGRESS_STAGES = [
        { percent: 10, text: '正在連接網站...' },
        { percent: 25, text: '抓取網站內容...' },
        { percent: 45, text: 'AI 正在分析服務項目...' },
        { percent: 65, text: 'AI 正在識別自動化機會...' },
        { percent: 80, text: 'AI 正在生成優化建議...' },
        { percent: 95, text: '正在整理報告...' }
    ];

    // 重試設定
    const MAX_RETRIES = 2;
    const RETRY_DELAY = 2000;

    /**
     * 處理分析請求（含重試機制）
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
        startProgressAnimation();

        let lastError = null;
        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                if (attempt > 0) {
                    updateProgress(5, `重試中 (${attempt}/${MAX_RETRIES})...`);
                    await sleep(RETRY_DELAY);
                }

                const data = await fetchWithProgress(url);

                // 驗證資料完整性
                if (data.analysis && validateAnalysisData(data.analysis)) {
                    updateProgress(100, '分析完成！');
                    await sleep(300);
                    renderReport(data);
                    return;
                } else {
                    throw new Error('分析結果資料不完整，正在重試...');
                }
            } catch (error) {
                console.error(`📍[WebsiteAnalyzer] 嘗試 ${attempt + 1} 失敗:`, error);
                lastError = error;
            }
        }

        // 所有重試都失敗
        showError(lastError?.message || '分析失敗，請稍後再試');
        hideLoading();
    }

    /**
     * 帶進度的 API 請求
     */
    async function fetchWithProgress(url) {
        updateProgress(PROGRESS_STAGES[0].percent, PROGRESS_STAGES[0].text);

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        updateProgress(PROGRESS_STAGES[2].percent, PROGRESS_STAGES[2].text);

        const data = await response.json();

        updateProgress(PROGRESS_STAGES[4].percent, PROGRESS_STAGES[4].text);

        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
        }

        updateProgress(PROGRESS_STAGES[5].percent, PROGRESS_STAGES[5].text);
        return data;
    }

    /**
     * 驗證分析資料完整性
     */
    function validateAnalysisData(analysis) {
        // 至少要有一個區塊有資料
        const hasServices = analysis.services?.length > 0;
        const hasOpps = analysis.aiOpportunities?.length > 0;
        const hasDepts = analysis.departmentInsights?.length > 0;
        const hasSummary = analysis.summary?.length > 50;

        return hasServices || hasOpps || hasDepts || hasSummary;
    }

    /**
     * 更新進度條
     */
    function updateProgress(percent, text) {
        const progressBar = document.getElementById('analyzer-progress-bar');
        const progressText = document.getElementById('analyzer-progress-text');
        if (progressBar) progressBar.style.width = percent + '%';
        if (progressText) progressText.textContent = text;
    }

    /**
     * 開始進度動畫
     */
    function startProgressAnimation() {
        updateProgress(0, '準備分析...');
    }

    /**
     * 延遲工具函數
     */
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 渲染報告
     */
    function renderReport(report) {
        const analysis = report.analysis;
        const generatedTime = new Date(report.generatedAt).toLocaleString('zh-TW');

        let html = `
            <div class="analyzer-report">
                <div class="report-header">
                    <h3>AI 賦能分析報告</h3>
                    <p class="report-title">${report.websiteTitle}</p>
                    <p class="report-meta">網址：${report.websiteUrl} | 生成時間：${generatedTime}</p>
                </div>
        `;

        // 摘要
        if (analysis.summary) {
            html += `
                <div class="report-summary">
                    <h4>執行摘要</h4>
                    <p>${analysis.summary}</p>
                </div>
            `;
        }

        html += '<div class="report-sections">';

        // Section 1: 服務項目 (卡片式)
        html += renderServicesSection(analysis.services);

        // Section 2: AI 機會 (表格式)
        html += renderOpportunitiesTable(analysis.aiOpportunities);

        // Section 3: 部門賦能 (卡片式)
        html += renderDepartmentsSection(analysis.departmentInsights);

        // Section 4: 職位層級 (列表式)
        html += renderPositionsSection(analysis.positionOpportunities);

        // Section 5: 網站優化 (優先級卡片)
        html += renderOptimizationsSection(analysis.websiteOptimizations);

        // Section 6: 銷售漏斗 (流程圖式)
        html += renderSalesFunnelSection(analysis.salesFunnelAI);

        html += '</div>';

        // 完整分析連結
        const fullAnalyzerUrl = 'https://ai-website-analyzer-andyhu18s-projects.vercel.app';
        html += `
            <div class="report-cta">
                <p class="cta-text">想要更詳細的分析報告？使用我們的專業分析工具獲取完整洞察。</p>
                <a href="${fullAnalyzerUrl}" target="_blank" rel="noopener" class="cta-button">
                    前往完整分析工具 →
                </a>
            </div>
        `;

        html += '</div>';
        resultContainer.innerHTML = html;
        resultContainer.style.display = 'block';
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function renderServicesSection(services) {
        if (!services || services.length === 0) return '';
        let cards = services.map(s => `
            <div class="analyzer-service-card">
                <h5>${s.name}</h5>
                <p>${s.description}</p>
                <span class="service-category">${s.category}</span>
            </div>
        `).join('');
        return `
            <div class="report-section">
                <div class="section-header">
                    <span class="section-number">01</span>
                    <h4>網站服務項目識別</h4>
                </div>
                <div class="services-grid">${cards}</div>
            </div>
        `;
    }

    function renderOpportunitiesTable(opportunities) {
        if (!opportunities || opportunities.length === 0) return '';
        let rows = opportunities.map(o => `
            <tr>
                <td>${o.area}</td>
                <td>${o.application}</td>
                <td class="benefit">${o.estimatedBenefit}</td>
                <td><span class="difficulty-${o.difficulty}">${o.difficulty === 'low' ? '低' : o.difficulty === 'medium' ? '中' : '高'}</span></td>
            </tr>
        `).join('');
        return `
            <div class="report-section">
                <div class="section-header">
                    <span class="section-number">02</span>
                    <h4>AI 自動化機會分析</h4>
                </div>
                <div class="table-wrapper">
                    <table class="opportunities-table">
                        <thead>
                            <tr><th>領域</th><th>AI 應用</th><th>預估效益</th><th>難度</th></tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            </div>
        `;
    }

    function renderDepartmentsSection(departments) {
        if (!departments || departments.length === 0) return '';
        let cards = departments.map(d => `
            <div class="department-card">
                <h5>${d.department}</h5>
                <div class="dept-opportunities">
                    <p class="dept-label">機會：</p>
                    <ul>${d.opportunities.map(o => `<li>${o}</li>`).join('')}</ul>
                </div>
                <div class="dept-tools">
                    <p class="dept-label">推薦工具：</p>
                    <div class="tools-tags">${d.tools.map(t => `<span class="tool-tag">${t}</span>`).join('')}</div>
                </div>
            </div>
        `).join('');
        return `
            <div class="report-section">
                <div class="section-header">
                    <span class="section-number">03</span>
                    <h4>部門賦能機會</h4>
                </div>
                <div class="departments-grid">${cards}</div>
            </div>
        `;
    }

    function renderPositionsSection(positions) {
        if (!positions || positions.length === 0) return '';
        let items = positions.map(p => `
            <div class="position-card">
                <h5>${p.levelName}</h5>
                <ul>${p.opportunities.map(o => `<li><span class="arrow">→</span> ${o}</li>`).join('')}</ul>
            </div>
        `).join('');
        return `
            <div class="report-section">
                <div class="section-header">
                    <span class="section-number">04</span>
                    <h4>職位層級賦能建議</h4>
                </div>
                <div class="positions-list">${items}</div>
            </div>
        `;
    }

    function renderOptimizationsSection(optimizations) {
        if (!optimizations || optimizations.length === 0) return '';
        let items = optimizations.map(o => `
            <div class="optimization-card">
                <span class="priority-${o.priority}">${o.priority === 'high' ? '高優先' : o.priority === 'medium' ? '中優先' : '低優先'}</span>
                <div class="opt-content">
                    <h5>${o.type}</h5>
                    <p>${o.suggestion}</p>
                </div>
            </div>
        `).join('');
        return `
            <div class="report-section">
                <div class="section-header">
                    <span class="section-number">05</span>
                    <h4>網站 AI 優化建議</h4>
                </div>
                <div class="optimizations-list">${items}</div>
            </div>
        `;
    }

    function renderSalesFunnelSection(funnel) {
        if (!funnel || funnel.length === 0) return '';
        let stages = funnel.map((s, idx) => `
            <div class="funnel-stage">
                <div class="stage-number">${idx + 1}</div>
                <h5>${s.stage}</h5>
                <p class="stage-app">${s.aiApplication}</p>
                <p class="stage-desc">${s.description}</p>
            </div>
        `).join('');
        return `
            <div class="report-section">
                <div class="section-header">
                    <span class="section-number">06</span>
                    <h4>銷售漏斗 AI 應用</h4>
                </div>
                <div class="funnel-flow">${stages}</div>
            </div>
        `;
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
