/**
 * 工作流引擎 - 結果預覽模組
 * @module workflow-engine/previews
 */

const WorkflowPreviews = {
    /**
     * 創建 LINE 通知預覽
     */
    createLinePreview(content) {
        const time = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
        return `
            <div class="preview-line">
                <div class="line-header">
                    <div class="line-header-icon"><span class="preview-icon">${content.icon || 'AI'}</span></div>
                    <div class="line-header-info">
                        <h4>${content.sender || 'AI 助理'}</h4>
                        <span>官方帳號</span>
                    </div>
                </div>
                <div class="line-chat">
                    <div class="line-message">
                        <p>${content.message || '通知訊息'}</p>
                        ${content.link ? `<a class="line-link" href="#">${content.linkText || '點擊查看'}</a>` : ''}
                    </div>
                    <div class="line-time">${time}</div>
                </div>
            </div>
        `;
    },

    /**
     * 創建 Email 預覽
     */
    createEmailPreview(content) {
        return `
            <div class="preview-email">
                <div class="email-header">
                    <h4><span class="preview-icon">EMAIL</span> ${content.subject || '新郵件'}</h4>
                    <span>剛剛</span>
                </div>
                <div class="email-meta">
                    <p><strong>寄件者：</strong>${content.from || 'AI 系統'}</p>
                    <p><strong>收件者：</strong>${content.to || '所有成員'}</p>
                </div>
                <div class="email-body">
                    <p>${content.body || '郵件內容'}</p>
                </div>
            </div>
        `;
    },

    /**
     * 創建文章預覽
     */
    createArticlePreview(content) {
        return `
            <div class="preview-article">
                <div class="article-image"><span class="preview-icon">${content.icon || 'DOC'}</span></div>
                <div class="article-content">
                    <h4>${content.title || '新文章'}</h4>
                    <p>${content.excerpt || '文章摘要...'}</p>
                    <div class="article-meta">
                        <span><span class="preview-icon">TIME</span> 剛剛發布</span>
                        <span><span class="preview-icon">VIEW</span> ${content.views || '0'} 次瀏覽</span>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * 創建報告預覽
     */
    createReportPreview(content) {
        return `
            <div class="preview-report">
                <div class="report-header">
                    <h4><span class="preview-icon">CHART</span> ${content.title || '執行報告'}</h4>
                </div>
                <div class="report-stats">
                    ${(content.stats || []).map(stat => `
                        <div class="report-stat">
                            <div class="stat-value">${stat.value}</div>
                            <div class="stat-label">${stat.label}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
};

// 暴露到全域
window.WorkflowPreviews = WorkflowPreviews;
