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
 * @version 2.0.0 (Modularized)
 * 
 * 依賴順序：
 * 1. questions-config.js - 問題配置
 * 2. results-config.js - 結果配置
 * 3. quiz-logic.js - 核心邏輯
 * 4. index.js - 主入口（本檔案）
 */

(function () {
    'use strict';

    const MaturityQuiz = {
        /**
         * 初始化測驗
         */
        init: function (containerId) {
            QuizLogic.container = document.getElementById(containerId);
            if (!QuizLogic.container) return;

            QuizLogic.renderQuestion(0);
            console.log('📍[MaturityQuiz] 成熟度測驗已初始化');
        },

        /**
         * 選擇選項（代理到 QuizLogic）
         */
        selectOption: function (qIndex, optIndex) {
            QuizLogic.selectOption(qIndex, optIndex);
        },

        /**
         * 重新開始（代理到 QuizLogic）
         */
        restart: function () {
            QuizLogic.restart();
        }
    };

    // 暴露到全域
    window.MaturityQuiz = MaturityQuiz;
})();
