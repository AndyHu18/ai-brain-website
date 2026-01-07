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

    // 進度條階段 - 更豐富的動態狀態訊息
    const PROGRESS_STAGES = [
        { percent: 5, text: '🔗 正在連接網站...' },
        { percent: 12, text: '📡 建立安全連線中...' },
        { percent: 20, text: '📄 抓取網頁內容...' },
        { percent: 28, text: '🔍 解析頁面結構...' },
        { percent: 35, text: '📊 掃描服務項目...' },
        { percent: 45, text: '🤖 AI 正在分析業務模式...' },
        { percent: 55, text: '💡 識別 AI 導入機會...' },
        { percent: 65, text: '⚡ 評估自動化潛力...' },
        { percent: 75, text: '📈 計算預估效益...' },
        { percent: 85, text: '✍️ 撰寫優化建議...' },
        { percent: 92, text: '📋 整理分析報告...' },
        { percent: 98, text: '✅ 最終檢查中...' }
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
     * 帶進度的 API 請求（含動態進度動畫）
     */
    async function fetchWithProgress(url) {
        // 啟動自動進度動畫
        let stageIndex = 0;
        let progressAnimationDone = false;

        const progressAnimation = async () => {
            while (!progressAnimationDone && stageIndex < PROGRESS_STAGES.length) {
                const stage = PROGRESS_STAGES[stageIndex];
                updateProgress(stage.percent, stage.text);
                stageIndex++;
                // 每個階段顯示 1.5-2.5 秒（隨機變化讓動畫更自然）
                await sleep(1500 + Math.random() * 1000);
            }
        };

        // 開始進度動畫（非阻塞）
        const animationPromise = progressAnimation();

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            const data = await response.json();

            // 🔍 診斷模式：記錄 API 回傳的原始數據
            console.group('📊 [診斷] API 原始回傳數據');
            console.log('🌐 請求 URL:', url);
            console.log('📦 回應狀態:', response.status, response.ok ? '✅' : '❌');

            if (data.content) {
                console.log('📄 抓取內容:', {
                    標題: data.content.title,
                    描述: data.content.description?.slice(0, 100) + '...',
                    textContent長度: data.content.textContent?.length || 0,
                    導航項目數: data.content.navigation?.length || 0,
                    導航項目: data.content.navigation
                });
            }

            if (data.analysis) {
                console.log('🤖 AI 分析結果:', {
                    services數量: data.analysis.services?.length || 0,
                    services內容: data.analysis.services,
                    aiOpportunities數量: data.analysis.aiOpportunities?.length || 0,
                    departmentInsights數量: data.analysis.departmentInsights?.length || 0,
                    positionOpportunities數量: data.analysis.positionOpportunities?.length || 0,
                    websiteOptimizations數量: data.analysis.websiteOptimizations?.length || 0,
                    salesFunnelAI數量: data.analysis.salesFunnelAI?.length || 0,
                    summary長度: data.analysis.summary?.length || 0,
                    summary前100字: data.analysis.summary?.slice(0, 100) + '...'
                });
            }

            // 完整 JSON 輸出（可展開查看）
            console.log('📋 完整原始數據:', JSON.parse(JSON.stringify(data)));
            console.groupEnd();

            // 停止進度動畫
            progressAnimationDone = true;

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            progressAnimationDone = true;
            throw error;
        }
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
                    <h3>30 秒看懂：AI 能幫你省多少？</h3>
                    <p class="report-title">${report.websiteTitle}</p>
                    <p class="report-meta">網址：${report.websiteUrl} | 生成時間：${generatedTime}</p>
                </div>
        `;

        // 📥 PDF 下載區塊
        html += `
            <div class="report-download-section">
                <button class="pdf-download-btn" id="download-pdf-btn" data-report='${JSON.stringify(report).replace(/'/g, "\\'")}'>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7,10 12,15 17,10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    <span class="btn-text">下載 PDF 報告</span>
                </button>
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

        // 🏢 公司介紹區塊
        html += `
            <div class="company-intro-section">
                <div class="company-intro-header">
                    <div class="company-logo-placeholder">AI</div>
                    <div>
                        <h4>AI 智能大腦公司</h4>
                        <p>企業級 AI 導入專家</p>
                    </div>
                </div>
                <div class="company-intro-content">
                    <p>我們專注於將人工智慧技術轉化為可落地的商業解決方案，協助企業降低營運成本、提升服務效率、創造競爭優勢。</p>
                    <div class="company-services-grid">
                        <div class="company-service-tag">自動流量小編</div>
                        <div class="company-service-tag">智慧接線生</div>
                        <div class="company-service-tag">品牌分身術</div>
                        <div class="company-service-tag">客服機器人</div>
                        <div class="company-service-tag">智慧會議秘書</div>
                        <div class="company-service-tag">AI 顧問</div>
                    </div>
                    <a href="https://ai-brain.com.tw" target="_blank" rel="noopener" class="company-cta-link">
                        了解更多 AI 解決方案
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </a>
                </div>
            </div>
        `;

        // 📥 底部 PDF 下載區塊
        html += `
            <div class="report-download-section report-download-bottom">
                <button class="pdf-download-btn pdf-download-btn-bottom" id="download-pdf-btn-bottom" data-report='${JSON.stringify(report).replace(/'/g, "\\'")}' aria-label="下載 PDF 報告">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7,10 12,15 17,10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    <span class="btn-text">下載完整 PDF 報告</span>
                </button>
                <p class="download-hint">包含所有分析結果與 AI 智能大腦公司介紹</p>
            </div>
        `;

        // 📧 寄送報告到信箱 CTA
        html += `
            <div class="report-email-cta">
                <div class="email-cta-header">
                    <span class="email-icon">
                        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="2" y="4" width="20" height="16" rx="2"/>
                            <polyline points="22,6 12,13 2,6"/>
                        </svg>
                    </span>
                    <h4>將報告寄到您的信箱</h4>
                    <p>保存這份分析結果，隨時回顧</p>
                </div>
                <form class="email-capture-form" id="report-email-form">
                    <input type="email" 
                           id="report-email-input" 
                           placeholder="請輸入您的 Email" 
                           required>
                    <button type="submit" class="email-submit-btn">
                        寄送報告
                    </button>
                </form>
                <p class="email-hint">建議使用公司信箱，方便團隊討論</p>
            </div>
        `;

        // 完整分析連結
        const fullAnalyzerUrl = 'https://ai-website-analyzer-andyhu18s-projects.vercel.app';
        html += `
            <div class="report-cta">
                <p class="cta-text">想要更詳細的分析報告？使用我們的專業分析工具獲取完整洞察。</p>
                <a href="${fullAnalyzerUrl}" target="_blank" rel="noopener" class="cta-button">
                    前往完整分析工具
                </a>
            </div>
        `;

        html += '</div>';
        resultContainer.innerHTML = html;
        resultContainer.style.display = 'block';
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // 綁定 PDF 下載按鈕（頂部和底部）
        const pdfButtons = [
            document.getElementById('download-pdf-btn'),
            document.getElementById('download-pdf-btn-bottom')
        ];

        pdfButtons.forEach(pdfBtn => {
            if (pdfBtn) {
                pdfBtn.addEventListener('click', async function () {
                    const btn = this;
                    const originalText = btn.querySelector('.btn-text').textContent;

                    try {
                        btn.classList.add('pdf-generating');
                        btn.querySelector('.btn-text').textContent = '生成中...';
                        btn.disabled = true;

                        await window.PDFGenerator.generatePDF(report);

                        btn.querySelector('.btn-text').textContent = '下載完成！';
                        setTimeout(() => {
                            btn.querySelector('.btn-text').textContent = originalText;
                            btn.classList.remove('pdf-generating');
                            btn.disabled = false;
                        }, 2000);
                    } catch (error) {
                        console.error('📍[WebsiteAnalyzer] PDF 生成失敗:', error);
                        btn.querySelector('.btn-text').textContent = '生成失敗';
                        setTimeout(() => {
                            btn.querySelector('.btn-text').textContent = originalText;
                            btn.classList.remove('pdf-generating');
                            btn.disabled = false;
                        }, 2000);
                    }
                });
            }
        });

        // 綁定信箱表單事件
        const emailForm = document.getElementById('report-email-form');
        if (emailForm) {
            emailForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const email = document.getElementById('report-email-input').value;
                handleEmailSubmit(email, report);
            });
        }
    }

    /**
     * 處理信箱提交
     */
    function handleEmailSubmit(email, report) {
        const form = document.getElementById('report-email-form');
        const submitBtn = form.querySelector('.email-submit-btn');

        // 簡單驗證
        if (!email || !email.includes('@')) {
            alert('請輸入有效的 Email 地址');
            return;
        }

        // 顯示提交中狀態
        submitBtn.textContent = '發送中...';
        submitBtn.disabled = true;

        // 模擬發送（實際可接 API）
        setTimeout(() => {
            // 替換為成功訊息
            form.innerHTML = `
                <div class="email-success">
                    <span class="success-icon">✅</span>
                    <p>報告已發送至 <strong>${email}</strong></p>
                    <p class="success-hint">同時，我們會在 24 小時內與您聯繫</p>
                </div>
            `;

            // 記錄到 console（實際可發送到後端）
            console.log('📧 [Lead Capture] Email:', email, 'Website:', report.websiteUrl);
        }, 1500);
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
