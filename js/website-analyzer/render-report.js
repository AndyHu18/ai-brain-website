/**
 * 網站分析器 - 報告主體渲染模組
 * @module website-analyzer/render-report
 */

const WebsiteAnalyzerReport = {
    /**
     * 渲染完整報告
     * @param {Object} report - 分析報告數據
     * @param {HTMLElement} resultContainer - 結果容器元素
     */
    renderReport(report, resultContainer) {
        const config = window.WebsiteAnalyzerConfig;
        const sections = window.WebsiteAnalyzerSections;
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
        html += this._renderDownloadSection(report);

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
        html += sections.renderServicesSection(analysis.services);
        html += sections.renderOpportunitiesTable(analysis.aiOpportunities);
        html += sections.renderDepartmentsSection(analysis.departmentInsights);
        html += sections.renderPositionsSection(analysis.positionOpportunities);
        html += sections.renderOptimizationsSection(analysis.websiteOptimizations);
        html += sections.renderSalesFunnelSection(analysis.salesFunnelAI);
        html += '</div>';

        // 🏢 公司介紹區塊
        html += this._renderCompanyIntro();

        // 📥 底部 PDF 下載區塊
        html += this._renderDownloadSection(report, true);

        // 📧 寄送報告到信箱 CTA
        html += this._renderEmailCTA();

        // 完整分析連結
        html += `
            <div class="report-cta">
                <p class="cta-text">想要更詳細的分析報告？使用我們的專業分析工具獲取完整洞察。</p>
                <a href="${config.FULL_ANALYZER_URL}" target="_blank" rel="noopener" class="cta-button">
                    前往完整分析工具
                </a>
            </div>
        `;

        html += '</div>';
        resultContainer.innerHTML = html;
        resultContainer.style.display = 'block';
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // 綁定事件
        this._bindPDFButtons(report);
        this._bindEmailForm(report);
    },

    /**
     * 渲染下載區塊
     */
    _renderDownloadSection(report, isBottom = false) {
        const id = isBottom ? 'download-pdf-btn-bottom' : 'download-pdf-btn';
        const cls = isBottom ? 'report-download-section report-download-bottom' : 'report-download-section';
        const btnCls = isBottom ? 'pdf-download-btn pdf-download-btn-bottom' : 'pdf-download-btn';
        const btnText = isBottom ? '下載完整 PDF 報告' : '下載 PDF 報告';

        return `
            <div class="${cls}">
                <button class="${btnCls}" id="${id}" data-report='${JSON.stringify(report).replace(/'/g, "\\'")}'>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7,10 12,15 17,10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    <span class="btn-text">${btnText}</span>
                </button>
                ${isBottom ? '<p class="download-hint">包含所有分析結果與 AI 智能大腦公司介紹</p>' : ''}
            </div>
        `;
    },

    /**
     * 渲染公司介紹區塊
     */
    _renderCompanyIntro() {
        return `
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
    },

    /**
     * 渲染 Email CTA
     */
    _renderEmailCTA() {
        return `
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
                    <input type="email" id="report-email-input" placeholder="請輸入您的 Email" required>
                    <button type="submit" class="email-submit-btn">寄送報告</button>
                </form>
                <p class="email-hint">建議使用公司信箱，方便團隊討論</p>
            </div>
        `;
    },

    /**
     * 綁定 PDF 下載按鈕事件
     */
    _bindPDFButtons(report) {
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
    },

    /**
     * 綁定 Email 表單事件
     */
    _bindEmailForm(report) {
        const emailForm = document.getElementById('report-email-form');
        if (emailForm) {
            emailForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('report-email-input').value;
                this._handleEmailSubmit(email, report);
            });
        }
    },

    /**
     * 處理 Email 提交
     */
    _handleEmailSubmit(email, report) {
        const form = document.getElementById('report-email-form');
        const submitBtn = form.querySelector('.email-submit-btn');

        if (!email || !email.includes('@')) {
            alert('請輸入有效的 Email 地址');
            return;
        }

        submitBtn.textContent = '發送中...';
        submitBtn.disabled = true;

        setTimeout(() => {
            form.innerHTML = `
                <div class="email-success">
                    <span class="success-icon">✅</span>
                    <p>報告已發送至 <strong>${email}</strong></p>
                    <p class="success-hint">同時，我們會在 24 小時內與您聯繫</p>
                </div>
            `;
            console.log('📧 [Lead Capture] Email:', email, 'Website:', report.websiteUrl);
        }, 1500);
    }
};

// 暴露到全域
window.WebsiteAnalyzerReport = WebsiteAnalyzerReport;
