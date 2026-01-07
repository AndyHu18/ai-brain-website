/**
 * @file    : js/icons.js
 * @purpose : SVG Icon Library - 符合 /visionnew 規範
 * @version : 1.0.0
 * @spec    : stroke-width: "1.5" 統一標準
 * 
 * 使用方式：
 * 1. 引入此 JS 文件
 * 2. 調用 Icons.inject() 自動將文字標籤替換為 SVG
 * 3. 或使用 Icons.get('iconName') 取得 SVG 字串
 */

const Icons = {
    // SVG 基礎屬性 - 統一 stroke-width: 1.5
    baseAttrs: 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"',

    // 圖標庫 - 全部使用 Lucide/Feather 風格
    library: {
        // ===== 服務類型 =====
        content: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/>',

        voice: '<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>',

        brand: '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 00-16 0"/>',

        bot: '<rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/>',

        notes: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',

        think: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',

        // ===== 功能類型 =====
        search: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>',

        target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',

        settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>',

        tech: '<circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>',

        // ===== 狀態類型 =====
        check: '<polyline points="20,6 9,17 4,12"/>',

        checkCircle: '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>',

        shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',

        lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>',

        // ===== 動作類型 =====
        play: '<polygon points="5,3 19,12 5,21 5,3"/>',

        upload: '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>',

        send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9 22,2"/>',

        refresh: '<polyline points="23,4 23,10 17,10"/><polyline points="1,20 1,14 7,14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>',

        // ===== 音效類型 =====
        volumeOff: '<polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>',

        volumeOn: '<polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/>',

        // ===== 效益/價值類型 =====
        dollar: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>',

        clock: '<circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>',

        trendUp: '<polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/>',

        zap: '<polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>',

        // ===== 分析/數據類型 =====
        barChart: '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',

        pieChart: '<path d="M21.21 15.89A10 10 0 118 2.83"/><path d="M22 12A10 10 0 0012 2v10z"/>',

        activity: '<polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>',

        // ===== 使用者/團隊類型 =====
        user: '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>',

        users: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>',

        // ===== 其他 =====
        lightbulb: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14"/>',

        mapPin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>',

        file: '<path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13,2 13,9 20,9"/>',

        mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',

        calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',

        messageCircle: '<path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>',

        // ===== 箭頭類型 =====
        arrowRight: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>',

        arrowLeft: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/>',

        chevronRight: '<polyline points="9,18 15,12 9,6"/>',

        chevronDown: '<polyline points="6,9 12,15 18,9"/>'
    },

    /**
     * 取得單個 SVG 圖標
     * @param {string} name - 圖標名稱
     * @param {string} className - 額外的 CSS class
     * @returns {string} SVG HTML 字串
     */
    get(name, className = 'icon icon-md') {
        const path = this.library[name];
        if (!path) {
            console.warn(`[Icons] 找不到圖標: ${name}`);
            return '';
        }
        return `<svg class="${className}" ${this.baseAttrs}>${path}</svg>`;
    },

    /**
     * 自動注入 SVG 到指定選擇器的元素
     * @param {string} selector - CSS 選擇器
     * @param {string} iconName - 圖標名稱
     */
    injectTo(selector, iconName) {
        const elements = document.querySelectorAll(selector);
        const svg = this.get(iconName);
        elements.forEach(el => {
            if (svg && !el.querySelector('svg')) {
                el.innerHTML = svg;
            }
        });
    },

    /**
     * 批次替換頁面中的文字標籤為 SVG
     * 根據現有的 class 自動對應圖標
     */
    inject() {
        // 映射表：文字標籤 → 圖標名稱
        const labelToIcon = {
            // 服務類型
            'CONTENT': 'content',
            'VOICE': 'voice',
            'BRAND': 'brand',
            'BOT': 'bot',
            'CHAT': 'messageCircle',
            'NOTES': 'notes',
            'THINK': 'think',
            'CONSULT': 'users',
            // 功能類型
            'TARGET': 'target',
            'TECH': 'settings',
            'SHIELD': 'shield',
            'FOCUS': 'target',
            'LOCAL': 'mapPin',
            'SECURE': 'lock',
            'SEARCH': 'search',
            // 效益類型
            'SAVE': 'dollar',
            'TIME': 'clock',
            'GROWTH': 'trendUp',
            'TIP': 'lightbulb',
            'STEP': 'mapPin',
            'FAST': 'zap',
            'SAFE': 'shield',
            'DEEP': 'activity',
            // 動作類型
            'SEND': 'send',
            'UPLOAD': 'upload',
            'PLAY': 'play',
            'REFRESH': 'refresh',
            // 用戶/學習類型
            'USER': 'user',
            'USERS': 'users',
            'LEARN': 'lightbulb',
            // 媒體類型
            'IMAGE': 'file',
            'FILE': 'file',
            'MAIL': 'mail',
            'CALENDAR': 'calendar',
            // 分析類型
            'CHART': 'barChart',
            'DATA': 'activity',
            'REPORT': 'pieChart',
            // 音效類型
            'OFF': 'volumeOff',
            'ON': 'volumeOn',
            // 其他
            'AI': 'bot',
            'OK': 'checkCircle',
            'CHECK': 'check',
            'SUCCESS': 'checkCircle',
            'DONE': 'checkCircle'
        };

        // 選擇器列表
        const selectors = [
            '.footer-nav-icon',
            '.service-icon',
            '.trust-icon',
            '.benefit-icon',
            '.service-tech-icon',
            '.service-target-icon',
            '.tech-icon',
            '.contact-icon'
        ];

        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                // 如果已經有 SVG，跳過
                if (el.querySelector('svg')) return;

                // 取得文字內容
                const text = el.textContent.trim().toUpperCase();
                const iconName = labelToIcon[text];

                if (iconName) {
                    const svg = this.get(iconName);
                    if (svg) {
                        el.innerHTML = svg;
                        el.setAttribute('aria-label', text);
                    }
                }
            });
        });

        console.log('📍[Icons] SVG 注入完成');
    }
};

// DOM 載入後自動注入
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // 延遲執行，確保其他腳本已完成
        setTimeout(() => Icons.inject(), 100);
    });
}

// 導出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Icons;
}
