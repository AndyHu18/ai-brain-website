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

        html += '</div></div>';
        resultContainer.innerHTML = html;
        resultContainer.style.display = 'block';
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function renderServicesSection(services) {
        if (!services || services.length === 0) return '';
        let cards = services.map(s => `
            <div class="service-card">
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
