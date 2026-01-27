/**
 * @file    : api/lib/scraper-browserless.js
 * @purpose : Browserless.io 無頭瀏覽器抓取模組
 * @depends : ['puppeteer-core']
 * @usedBy  : ['api/lib/scraper-core.js']
 */

const puppeteer = require('puppeteer-core');

// ============ 常數設定 ============

/** Browserless WebSocket 端點 */
const BROWSERLESS_WS_ENDPOINT = 'wss://production-sfo.browserless.io';

/** 瀏覽器連線超時（毫秒） */
const CONNECT_TIMEOUT = 10000;

/** 頁面載入超時（毫秒）- 預留 5 秒給 Vercel 函數 */
const PAGE_TIMEOUT = 25000;

/** 最大內容長度 */
const MAX_CONTENT_LENGTH = 50000;

// ============ 核心函數 ============

/**
 * 透過 Browserless 抓取網頁（支援 JavaScript 渲染）
 * @param {string} url - 目標網址
 * @param {string} apiKey - Browserless API Key
 * @returns {Promise<{ok: boolean, html?: string, error?: string}>}
 */
async function fetchWithBrowserless(url, apiKey) {
    if (!apiKey) {
        return {
            ok: false,
            error: 'MISSING_API_KEY',
            message: 'Browserless API Key 未設定'
        };
    }

    let browser = null;
    let page = null;

    try {
        console.log('📍[Browserless] 連接無頭瀏覽器...');

        // 建立 WebSocket 連線
        const wsEndpoint = `${BROWSERLESS_WS_ENDPOINT}?token=${apiKey}&timeout=${PAGE_TIMEOUT}`;

        browser = await puppeteer.connect({
            browserWSEndpoint: wsEndpoint,
            defaultViewport: { width: 1920, height: 1080 }
        });

        console.log('📍[Browserless] 連線成功，開啟頁面...');
        page = await browser.newPage();

        // 設定 User-Agent（模擬真實瀏覽器）
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
        );

        // 設定請求攔截（減少資源消耗）
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const resourceType = req.resourceType();
            // 阻擋圖片、字體、媒體以加速載入
            if (['image', 'font', 'media', 'stylesheet'].includes(resourceType)) {
                req.abort();
            } else {
                req.continue();
            }
        });

        console.log('📍[Browserless] 前往:', url);

        // 導航並等待網路閒置
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: PAGE_TIMEOUT
        });

        // 額外等待動態內容
        await page.waitForTimeout(2000);

        // 取得頁面 HTML
        const html = await page.content();
        console.log('📍[Browserless] 取得 HTML 長度:', html.length);

        return {
            ok: true,
            html: html.slice(0, MAX_CONTENT_LENGTH),
            source: 'browserless'
        };

    } catch (error) {
        console.error('📍[Browserless] 錯誤:', error.message);

        // 分類錯誤
        if (error.message.includes('timeout')) {
            return {
                ok: false,
                error: 'TIMEOUT',
                message: '頁面載入超時，網站可能過於複雜或無回應'
            };
        }

        if (error.message.includes('net::ERR_')) {
            return {
                ok: false,
                error: 'NETWORK_ERROR',
                message: '網路錯誤，無法連接到目標網站'
            };
        }

        return {
            ok: false,
            error: 'BROWSER_ERROR',
            message: error.message
        };

    } finally {
        // 確保資源釋放
        try {
            if (page) await page.close();
            if (browser) await browser.disconnect();
            console.log('📍[Browserless] 資源已釋放');
        } catch (cleanupError) {
            console.warn('📍[Browserless] 清理時發生錯誤:', cleanupError.message);
        }
    }
}

/**
 * 檢查 Browserless 是否可用
 * @returns {boolean}
 */
function isBrowserlessAvailable() {
    return !!process.env.BROWSERLESS_API_KEY;
}

// ============ 匯出 ============

module.exports = {
    fetchWithBrowserless,
    isBrowserlessAvailable,
    CONNECT_TIMEOUT,
    PAGE_TIMEOUT
};
