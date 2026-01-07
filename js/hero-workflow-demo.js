/**
 * @file    : js/hero-workflow-demo.js
 * @purpose : Hero Section 自動流量小編工作流程動畫（完整版 v2.0）
 * @version : 2.0
 * @lines   : ~240
 */

class HeroWorkflowDemo {
    constructor() {
        this.container = document.getElementById('hero-workflow-canvas');
        this.nodesContainer = document.getElementById('hero-nodes-container');
        this.connectionsSvg = document.getElementById('hero-connections-svg');

        if (!this.container || !this.nodesContainer) {
            console.log('📍[HeroWorkflow] Container not found, skipping init');
            return;
        }

        // 自動流量小編的 5 個節點
        this.nodes = [
            { id: 'scan', emoji: '🔍', title: '熱點掃描', color: '#E67E22' },
            { id: 'analyze', emoji: '📊', title: '關鍵字分析', color: '#9B59B6' },
            { id: 'write', emoji: '✍️', title: 'AI 寫文章', color: '#3498DB' },
            { id: 'publish', emoji: '📤', title: '自動發布', color: '#27AE60' },
            { id: 'notify', emoji: '📱', title: 'LINE 通知', color: '#00B900' }
        ];

        this.currentStep = -1;
        this.isRunning = false;
        this.particles = [];

        this.init();
    }

    init() {
        this.renderNodes();
        this.renderResultPreview();
        // 延遲渲染連接線（等待 DOM 佈局完成）
        requestAnimationFrame(() => {
            setTimeout(() => {
                this.renderConnections();
                // 延遲 1.5 秒後自動啟動動畫
                setTimeout(() => this.startAnimation(), 1500);
            }, 200);
        });
    }



    renderNodes() {
        this.nodesContainer.innerHTML = this.nodes.map((node, index) => `
            <div class="hero-node idle" id="hero-node-${node.id}" style="--node-color: ${node.color}">
                <div class="hero-node-icon">${node.emoji}</div>
                <div class="hero-node-title">${node.title}</div>
                <div class="hero-node-status">
                    <span class="hero-node-status-dot"></span>
                    <span class="hero-node-status-text">等待中</span>
                </div>
            </div>
        `).join('');
    }

    renderResultPreview() {
        // 建立末端結果預覽區（LINE 通知成功）
        const preview = document.createElement('div');
        preview.className = 'hero-result-preview';
        preview.id = 'hero-result-preview';
        preview.innerHTML = `
            <div class="hero-result-icon">✅</div>
            <div class="hero-result-content">
                <h4>文章發布成功！</h4>
                <p>已自動通知至 LINE 群組</p>
            </div>
        `;
        this.container.appendChild(preview);
    }

    renderConnections() {
        if (!this.connectionsSvg) return;

        // 取得容器尺寸
        const containerRect = this.container.getBoundingClientRect();

        // 建立 SVG 內容，包含漸層定義和連接線
        let svgContent = `
            <defs>
                <linearGradient id="hero-gradient-active" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#E67E22"/>
                    <stop offset="50%" stop-color="#F39C12"/>
                    <stop offset="100%" stop-color="#27AE60"/>
                </linearGradient>
            </defs>
        `;

        // 繪製每個節點之間的連接線
        for (let i = 0; i < this.nodes.length - 1; i++) {
            const fromNode = document.getElementById(`hero-node-${this.nodes[i].id}`);
            const toNode = document.getElementById(`hero-node-${this.nodes[i + 1].id}`);

            if (fromNode && toNode) {
                const fromRect = fromNode.getBoundingClientRect();
                const toRect = toNode.getBoundingClientRect();

                // 計算相對於 SVG 容器的座標
                const startX = fromRect.right - containerRect.left;
                const startY = fromRect.top + fromRect.height / 2 - containerRect.top;
                const endX = toRect.left - containerRect.left;
                const endY = toRect.top + toRect.height / 2 - containerRect.top;

                // 貝塞爾曲線控制點
                const midX = (startX + endX) / 2;

                // 建立連接線路徑
                const pathD = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

                svgContent += `<path class="hero-connection-path" id="hero-path-${i}" d="${pathD}"/>`;

                console.log(`📍[HeroWorkflow] 連接線 ${i}: (${startX.toFixed(0)}, ${startY.toFixed(0)}) -> (${endX.toFixed(0)}, ${endY.toFixed(0)})`);
            }
        }

        this.connectionsSvg.innerHTML = svgContent;
        console.log('📍[HeroWorkflow] 連接線渲染完成');
    }

    async startAnimation() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log('📍[HeroWorkflow] 動畫啟動');

        // 隱藏結果預覽
        this.hideResultPreview();

        // 依序執行每個節點
        for (let i = 0; i < this.nodes.length; i++) {
            await this.executeNode(i);
        }

        // 顯示最終結果預覽
        this.showResultPreview();

        // 動畫完成後重置並重新開始（無限循環）
        setTimeout(() => {
            this.resetAndRestart();
        }, 3500);
    }

    async executeNode(index) {
        const node = this.nodes[index];
        const nodeEl = document.getElementById(`hero-node-${node.id}`);
        const prevPathEl = document.getElementById(`hero-path-${index - 1}`);
        const currentPathEl = document.getElementById(`hero-path-${index}`);

        // 設為執行中狀態
        nodeEl.classList.remove('idle', 'completed');
        nodeEl.classList.add('running');
        nodeEl.querySelector('.hero-node-status-text').textContent = '執行中';

        // 前一條連接線設為完成狀態
        if (prevPathEl) {
            prevPathEl.classList.remove('active');
            prevPathEl.classList.add('completed');
        }

        // 當前節點到下一節點的連接線開始資料傳送動畫
        if (currentPathEl) {
            currentPathEl.classList.add('active');
        }

        // 等待執行時間
        await this.delay(1200);

        // 設為完成狀態
        nodeEl.classList.remove('running');
        nodeEl.classList.add('completed');
        nodeEl.querySelector('.hero-node-status-text').textContent = '已完成';
    }

    showResultPreview() {
        const preview = document.getElementById('hero-result-preview');
        if (preview) {
            preview.classList.add('visible');
        }
    }

    hideResultPreview() {
        const preview = document.getElementById('hero-result-preview');
        if (preview) {
            preview.classList.remove('visible');
        }
    }

    resetAndRestart() {
        console.log('📍[HeroWorkflow] 重置動畫');

        // 隱藏結果預覽
        this.hideResultPreview();

        // 重置所有節點
        this.nodes.forEach(node => {
            const nodeEl = document.getElementById(`hero-node-${node.id}`);
            if (nodeEl) {
                nodeEl.classList.remove('running', 'completed');
                nodeEl.classList.add('idle');
                nodeEl.querySelector('.hero-node-status-text').textContent = '等待中';
            }
        });

        // 重置所有連接線
        for (let i = 0; i < this.nodes.length - 1; i++) {
            const pathEl = document.getElementById(`hero-path-${i}`);
            if (pathEl) {
                pathEl.classList.remove('active', 'completed');
            }
        }

        this.isRunning = false;
        this.currentStep = -1;

        // 延遲後重新開始
        setTimeout(() => this.startAnimation(), 2000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 頁面載入後初始化
document.addEventListener('DOMContentLoaded', () => {
    window.heroWorkflowDemo = new HeroWorkflowDemo();
});

// 視窗調整大小時重新渲染連接線
window.addEventListener('resize', () => {
    if (window.heroWorkflowDemo && window.heroWorkflowDemo.renderConnections) {
        // 使用防抖動
        clearTimeout(window.heroWorkflowResizeTimer);
        window.heroWorkflowResizeTimer = setTimeout(() => {
            window.heroWorkflowDemo.renderConnections();
        }, 250);
    }
});
