/**
 * @file    : api/lib/scraper-parser.js
 * @purpose : 網站抓取模組 - Jina Reader 整合 + 多頁抓取
 * @depends : ['api/lib/scraper-core.js', 'api/lib/scraper-multi-page.js']
 * @usedBy  : ['api/analyze.js']
 */

const { isValidUrl, normalizeUrl, fetchWithJina, fetchWithRetry } = require('./scraper-core');
const { discoverSubPages, mergePageContents, fetchMultiplePages } = require('./scraper-multi-page');

// ============ 常數設定 ============

/** 內容抓取最大長度（字元） */
const MAX_TEXT_LENGTH = 30000;

// ============ 內容提取函數 ============

/**
 * 從 HTML 中提取純文字內容
 */
function extractTextContent(html) {
    // 移除 script、style、noscript、svg 標籤
    let text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
        .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '')
        .replace(/<!--[\s\S]*?-->/g, ''); // 移除 HTML 註解

    // 移除所有 HTML 標籤
    text = text.replace(/<[^>]+>/g, ' ');

    // 解碼 HTML 實體
    text = text
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num)));

    // 清理多餘空白
    text = text.replace(/\s+/g, ' ').trim();

    return text;
}

/**
 * 提取 meta 標籤內容
 */
function extractMeta(html, name) {
    const patterns = [
        new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i'),
        new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${name}["']`, 'i'),
        new RegExp(`<meta[^>]*property=["']og:${name}["'][^>]*content=["']([^"']*)["']`, 'i'),
        new RegExp(`<meta[^>]*property=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i')
    ];

    for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1]) return match[1];
    }
    return '';
}

/**
 * 提取頁面標題
 */
function extractTitle(html) {
    const ogTitle = extractMeta(html, 'title');
    if (ogTitle) return ogTitle;

    const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    return match && match[1] ? match[1].trim() : '';
}

/**
 * 提取導航連結
 */
function extractNavigation(html) {
    const links = [];

    // 從 <nav> 標籤中提取
    const navMatches = html.match(/<nav[^>]*>[\s\S]*?<\/nav>/gi) || [];
    for (const nav of navMatches) {
        const linkMatches = nav.matchAll(/<a[^>]*>([^<]*)<\/a>/gi);
        for (const match of linkMatches) {
            const text = match[1].trim();
            if (text && text.length > 1 && text.length < 30) {
                links.push(text);
            }
        }
    }

    // 從 <header> 標籤中提取（補充）
    const headerMatches = html.match(/<header[^>]*>[\s\S]*?<\/header>/gi) || [];
    for (const header of headerMatches) {
        const linkMatches = header.matchAll(/<a[^>]*>([^<]*)<\/a>/gi);
        for (const match of linkMatches) {
            const text = match[1].trim();
            if (text && text.length > 1 && text.length < 30 && !links.includes(text)) {
                links.push(text);
            }
        }
    }

    return [...new Set(links)].slice(0, 25);
}

/**
 * 提取主要標題 (h1, h2, h3)
 */
function extractHeadings(html) {
    const headings = [];
    const patterns = [
        /<h1[^>]*>([^<]*)<\/h1>/gi,
        /<h2[^>]*>([^<]*)<\/h2>/gi,
        /<h3[^>]*>([^<]*)<\/h3>/gi
    ];

    for (const pattern of patterns) {
        const matches = html.matchAll(pattern);
        for (const match of matches) {
            const text = match[1].trim();
            if (text && text.length > 2 && text.length < 100) {
                headings.push(text);
            }
        }
    }

    return [...new Set(headings)].slice(0, 30);
}

/**
 * 提取結構化服務區塊
 */
function extractServiceBlocks(html) {
    const blocks = [];
    const patterns = [
        /<(?:section|article|div)[^>]*class="[^"]*(?:service|product|feature|solution)[^"]*"[^>]*>([\s\S]*?)<\/(?:section|article|div)>/gi,
        /<li[^>]*class="[^"]*(?:service|product|menu)[^"]*"[^>]*>([\s\S]*?)<\/li>/gi
    ];

    for (const pattern of patterns) {
        const matches = html.matchAll(pattern);
        for (const match of matches) {
            const text = match[1]
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
                .slice(0, 200);
            if (text.length > 10) {
                blocks.push(text);
            }
        }
    }

    return [...new Set(blocks)].slice(0, 15);
}

// ============ 主要抓取函數 ============

/**
 * 抓取並解析網站內容
 * @param {string} url - 目標網址
 * @returns {Promise<{ok: boolean, data?: object, error?: string, message?: string}>}
 */
async function scrapeWebsite(url) {
    const startTime = Date.now();
    console.log('📍[Scraper] 開始抓取:', url);

    // URL 正規化與驗證
    const normalizedUrl = normalizeUrl(url);
    console.log('📍[Scraper] 正規化 URL:', normalizedUrl);

    if (!isValidUrl(normalizedUrl)) {
        return { ok: false, error: 'INVALID_URL', message: '無效的網址格式' };
    }

    // Step 1: 使用 Jina Reader 抓取首頁
    console.log('📍[Scraper] Step 1: 使用 Jina Reader 抓取首頁');
    let mainResult = await fetchWithJina(normalizedUrl);
    let source = 'jina';

    // 如果 Jina 失敗，降級到原始 HTTP
    if (!mainResult.ok) {
        console.log('📍[Scraper] Jina 失敗，降級到 HTTP');
        const httpResult = await fetchWithRetry(normalizedUrl);
        if (httpResult.ok && httpResult.html) {
            mainResult = {
                ok: true,
                content: extractTextContent(httpResult.html),
                title: extractTitle(httpResult.html)
            };
            source = 'http';
        } else {
            return {
                ok: false,
                error: 'FETCH_FAILED',
                message: '無法抓取網站（Jina 和 HTTP 都失敗）'
            };
        }
    }

    const mainContent = mainResult.content;
    const fetchDuration = Date.now() - startTime;
    console.log(`📍[Scraper] 首頁抓取完成 (${source}, ${fetchDuration}ms)，長度:`, mainContent.length);

    // Step 2: 識別並抓取子頁面
    console.log('📍[Scraper] Step 2: 識別子頁面');
    const subPageUrls = discoverSubPages(mainContent, normalizedUrl);

    let allContent = mainContent;
    let subPagesData = [];

    if (subPageUrls.length > 0) {
        console.log('📍[Scraper] 發現', subPageUrls.length, '個子頁面');
        subPagesData = await fetchMultiplePages(subPageUrls, fetchWithJina);

        if (subPagesData.length > 0) {
            const mergedSubContent = mergePageContents(subPagesData);
            allContent = mainContent + '\n\n--- 子頁面內容 ---\n' + mergedSubContent;
            console.log('📍[Scraper] 合併後總內容長度:', allContent.length);
        }
    }

    // 截取到最大長度
    const textContent = allContent.slice(0, MAX_TEXT_LENGTH);

    const content = {
        url: normalizedUrl,
        title: mainResult.title || '未知網站',
        description: '',
        textContent,
        navigation: [],
        headings: [],
        serviceBlocks: [],
        fetchedAt: new Date().toISOString(),
        source: source,
        subPagesCount: subPagesData.length
    };

    console.log('📍[Scraper] 解析完成:', {
        title: content.title,
        textLength: textContent.length,
        source: source,
        subPages: subPagesData.length
    });

    // 檢查內容是否足夠
    if (textContent.length < 50) {
        console.warn('📍[Scraper] 警告: 抓取內容過少');
        return {
            ok: false,
            error: 'PARSE_ERROR',
            message: '網站內容過少或無法解析（可能是 JavaScript 渲染的網站）'
        };
    }

    return { ok: true, data: content };
}

// ============ 匯出 ============

module.exports = {
    scrapeWebsite,
    extractTextContent,
    extractTitle,
    extractMeta,
    extractNavigation,
    extractHeadings,
    extractServiceBlocks,
    MAX_TEXT_LENGTH
};
