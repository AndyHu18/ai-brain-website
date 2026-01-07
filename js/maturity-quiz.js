/**
 * AI 成熟度測驗系統 (AI Maturity Quiz)
 * Alex Hormozi 價值階梯策略
 * 
 * 功能：
 * - 5 題快速測驗
 * - 即時評分邏輯
 * - 根據分數推薦服務
 * 
 * @module maturity-quiz
 * @version 1.0.0
 */

(function () {
    'use strict';

    const MaturityQuiz = {
        // 問題配置
        questions: [
            {
                id: 1,
                question: '您的團隊目前使用 AI 工具的情況？',
                options: [
                    { text: '完全沒用過', score: 1 },
                    { text: '用過基礎 AI 工具', score: 2 },
                    { text: '有導入 1-2 個 AI 流程', score: 3 },
                    { text: '多個流程已 AI 自動化', score: 4 }
                ]
            },
            {
                id: 2,
                question: '每週花多少時間在「重複性工作」上？',
                options: [
                    { text: '超過 20 小時', score: 4 },
                    { text: '10-20 小時', score: 3 },
                    { text: '5-10 小時', score: 2 },
                    { text: '少於 5 小時', score: 1 }
                ]
            },
            {
                id: 3,
                question: '是否有專人負責 AI 或數位轉型？',
                options: [
                    { text: '沒有，也不知道從何開始', score: 1 },
                    { text: '沒有，但老闆有興趣', score: 2 },
                    { text: '有，但還在摸索', score: 3 },
                    { text: '有專人或專案團隊', score: 4 }
                ]
            },
            {
                id: 4,
                question: '貴公司對 AI 的預算規劃？',
                options: [
                    { text: '沒有預算', score: 1 },
                    { text: '每月 NT$10,000 以下', score: 2 },
                    { text: '每月 NT$10,000-50,000', score: 3 },
                    { text: '每月 NT$50,000 以上', score: 4 }
                ]
            },
            {
                id: 5,
                question: '最想解決的問題是？',
                options: [
                    { text: '客服/電話接聽', score: 0, tag: 'voice' },
                    { text: '內容產出/SEO', score: 0, tag: 'content' },
                    { text: '社群經營', score: 0, tag: 'brand' },
                    { text: '整體數位轉型', score: 0, tag: 'consultant' }
                ]
            }
        ],

        // 結果配置（使用 SVG icon 取代 emoji）
        results: {
            beginner: {
                title: '探索新手',
                icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="9" r="1.5" fill="currentColor"/><circle cx="15" cy="9" r="1.5" fill="currentColor"/></svg>',
                headline: '您的 AI 旅程即將開始',
                painPoint: '我們理解您可能正面臨：團隊對 AI 既期待又擔憂、不知道從哪裡開始、害怕投資後看不到回報。',
                insight: '好消息是，超過 78% 的企業都是從您現在的位置起步的。最聰明的做法是：先找一個低風險、高回報的切入點。',
                recommendation: '客服機器人',
                link: 'pages/service-chatbot.html',
                reason: '它能在 7 天內上線、不需要改變現有流程、立即減少 40% 重複問答工作',
                range: [4, 8]
            },
            explorer: {
                title: '積極探索者',
                icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>',
                headline: '您已經邁出關鍵第一步',
                painPoint: '您可能已經感受到：AI 工具用了但效果有限、團隊各自為政缺乏整合、想擴大應用但不知如何規模化。',
                insight: '根據您的回答，您每週有 10+ 小時花在重複性工作。若能自動化其中 60%，一年可省下 300+ 小時，相當於多出 1.5 個月的產能。',
                recommendation: '自動流量小編',
                link: 'pages/service-content-editor.html',
                reason: '它能自動生產品牌內容、一鍵發布多平台、讓內容產出從 3 天縮短到 30 分鐘',
                range: [9, 12]
            },
            adopter: {
                title: '數位先驅',
                icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
                headline: '您已準備好全面升級',
                painPoint: '到了這個階段，您面對的挑戰是：如何讓各個 AI 工具協同運作、如何評估 ROI、如何建立可持續的 AI 文化。',
                insight: '您的成熟度已超越 85% 的台灣中小企業。此時最關鍵的不是「要不要做」，而是「做對的順序」。一個錯誤的優先級可能浪費 3-6 個月。',
                recommendation: 'AI 顧問諮詢',
                link: 'pages/service-consultant.html',
                reason: '我們會為您量身打造 AI 導入路線圖，確保每一分投資都花在刀口上',
                range: [13, 16]
            }
        },

        // 狀態
        currentQuestion: 0,
        answers: [],
        totalScore: 0,
        selectedTag: null,

        /**
         * 初始化測驗
         */
        init: function (containerId) {
            this.container = document.getElementById(containerId);
            if (!this.container) return;

            this.renderQuestion(0);
            console.log('📍[MaturityQuiz] 成熟度測驗已初始化');
        },

        /**
         * 渲染問題
         */
        renderQuestion: function (index) {
            const q = this.questions[index];
            const progress = ((index) / this.questions.length * 100).toFixed(0);

            let html = `
                <div class="quiz-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span class="progress-text">${index + 1} / ${this.questions.length}</span>
                </div>
                <div class="quiz-question">
                    <h3>${q.question}</h3>
                    <div class="quiz-options">
            `;

            q.options.forEach((opt, i) => {
                html += `
                    <button class="quiz-option" onclick="MaturityQuiz.selectOption(${index}, ${i})">
                        ${opt.text}
                    </button>
                `;
            });

            html += `
                    </div>
                </div>
            `;

            this.container.innerHTML = html;
        },

        /**
         * 選擇選項
         */
        selectOption: function (qIndex, optIndex) {
            const question = this.questions[qIndex];
            const option = question.options[optIndex];

            this.answers[qIndex] = option;
            this.totalScore += option.score || 0;

            // 記錄標籤（最後一題用於推薦）
            if (option.tag) {
                this.selectedTag = option.tag;
            }

            // 視覺反饋
            const buttons = this.container.querySelectorAll('.quiz-option');
            buttons.forEach((btn, i) => {
                btn.classList.remove('selected');
                if (i === optIndex) {
                    btn.classList.add('selected');
                }
            });

            // 延遲進入下一題
            setTimeout(() => {
                if (qIndex < this.questions.length - 1) {
                    this.currentQuestion++;
                    this.renderQuestion(this.currentQuestion);
                } else {
                    this.showResult();
                }
            }, 300);
        },

        /**
         * 顯示結果
         */
        showResult: function () {
            let result = this.results.beginner;

            for (const key in this.results) {
                const r = this.results[key];
                if (this.totalScore >= r.range[0] && this.totalScore <= r.range[1]) {
                    result = r;
                    break;
                }
            }

            // 根據最後一題調整推薦
            let recommendedLink = result.link;
            let recommendedName = result.recommendation;
            let recommendedReason = result.reason;

            if (this.selectedTag === 'voice') {
                recommendedLink = 'pages/service-voice-receptionist.html';
                recommendedName = '智慧接線生';
                recommendedReason = '24 小時自動接聽、智慧轉接、不漏接任何商機';
            } else if (this.selectedTag === 'content') {
                recommendedLink = 'pages/service-content-editor.html';
                recommendedName = '自動流量小編';
                recommendedReason = '一鍵生成品牌文案、自動發布多平台、節省 80% 內容產出時間';
            } else if (this.selectedTag === 'brand') {
                recommendedLink = 'pages/service-brand-clone.html';
                recommendedName = '品牌分身術';
                recommendedReason = '複製您的專業知識、讓 AI 以您的風格對話、擴大影響力';
            } else if (this.selectedTag === 'consultant') {
                recommendedLink = 'pages/service-consultant.html';
                recommendedName = 'AI 顧問';
                recommendedReason = '量身打造 AI 導入路線圖、評估優先順序、確保投資回報';
            }

            // 生成探索更多連結
            let exploreMoreHTML = '';
            if (result.exploreMore && result.exploreMore.length > 0) {
                exploreMoreHTML = `
                    <div class="result-explore-more">
                        <p class="explore-title">您可能也感興趣：</p>
                        <div class="explore-links">
                            ${result.exploreMore.map(item => `
                                <a href="${item.link}" class="explore-link">
                                    <span class="explore-link-name">${item.name}</span>
                                    <span class="explore-link-desc">${item.desc}</span>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            const html = `
                <div class="quiz-result">
                    <div class="result-badge">
                        <span class="result-icon">${result.icon}</span>
                        <span class="result-title">${result.title}</span>
                    </div>
                    
                    <h3 class="result-headline">${result.headline}</h3>
                    
                    <div class="result-score">
                        <span>AI 成熟度分數</span>
                        <strong>${this.totalScore}/16</strong>
                    </div>
                    
                    <div class="result-insights">
                        <div class="insight-block insight-pain">
                            <p>${result.painPoint}</p>
                        </div>
                        <div class="insight-block insight-data">
                            <p>${result.insight}</p>
                        </div>
                    </div>
                    
                    <div class="result-recommendation">
                        <p class="rec-intro">根據您的需求，我們為您推薦：</p>
                        <a href="${recommendedLink}" class="btn btn-primary">
                            了解「${recommendedName}」
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </a>
                        <p class="rec-reason">${recommendedReason}</p>
                    </div>
                    
                    ${exploreMoreHTML}
                    
                    <button class="quiz-restart" onclick="MaturityQuiz.restart()">
                        重新測驗
                    </button>
                </div>
            `;

            this.container.innerHTML = html;
        },

        /**
         * 重新開始
         */
        restart: function () {
            this.currentQuestion = 0;
            this.answers = [];
            this.totalScore = 0;
            this.selectedTag = null;
            this.renderQuestion(0);
        }
    };

    // 暴露到全域
    window.MaturityQuiz = MaturityQuiz;
})();
