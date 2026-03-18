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
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  // Chrome on Mac
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  // Firefox on Windows
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0",
  // Safari on Mac
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15",
  // Edge on Windows
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
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
    "User-Agent": userAgent,
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    "Sec-Ch-Ua": '"Chromium";v="131", "Not_A Brand";v="24"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    Host: host,
  };
}

// ============ URL 驗證 ============

function isValidUrl(urlString) {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeUrl(url) {
  let normalized = url.trim();
  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    normalized = "https://" + normalized;
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
  let lastError = {
    ok: false,
    errorType: "FETCH_FAILED",
    errorMessage: "未知錯誤",
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      console.log(`📍[Scraper] 重試 ${attempt}/${retries}...`);
      await new Promise((r) => setTimeout(r, RETRY_DELAY * attempt));
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: buildHeaders(url),
        redirect: "follow",
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
            errorType: "FETCH_FAILED",
            errorMessage: `網站拒絕存取 (HTTP ${status})，可能有反爬蟲機制`,
          };
        }

        // 429: Rate limit，重試
        if (status === 429) {
          lastError = {
            ok: false,
            status,
            errorType: "FETCH_FAILED",
            errorMessage: "請求過於頻繁，請稍後再試",
          };
          continue;
        }

        // 5xx: 伺服器錯誤，重試
        if (status >= 500) {
          lastError = {
            ok: false,
            status,
            errorType: "FETCH_FAILED",
            errorMessage: `伺服器錯誤 (HTTP ${status})`,
          };
          continue;
        }

        return {
          ok: false,
          status,
          errorType: "FETCH_FAILED",
          errorMessage: `HTTP 錯誤: ${status}`,
        };
      }

      const html = await response.text();
      return { ok: true, html, status: response.status };
    } catch (error) {
      if (error.name === "AbortError") {
        lastError = {
          ok: false,
          errorType: "TIMEOUT",
          errorMessage: `請求超時 (${REQUEST_TIMEOUT / 1000}秒)`,
        };
      } else if (
        error.message.includes("ENOTFOUND") ||
        error.message.includes("getaddrinfo")
      ) {
        return {
          ok: false,
          errorType: "FETCH_FAILED",
          errorMessage: "找不到網站，請確認網址是否正確",
        };
      } else if (error.message.includes("ECONNREFUSED")) {
        lastError = {
          ok: false,
          errorType: "FETCH_FAILED",
          errorMessage: "無法連線到網站",
        };
      } else {
        lastError = {
          ok: false,
          errorType: "FETCH_FAILED",
          errorMessage: error.message,
        };
      }
    }
  }

  return lastError;
}

// ============ Firecrawl 抓取 ============

/** Firecrawl API 端點 */
const FIRECRAWL_API = "https://api.firecrawl.dev/v2/scrape";

/** Firecrawl 超時（毫秒） */
const FIRECRAWL_TIMEOUT = 20000;

/**
 * 使用 Firecrawl 抓取網頁（返回乾淨 Markdown）
 * @param {string} url - 目標網址
 * @returns {Promise<{ok: boolean, content?: string, title?: string, error?: string}>}
 */
async function fetchWithFirecrawl(url) {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error: "NO_API_KEY",
      message: "FIRECRAWL_API_KEY not configured",
    };
  }

  const normalizedUrl = normalizeUrl(url);
  console.log("📍[Firecrawl] 開始抓取:", normalizedUrl);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FIRECRAWL_TIMEOUT);

    const response = await fetch(FIRECRAWL_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ url: normalizedUrl }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("📍[Firecrawl] API 錯誤:", response.status, errorText);
      return {
        ok: false,
        error: "FIRECRAWL_FAILED",
        message: `HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    const markdown = data.data?.markdown || "";
    const title = data.data?.metadata?.title || "";

    if (!markdown || markdown.length < 50) {
      return { ok: false, error: "CONTENT_TOO_SHORT", message: "內容過少" };
    }

    console.log("📍[Firecrawl] 抓取成功，內容長度:", markdown.length);

    return {
      ok: true,
      content: markdown,
      title: title,
      source: "firecrawl",
    };
  } catch (error) {
    console.error("📍[Firecrawl] 抓取失敗:", error.message);
    return {
      ok: false,
      error: error.name === "AbortError" ? "TIMEOUT" : "FIRECRAWL_FAILED",
      message: error.message,
    };
  }
}

// ============ 智能調度器 ============

// 懶加載 Browserless 模組（避免 puppeteer-core 在無需時載入）
let browserlessModule = null;
function getBrowserlessModule() {
  if (!browserlessModule) {
    try {
      browserlessModule = require("./scraper-browserless");
    } catch (error) {
      console.warn("📍[SmartScrape] Browserless 模組載入失敗:", error.message);
      browserlessModule = {
        fetchWithBrowserless: async () => ({
          ok: false,
          error: "MODULE_LOAD_FAILED",
          message: "Browserless 模組無法載入",
        }),
        isBrowserlessAvailable: () => false,
      };
    }
  }
  return browserlessModule;
}

/** 內容最小有效長度（觸發 Browserless 的閾值） */
const MIN_CONTENT_FOR_ANALYSIS = 500;

/**
 * 智能抓取調度器
 * 策略：先嘗試快速 HTTP，失敗或內容不足時自動切換到 Browserless
 *
 * @param {string} url - 目標網址
 * @param {Object} options - 選項
 * @param {boolean} options.forceBrowserless - 強制使用 Browserless
 * @returns {Promise<{ok: boolean, html?: string, source?: string, error?: string}>}
 */
async function smartScrape(url, options = {}) {
  const startTime = Date.now();
  const normalizedUrl = normalizeUrl(url);

  console.log("📍[SmartScrape] 開始智能抓取:", normalizedUrl);

  // 驗證 URL
  if (!isValidUrl(normalizedUrl)) {
    return { ok: false, error: "INVALID_URL", message: "無效的網址格式" };
  }

  // 策略 1: 快速 HTTP（除非強制使用 Browserless）
  if (!options.forceBrowserless) {
    console.log("📍[SmartScrape] 嘗試快速 HTTP 抓取...");
    const httpResult = await fetchWithRetry(normalizedUrl);

    if (httpResult.ok && httpResult.html) {
      // 檢查內容是否足夠
      const textContent = httpResult.html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (textContent.length >= MIN_CONTENT_FOR_ANALYSIS) {
        console.log(
          "📍[SmartScrape] HTTP 成功，內容足夠:",
          textContent.length,
          "字元",
        );
        return {
          ok: true,
          html: httpResult.html,
          source: "http",
          duration: Date.now() - startTime,
        };
      }

      console.log(
        "📍[SmartScrape] HTTP 成功但內容不足:",
        textContent.length,
        "字元，切換到 Browserless",
      );
    } else {
      console.log(
        "📍[SmartScrape] HTTP 失敗:",
        httpResult.errorMessage || "未知錯誤",
      );
    }
  }

  // 策略 2: Browserless 無頭瀏覽器
  const { isBrowserlessAvailable, fetchWithBrowserless } =
    getBrowserlessModule();
  if (isBrowserlessAvailable()) {
    console.log("📍[SmartScrape] 使用 Browserless 無頭瀏覽器...");
    const apiKey = process.env.BROWSERLESS_API_KEY;
    const browserResult = await fetchWithBrowserless(normalizedUrl, apiKey);

    if (browserResult.ok) {
      console.log("📍[SmartScrape] Browserless 成功");
      return {
        ...browserResult,
        duration: Date.now() - startTime,
      };
    }

    console.log("📍[SmartScrape] Browserless 失敗:", browserResult.message);
    return browserResult;
  }

  // 無 Browserless 可用，返回 HTTP 錯誤
  console.log("📍[SmartScrape] Browserless 不可用，返回 HTTP 結果");
  return {
    ok: false,
    error: "CONTENT_INSUFFICIENT",
    message:
      "網站內容不足或為 JavaScript 渲染網站，建議設定 Browserless API Key",
  };
}

// ============ 匯出 ============

module.exports = {
  isValidUrl,
  normalizeUrl,
  fetchWithRetry,
  fetchWithFirecrawl,
  smartScrape,
  REQUEST_TIMEOUT,
  MAX_RETRIES,
  MIN_CONTENT_FOR_ANALYSIS,
};
