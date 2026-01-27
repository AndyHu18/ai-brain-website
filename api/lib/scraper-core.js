/**
 * @file    : api/lib/scraper-core.js
 * @purpose : 網站抓取核心模組 - URL 驗證與 HTTP 請求
 * @depends : []
 * @usedBy  : ['api/lib/scraper-parser.js']
 */

// ============ 常數設定 ============

/** 請求超時（毫秒） */
const REQUEST_TIMEOUT = 20000;

/** 最大重試次數 */
const MAX_RETRIES = 2;

/** 重試間隔（毫秒） */
const RETRY_DELAY = 1500;

// ============ User-Agent 輪換池 ============

const USER_AGENTS = [
    // Chrome on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    // Chrome on Mac
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    // Firefox on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0',
    // Safari on Mac
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15',
    // Edge on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0'
];

/** 隨機選取 User-Agent */
function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/** 構建完整的請求 headers（模擬真實瀏覽器） */
function buildHeaders(url) {
    const userAgent = getRandomUserAgent();
    const host = new URL(url).hostname;

    return {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Ch-Ua': '"Chromium";v="131", "Not_A Brand";v="24"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'Host': host
    };
}

// ============ URL 驗證 ============

function isValidUrl(urlString) {
    try {
        const url = new URL(urlString);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

function normalizeUrl(url) {
    let normalized = url.trim();
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
        normalized = 'https://' + normalized;
    }
    return normalized;
}

// ============ HTTP 請求與重試 ============

/**
 * 帶重試機制的 HTTP 請求
 * @param {string} url - 目標 URL
 * @param {number} retries - 重試次數
 * @returns {Promise<{ok: boolean, html?: string, errorType?: string, errorMessage?: string}>}
 */
async function fetchWithRetry(url, retries = MAX_RETRIES) {
    let lastError = { ok: false, errorType: 'FETCH_FAILED', errorMessage: '未知錯誤' };

    for (let attempt = 0; attempt <= retries; attempt++) {
        if (attempt > 0) {
            console.log(`📍[Scraper] 重試 ${attempt}/${retries}...`);
            await new Promise(r => setTimeout(r, RETRY_DELAY * attempt));
        }

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

            const response = await fetch(url, {
                signal: controller.signal,
                headers: buildHeaders(url),
                redirect: 'follow'
            });

            clearTimeout(timeout);

            // 檢查 HTTP 狀態
            if (!response.ok) {
                const status = response.status;

                // 403/401: 被阻擋，不重試
                if (status === 403 || status === 401) {
                    return {
                        ok: false,
                        status,
                        errorType: 'FETCH_FAILED',
                        errorMessage: `網站拒絕存取 (HTTP ${status})，可能有反爬蟲機制`
                    };
                }

                // 429: Rate limit，重試
                if (status === 429) {
                    lastError = { ok: false, status, errorType: 'FETCH_FAILED', errorMessage: '請求過於頻繁，請稍後再試' };
                    continue;
                }

                // 5xx: 伺服器錯誤，重試
                if (status >= 500) {
                    lastError = { ok: false, status, errorType: 'FETCH_FAILED', errorMessage: `伺服器錯誤 (HTTP ${status})` };
                    continue;
                }

                return { ok: false, status, errorType: 'FETCH_FAILED', errorMessage: `HTTP 錯誤: ${status}` };
            }

            const html = await response.text();
            return { ok: true, html, status: response.status };

        } catch (error) {
            if (error.name === 'AbortError') {
                lastError = { ok: false, errorType: 'TIMEOUT', errorMessage: `請求超時 (${REQUEST_TIMEOUT / 1000}秒)` };
            } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
                return { ok: false, errorType: 'FETCH_FAILED', errorMessage: '找不到網站，請確認網址是否正確' };
            } else if (error.message.includes('ECONNREFUSED')) {
                lastError = { ok: false, errorType: 'FETCH_FAILED', errorMessage: '無法連線到網站' };
            } else {
                lastError = { ok: false, errorType: 'FETCH_FAILED', errorMessage: error.message };
            }
        }
    }

    return lastError;
}

// ============ 匯出 ============

module.exports = {
    isValidUrl,
    normalizeUrl,
    fetchWithRetry,
    REQUEST_TIMEOUT,
    MAX_RETRIES
};
