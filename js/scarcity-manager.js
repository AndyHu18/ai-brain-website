/**
 * 動態稀缺性系統 (Dynamic Scarcity System)
 * Eddie Shleyner 心理觸發器策略
 * 
 * 功能：
 * - 顯示「本週剩餘名額」動態數字
 * - 每週一自動重置為固定數量
 * - 模擬訪客增加時名額減少（基於時間）
 * 
 * @module scarcity-manager
 * @version 1.0.0
 */

(function () {
    'use strict';

    const ScarcityManager = {
        // 配置
        config: {
            baseSlots: 5,           // 每週基礎名額
            minSlots: 1,            // 最低顯示名額（永不為 0，保持希望）
            storagKey: 'ai_brain_scarcity',
            updateInterval: 60000   // 每分鐘更新一次
        },

        /**
         * 初始化
         */
        init: function () {
            this.updateAllIndicators();
            this.startAutoUpdate();
            console.log('📍[ScarcityManager] 動態稀缺性系統已啟動');
        },

        /**
         * 計算當前週的剩餘名額
         * 基於當前時間 + localStorage 快取
         */
        getAvailableSlots: function () {
            const now = new Date();
            const weekNumber = this.getWeekNumber(now);
            const cached = this.getCachedData();

            // 如果是新的一週，重置名額
            if (!cached || cached.weekNumber !== weekNumber) {
                const newData = {
                    weekNumber: weekNumber,
                    slots: this.config.baseSlots,
                    lastUpdate: now.getTime()
                };
                this.setCachedData(newData);
                return this.config.baseSlots;
            }

            // 根據時間流逝模擬名額減少
            const hoursPassed = (now.getTime() - cached.lastUpdate) / (1000 * 60 * 60);
            const decreaseAmount = Math.floor(hoursPassed / 24); // 每天減少 1 個

            let currentSlots = cached.slots - decreaseAmount;
            currentSlots = Math.max(currentSlots, this.config.minSlots);

            // 更新快取
            if (decreaseAmount > 0) {
                cached.slots = currentSlots;
                cached.lastUpdate = now.getTime();
                this.setCachedData(cached);
            }

            return currentSlots;
        },

        /**
         * 獲取當前週數
         */
        getWeekNumber: function (date) {
            const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            const dayNum = d.getUTCDay() || 7;
            d.setUTCDate(d.getUTCDate() + 4 - dayNum);
            const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
            return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        },

        /**
         * 獲取快取數據
         */
        getCachedData: function () {
            try {
                const data = localStorage.getItem(this.config.storagKey);
                return data ? JSON.parse(data) : null;
            } catch (e) {
                return null;
            }
        },

        /**
         * 設置快取數據
         */
        setCachedData: function (data) {
            try {
                localStorage.setItem(this.config.storagKey, JSON.stringify(data));
            } catch (e) {
                console.warn('📍[ScarcityManager] 無法儲存快取');
            }
        },

        /**
         * 更新所有頁面上的名額指示器
         */
        updateAllIndicators: function () {
            const slots = this.getAvailableSlots();
            const indicators = document.querySelectorAll('[data-scarcity-slots]');

            indicators.forEach(el => {
                el.textContent = slots;

                // 根據剩餘數量添加緊急度樣式
                el.classList.remove('scarcity-normal', 'scarcity-low', 'scarcity-critical');
                if (slots <= 1) {
                    el.classList.add('scarcity-critical');
                } else if (slots <= 2) {
                    el.classList.add('scarcity-low');
                } else {
                    el.classList.add('scarcity-normal');
                }
            });

            // 更新包含名額文字的元素
            const textIndicators = document.querySelectorAll('[data-scarcity-text]');
            textIndicators.forEach(el => {
                if (slots === 1) {
                    el.textContent = `本週僅剩 ${slots} 個名額`;
                } else {
                    el.textContent = `本週剩餘 ${slots} 個名額`;
                }
            });
        },

        /**
         * 開始自動更新
         */
        startAutoUpdate: function () {
            setInterval(() => {
                this.updateAllIndicators();
            }, this.config.updateInterval);
        }
    };

    // DOM Ready 時初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ScarcityManager.init());
    } else {
        ScarcityManager.init();
    }

    // 暴露到全域
    window.ScarcityManager = ScarcityManager;
})();
