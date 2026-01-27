/**
 * @file    : api/lib/scraper-multi-page.js
 * @purpose : 多頁深度爬蟲模組
 * @depends : ['./scraper-parser.js']
 * @usedBy  : ['api/lib/scraper-core.js']
 */

// ============ 常數設定 ============

/** 要抓取的常見子頁面路徑 */
const IMPORTANT_PATHS = [
    '/about',
    '/about-us',
    '/services',
    '/products',
    '/solutions',
    '/pricing',
    '/features'
];

/** 最多抓取的子頁面數量 */
const MAX_SUBPAGES = 3;

/** 內容最小有效長度 */
const MIN_CONTENT_LENGTH = 100;

// ============ 子頁面識別 ============

/**
 * 從首頁 HTML 中識別重要子頁面連結
 * @param {string} html - 首頁 HTML
 * @param {string} baseUrl - 基礎 URL
 * @returns {string[]} 子頁面 URL 列表
 */
function discoverSubPages(html, baseUrl) {
    const discovered = [];

    try {
        const urlObj = new URL(baseUrl);
        const baseHost = urlObj.hostname;

        // 從 HTML 中提取所有連結
        const linkPattern = /href=["']([^"']+)["']/gi;
        let match;

        while ((match = linkPattern.exec(html)) !== null) {
            const href = match[1];

            // 跳過外部連結、錨點、JavaScript
            if (href.startsWith('#') ||
                href.startsWith('javascript:') ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:')) {
                continue;
            }

            // 構建完整 URL
            let fullUrl;
            if (href.startsWith('http')) {
                fullUrl = href;
            } else if (href.startsWith('/')) {
                fullUrl = `${urlObj.protocol}//${urlObj.host}${href}`;
            } else {
                continue;
            }

            // 檢查是否為同域名
            try {
                const linkUrl = new URL(fullUrl);
                if (linkUrl.hostname !== baseHost) continue;

                // 檢查是否為重要路徑
                const path = linkUrl.pathname.toLowerCase();
                const isImportant = IMPORTANT_PATHS.some(p =>
                    path === p || path === `${p}/` || path.startsWith(`${p}/`)
                );

                if (isImportant && !discovered.includes(fullUrl)) {
                    discovered.push(fullUrl);
                }
            } catch {
                continue;
            }
        }

    } catch (error) {
        console.warn('📍[MultiPage] 識別子頁面時發生錯誤:', error.message);
    }

    console.log('📍[MultiPage] 識別到子頁面:', discovered.slice(0, MAX_SUBPAGES));
    return discovered.slice(0, MAX_SUBPAGES);
}

/**
 * 合併多個頁面的內容
 * @param {Array<{url: string, content: string}>} pages - 頁面列表
 * @returns {string} 合併後的內容
 */
function mergePageContents(pages) {
    const validPages = pages.filter(p =>
        p.content && p.content.length > MIN_CONTENT_LENGTH
    );

    if (validPages.length === 0) {
        return '';
    }

    // 簡單合併，用分隔符區分
    const merged = validPages.map(p => {
        const pathName = new URL(p.url).pathname || '/';
        return `\n--- ${pathName} ---\n${p.content}`;
    }).join('\n');

    console.log('📍[MultiPage] 合併了', validPages.length, '個頁面');
    return merged;
}

/**
 * 從 URL 列表中取得不重複的路徑
 * @param {string[]} urls - URL 列表
 * @param {string} mainUrl - 主頁 URL（排除在外）
 * @returns {string[]} 不重複的子頁面 URL
 */
function getUniqueSubPages(urls, mainUrl) {
    const mainPath = new URL(mainUrl).pathname;

    return [...new Set(urls)]
        .filter(url => {
            try {
                const path = new URL(url).pathname;
                return path !== mainPath && path !== '/';
            } catch {
                return false;
            }
        })
        .slice(0, MAX_SUBPAGES);
}

// ============ 匯出 ============

module.exports = {
    discoverSubPages,
    mergePageContents,
    getUniqueSubPages,
    IMPORTANT_PATHS,
    MAX_SUBPAGES
};
