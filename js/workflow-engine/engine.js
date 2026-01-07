/**
 * 工作流引擎 - 主引擎類別
 * @module workflow-engine/engine
 * @depends config.js, icons.js, previews.js
 */

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

        const cfg = window.WorkflowConfig;
        for (let i = 0; i < cfg.particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 15}s`;
            particle.style.animationDuration = `${10 + Math.random() * 10}s`;
            container.appendChild(particle);
        }
    }

    renderNodes() {
        const icons = window.WorkflowIcons;
        this.nodesContainer.innerHTML = '';
        this.config.nodes.forEach(node => {
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
                    <div class="node-icon">${icons[node.icon] || icons.cog}</div>
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

            this.nodesContainer.appendChild(el);
        });
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
            const fromNode = document.getElementById(`node-${conn.from}`);
            const toNode = document.getElementById(`node-${conn.to}`);
            if (!fromNode || !toNode) return;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.classList.add('connection-path');
            path.id = `path-${conn.from}-${conn.to}`;
            path.setAttribute('d', this.calculatePathD(fromNode, toNode));
            this.connectionsSvg.appendChild(path);
        });
    }

    calculatePathD(fromEl, toEl) {
        const fromX = parseInt(fromEl.style.left) || 0;
        const fromY = parseInt(fromEl.style.top) || 0;
        const toX = parseInt(toEl.style.left) || 0;
        const toY = parseInt(toEl.style.top) || 0;

        const nodeWidth = 180;
        const nodeHeight = 140;

        const startX = fromX + nodeWidth;
        const startY = fromY + nodeHeight / 2;
        const endX = toX;
        const endY = toY + nodeHeight / 2;

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
        const cfg = window.WorkflowConfig;
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

        const execTime = cfg.nodeExecutionDelay / cfg.animationSpeed;
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
        const cfg = window.WorkflowConfig;
        const messageEl = bubbleEl.querySelector('.bubble-message');
        const progressBar = bubbleEl.querySelector('.bubble-progress-bar');

        bubbleEl.classList.add('visible');
        progressBar.style.animation = 'none';
        progressBar.offsetHeight;
        progressBar.style.animation = 'progress-fill 4s ease-out forwards';

        let currentIndex = 0;
        const intervalTime = cfg.nodeExecutionDelay / messages.length;

        messageEl.textContent = messages[0];
        messageEl.classList.add('typing-effect');

        const carouselInterval = setInterval(() => {
            currentIndex++;
            if (currentIndex < messages.length) {
                messageEl.classList.remove('typing-effect');
                messageEl.offsetHeight;
                messageEl.textContent = messages[currentIndex];
                messageEl.classList.add('typing-effect');

                if (currentIndex === messages.length - 1) {
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

        if (this.config.resultPreview) {
            this.showResultPreview();
        }
    }

    showResultPreview() {
        const previews = window.WorkflowPreviews;
        const preview = this.config.resultPreview;
        const lastNodeId = this.config.executionOrder[this.config.executionOrder.length - 1];
        const actualLastId = Array.isArray(lastNodeId) ? lastNodeId[0] : lastNodeId;
        const lastNodeEl = document.getElementById(`node-${actualLastId}`);

        if (!lastNodeEl) return;

        const existingPreview = document.querySelector('.result-preview');
        if (existingPreview) existingPreview.remove();

        let previewHtml = '';
        switch (preview.type) {
            case 'line': previewHtml = previews.createLinePreview(preview.content); break;
            case 'email': previewHtml = previews.createEmailPreview(preview.content); break;
            case 'article': previewHtml = previews.createArticlePreview(preview.content); break;
            case 'report': previewHtml = previews.createReportPreview(preview.content); break;
        }

        const previewEl = document.createElement('div');
        previewEl.className = 'result-preview';
        previewEl.innerHTML = previewHtml;
        lastNodeEl.appendChild(previewEl);

        setTimeout(() => previewEl.classList.add('visible'), 300);
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

        const resultPreview = document.querySelector('.result-preview');
        if (resultPreview) resultPreview.remove();

        this.updateStatus('等待啟動', 'idle');
        this.updateProgress();
        this.timeEl.textContent = '0.00s';

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

// 暴露到全域
window.WorkflowEngine = WorkflowEngine;
