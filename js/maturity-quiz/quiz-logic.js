/**
 * AI 成熟度測驗 - 核心邏輯
 * @module maturity-quiz/quiz-logic
 * @version 2.0.0
 */

const QuizLogic = {
    // 狀態
    currentQuestion: 0,
    answers: [],
    totalScore: 0,
    selectedTag: null,
    container: null,

    /**
     * 渲染問題
     */
    renderQuestion: function (index) {
        const q = QUIZ_QUESTIONS[index];
        const progress = ((index) / QUIZ_QUESTIONS.length * 100).toFixed(0);

        let html = `
            <div class="quiz-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <span class="progress-text">${index + 1} / ${QUIZ_QUESTIONS.length}</span>
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
        const question = QUIZ_QUESTIONS[qIndex];
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
            if (qIndex < QUIZ_QUESTIONS.length - 1) {
                this.currentQuestion++;
                this.renderQuestion(this.currentQuestion);
            } else {
                this.showResult();
            }
        }, 300);
    },

    /**
     * 根據分數取得結果
     */
    getResultByScore: function (score) {
        for (const key in QUIZ_RESULTS) {
            const r = QUIZ_RESULTS[key];
            if (score >= r.range[0] && score <= r.range[1]) {
                return r;
            }
        }
        return QUIZ_RESULTS.beginner;
    },

    /**
     * 根據標籤取得推薦
     */
    getRecommendationByTag: function (tag, defaultResult) {
        if (tag && TAG_RECOMMENDATIONS[tag]) {
            const rec = TAG_RECOMMENDATIONS[tag];
            return {
                link: rec.link,
                name: rec.name,
                reason: rec.reason
            };
        }
        return {
            link: defaultResult.link,
            name: defaultResult.recommendation,
            reason: defaultResult.reason
        };
    },

    /**
     * 顯示結果
     */
    showResult: function () {
        const result = this.getResultByScore(this.totalScore);
        const rec = this.getRecommendationByTag(this.selectedTag, result);

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
                    <a href="${rec.link}" class="btn btn-primary">
                        了解「${rec.name}」
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </a>
                    <p class="rec-reason">${rec.reason}</p>
                </div>
                
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

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QuizLogic };
}
