/**
 * AI 服務方案 - 通用工作流程引擎
 * 支援各服務頁面的 n8n 風格視覺化
 */

const CONFIG = {
    nodeExecutionDelay: 4000,
    particleCount: 25,
    animationSpeed: 1
};

// 通用 SVG 圖標
const ICONS = {
    search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
    </svg>`,
    target: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>`,
    write: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>`,
    upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>`,
    notify: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>`,
    phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>`,
    mic: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
    </svg>`,
    brain: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>
    </svg>`,
    calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>`,
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>`,
    speaker: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>`,
    book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>`,
    image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
    </svg>`,
    share: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>`,
    message: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>`,
    heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>`,
    send: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>`,
    text: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>
    </svg>`,
    todo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>`,
    email: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
    </svg>`,
    scan: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/>
    </svg>`,
    blueprint: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
    </svg>`,
    cog: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>`,
    team: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>`,
    chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>`
};

class WorkflowEngine {
    constructor(config) {
        this.config = config;
        this.nodesContainer = document.getElementById('nodes-container');
        this.connectionsSvg = document.getElementById('connections-svg');
        this.logContent = document.getElementById('log-content');
        this.statusEl = document.getElementById('workflow-status');
        this.progressEl = document.getElementById('workflow-progress');
        this.timeEl = document.getElementById('workflow-time');

        this.isRunning = false;
        this.startTime = 0;
        this.timerInterval = null;
        this.completedNodes = new Set();

        this.init();
    }

    init() {
        this.createParticles();
        this.renderNodes();
        this.renderConnections();
        this.bindEvents();
    }

    createParticles() {
        const container = document.getElementById('particles');
        if (!container) return;

        for (let i = 0; i < CONFIG.particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 15}s`;
            particle.style.animationDuration = `${10 + Math.random() * 10}s`;
            container.appendChild(particle);
        }
    }

    renderNodes() {
        this.nodesContainer.innerHTML = '';
        this.config.nodes.forEach(node => {
            const nodeEl = this.createNodeElement(node);
            this.nodesContainer.appendChild(nodeEl);
        });
    }

    createNodeElement(node) {
        const el = document.createElement('div');
        el.className = 'node idle';
        el.id = `node-${node.id}`;
        el.style.left = `${node.position.x}px`;
        el.style.top = `${node.position.y}px`;
        el.style.setProperty('--node-color', node.color);

        el.innerHTML = `
            <div class="node-bubble" id="bubble-${node.id}">
                <div class="bubble-content">
                    <div class="bubble-title">執行中</div>
                    <div class="bubble-message"></div>
                    <div class="bubble-progress"><div class="bubble-progress-bar"></div></div>
                </div>
            </div>
            <div class="node-port input"></div>
            <div class="node-header">
                <div class="node-icon">${ICONS[node.icon] || ICONS.cog}</div>
                <div class="node-title">${node.title}</div>
            </div>
            <div class="node-body">
                <p class="node-description">${node.description}</p>
            </div>
            <div class="node-footer">
                <div class="node-status">
                    <span class="status-indicator"></span>
                    <span class="status-text">等待中</span>
                </div>
                <span class="node-time">--</span>
            </div>
            <div class="node-port output"></div>
        `;

        return el;
    }

    renderConnections() {
        this.connectionsSvg.innerHTML = `
            <defs>
                <linearGradient id="connection-gradient-active" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#E67E22"/>
                    <stop offset="100%" stop-color="#27AE60"/>
                </linearGradient>
            </defs>
        `;

        this.config.connections.forEach(conn => {
            const path = this.createConnectionPath(conn);
            if (path) this.connectionsSvg.appendChild(path);
        });
    }

    createConnectionPath(conn) {
        const fromNode = document.getElementById(`node-${conn.from}`);
        const toNode = document.getElementById(`node-${conn.to}`);
        if (!fromNode || !toNode) return null;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.classList.add('connection-path');
        path.id = `path-${conn.from}-${conn.to}`;
        path.setAttribute('d', this.calculatePathD(fromNode, toNode));
        return path;
    }

    calculatePathD(fromEl, toEl) {
        // 使用節點的 CSS position 屬性計算
        const fromX = parseInt(fromEl.style.left) || 0;
        const fromY = parseInt(fromEl.style.top) || 0;
        const toX = parseInt(toEl.style.left) || 0;
        const toY = parseInt(toEl.style.top) || 0;

        const nodeWidth = 180;  // 節點寬度
        const nodeHeight = 140; // 節點高度

        // 起點：節點右側中間
        const startX = fromX + nodeWidth;
        const startY = fromY + nodeHeight / 2;

        // 終點：節點左側中間
        const endX = toX;
        const endY = toY + nodeHeight / 2;

        // 貝塞爾曲線控制點
        const cp1x = startX + (endX - startX) * 0.4;
        const cp2x = startX + (endX - startX) * 0.6;

        return `M ${startX} ${startY} C ${cp1x} ${startY}, ${cp2x} ${endY}, ${endX} ${endY}`;
    }

    bindEvents() {
        document.getElementById('btn-start').addEventListener('click', () => this.start());
        document.getElementById('btn-reset').addEventListener('click', () => this.reset());
    }

    async start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.startTime = Date.now();
        this.completedNodes.clear();

        // 隱藏啟動按鈕
        const startNodeBtn = document.getElementById('start-node-btn');
        if (startNodeBtn) startNodeBtn.style.display = 'none';

        this.updateStatus('執行中', 'running');
        this.startTimer();
        this.addLog(`[START] ${this.config.name} 流程啟動`, 'running');

        try {
            for (let i = 0; i < this.config.executionOrder.length; i++) {
                const step = this.config.executionOrder[i];
                if (Array.isArray(step)) {
                    await Promise.all(step.map(nodeId => this.executeNode(nodeId)));
                } else {
                    await this.executeNode(step);
                }
                this.updateProgress();
            }
            this.complete();
        } catch (error) {
            this.addLog(`[ERROR] 錯誤: ${error.message}`, 'error');
            this.updateStatus('執行失敗', 'error');
        }
    }

    async executeNode(nodeId) {
        const nodeEl = document.getElementById(`node-${nodeId}`);
        const nodeData = this.config.nodes.find(n => n.id === nodeId);
        if (!nodeEl || !nodeData) return;

        nodeEl.classList.remove('idle');
        nodeEl.classList.add('running');
        nodeEl.querySelector('.status-text').textContent = '執行中';

        this.activateIncomingConnections(nodeId);

        const bubbleEl = document.getElementById(`bubble-${nodeId}`);
        if (bubbleEl && nodeData.bubbleMessages) {
            this.showBubble(bubbleEl, nodeData.bubbleMessages);
        }

        this.addLog(`[EXEC] 執行: ${nodeData.title}`, 'running');

        const execTime = CONFIG.nodeExecutionDelay / CONFIG.animationSpeed;
        const startMs = Date.now();
        await this.delay(execTime);
        const duration = ((Date.now() - startMs) / 1000).toFixed(2);

        if (bubbleEl) this.hideBubble(bubbleEl);

        nodeEl.classList.remove('running');
        nodeEl.classList.add('completed');
        nodeEl.querySelector('.status-text').textContent = '已完成';
        nodeEl.querySelector('.node-time').textContent = `${duration}s`;

        this.completeIncomingConnections(nodeId);
        this.completedNodes.add(nodeId);
        this.addLog(`[DONE] 完成: ${nodeData.title} (${duration}s)`, 'success');
    }

    showBubble(bubbleEl, messages) {
        const messageEl = bubbleEl.querySelector('.bubble-message');
        const progressBar = bubbleEl.querySelector('.bubble-progress-bar');

        bubbleEl.classList.add('visible');
        progressBar.style.animation = 'none';
        progressBar.offsetHeight;
        progressBar.style.animation = 'progress-fill 4s ease-out forwards';

        let currentIndex = 0;
        const totalMessages = messages.length;
        const intervalTime = CONFIG.nodeExecutionDelay / totalMessages;

        messageEl.textContent = messages[0];
        messageEl.classList.add('typing-effect');

        const carouselInterval = setInterval(() => {
            currentIndex++;
            if (currentIndex < totalMessages) {
                messageEl.classList.remove('typing-effect');
                messageEl.offsetHeight;
                messageEl.textContent = messages[currentIndex];
                messageEl.classList.add('typing-effect');

                if (currentIndex === totalMessages - 1) {
                    bubbleEl.querySelector('.bubble-title').textContent = '完成';
                }
            } else {
                clearInterval(carouselInterval);
            }
        }, intervalTime);

        bubbleEl.dataset.carouselInterval = carouselInterval;
    }

    hideBubble(bubbleEl) {
        if (bubbleEl.dataset.carouselInterval) {
            clearInterval(parseInt(bubbleEl.dataset.carouselInterval));
        }
        setTimeout(() => {
            bubbleEl.classList.remove('visible');
            bubbleEl.querySelector('.bubble-title').textContent = '執行中';
        }, 300);
    }

    activateIncomingConnections(nodeId) {
        this.config.connections.filter(c => c.to === nodeId).forEach(conn => {
            const path = document.getElementById(`path-${conn.from}-${conn.to}`);
            if (path && this.completedNodes.has(conn.from)) {
                path.classList.add('active');
            }
        });
    }

    completeIncomingConnections(nodeId) {
        this.config.connections.filter(c => c.to === nodeId).forEach(conn => {
            const path = document.getElementById(`path-${conn.from}-${conn.to}`);
            if (path) {
                path.classList.remove('active');
                path.classList.add('completed');
            }
        });
    }

    complete() {
        this.isRunning = false;
        this.stopTimer();
        this.updateStatus('流程完成', 'success');
        this.addLog(`[SUCCESS] ${this.config.name} 流程展示完成！`, 'success');

        // 顯示結果預覽
        if (this.config.resultPreview) {
            this.showResultPreview();
        }
    }

    showResultPreview() {
        const preview = this.config.resultPreview;
        const lastNodeId = this.config.executionOrder[this.config.executionOrder.length - 1];
        const actualLastId = Array.isArray(lastNodeId) ? lastNodeId[0] : lastNodeId;
        const lastNodeEl = document.getElementById(`node-${actualLastId}`);

        if (!lastNodeEl) return;

        // 移除已有的預覽
        const existingPreview = document.querySelector('.result-preview');
        if (existingPreview) existingPreview.remove();

        // 創建預覽 HTML
        let previewHtml = '';

        switch (preview.type) {
            case 'line':
                previewHtml = this.createLinePreview(preview.content);
                break;
            case 'email':
                previewHtml = this.createEmailPreview(preview.content);
                break;
            case 'article':
                previewHtml = this.createArticlePreview(preview.content);
                break;
            case 'report':
                previewHtml = this.createReportPreview(preview.content);
                break;
        }

        // 插入預覽元素
        const previewEl = document.createElement('div');
        previewEl.className = 'result-preview';
        previewEl.innerHTML = previewHtml;
        lastNodeEl.appendChild(previewEl);

        // 延遲顯示動畫
        setTimeout(() => {
            previewEl.classList.add('visible');
        }, 300);
    }

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
    }

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
    }

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
    }

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

    reset() {
        this.isRunning = false;
        this.stopTimer();
        this.completedNodes.clear();

        document.querySelectorAll('.node').forEach(el => {
            el.classList.remove('running', 'completed');
            el.classList.add('idle');
            el.querySelector('.status-text').textContent = '等待中';
            el.querySelector('.node-time').textContent = '--';

            const bubble = el.querySelector('.node-bubble');
            if (bubble) {
                bubble.classList.remove('visible');
                if (bubble.dataset.carouselInterval) {
                    clearInterval(parseInt(bubble.dataset.carouselInterval));
                }
            }
        });

        document.querySelectorAll('.connection-path').forEach(path => {
            path.classList.remove('active', 'completed');
        });

        // 移除結果預覽
        const resultPreview = document.querySelector('.result-preview');
        if (resultPreview) resultPreview.remove();

        this.updateStatus('等待啟動', 'idle');
        this.updateProgress();
        this.timeEl.textContent = '0.00s';

        // 顯示啟動按鈕
        const startNodeBtn = document.getElementById('start-node-btn');
        if (startNodeBtn) startNodeBtn.style.display = 'block';

        this.logContent.innerHTML = `
            <div class="log-entry info">
                <span class="log-time">${this.getTime()}</span>
                <span class="log-msg">${this.config.name}就緒，點擊「啟動流程」開始...</span>
            </div>
        `;
    }

    updateStatus(text, type) {
        this.statusEl.textContent = text;
        document.querySelector('.status-dot').className = `status-dot ${type}`;
    }

    updateProgress() {
        const total = this.config.nodes.length;
        const completed = this.completedNodes.size;
        this.progressEl.textContent = `${completed} / ${total}`;
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = (Date.now() - this.startTime) / 1000;
            this.timeEl.textContent = `${elapsed.toFixed(2)}s`;
        }, 50);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    addLog(message, type = 'info') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.innerHTML = `<span class="log-time">${this.getTime()}</span><span class="log-msg">${message}</span>`;
        this.logContent.appendChild(entry);
        this.logContent.scrollTop = this.logContent.scrollHeight;
    }

    getTime() {
        return new Date().toTimeString().split(' ')[0];
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    if (typeof SERVICE_CONFIG !== 'undefined') {
        window.workflowEngine = new WorkflowEngine(SERVICE_CONFIG);
    }
});
