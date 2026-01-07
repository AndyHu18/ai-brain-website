/**
 * 網站分析器 - 報告區塊渲染模組
 * @module website-analyzer/render-sections
 */

const WebsiteAnalyzerSections = {
    /**
     * 渲染服務項目區塊
     */
    renderServicesSection(services) {
        if (!services || services.length === 0) return '';
        const cards = services.map(s => `
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
    },

    /**
     * 渲染 AI 機會表格
     */
    renderOpportunitiesTable(opportunities) {
        if (!opportunities || opportunities.length === 0) return '';
        const rows = opportunities.map(o => `
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
    },

    /**
     * 渲染部門賦能區塊
     */
    renderDepartmentsSection(departments) {
        if (!departments || departments.length === 0) return '';
        const cards = departments.map(d => `
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
    },

    /**
     * 渲染職位層級區塊
     */
    renderPositionsSection(positions) {
        if (!positions || positions.length === 0) return '';
        const items = positions.map(p => `
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
    },

    /**
     * 渲染網站優化區塊
     */
    renderOptimizationsSection(optimizations) {
        if (!optimizations || optimizations.length === 0) return '';
        const items = optimizations.map(o => `
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
    },

    /**
     * 渲染銷售漏斗區塊
     */
    renderSalesFunnelSection(funnel) {
        if (!funnel || funnel.length === 0) return '';
        const stages = funnel.map((s, idx) => `
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
};

// 暴露到全域
window.WebsiteAnalyzerSections = WebsiteAnalyzerSections;
