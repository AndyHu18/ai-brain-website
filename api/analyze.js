/**
 * @file    : api/analyze.js
 * @purpose : Vercel Serverless Function - 網站 AI 分析 API
 * @depends : ['api/lib/scraper-parser.js', 'api/lib/analyzer.js']
 *
 * POST /api/analyze
 * Body: { "url": "https://example.com" }
 * Response: { id, websiteUrl, websiteTitle, analysis, generatedAt }
 */

const { scrapeWebsite } = require("./lib/scraper-parser");
const { analyzeWithAI } = require("./lib/analyzer");

/**
 * 生成報告 ID
 */
function generateReportId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `report_${timestamp}_${random}`;
}

/**
 * 主處理函數
 */
export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  // CORS 處理
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
      message: "只支援 POST 請求",
    });
  }

  // 驗證 API Key（優先 Claude，fallback Gemini）
  const claudeKey = process.env.ANTHROPIC_API_KEY;
  const apiKey = claudeKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ No API key configured");
    return res.status(500).json({
      error: "API key not configured",
      message:
        "請在 Vercel Dashboard 設定 ANTHROPIC_API_KEY 或 GEMINI_API_KEY 環境變數",
    });
  }

  // 驗證輸入
  const { url } = req.body || {};
  if (!url || typeof url !== "string") {
    return res.status(400).json({
      error: "Invalid input",
      message: "請提供有效的網址",
    });
  }

  const trimmedUrl = url.trim();
  if (trimmedUrl.length < 4 || trimmedUrl.length > 2000) {
    return res.status(400).json({
      error: "Invalid URL length",
      message: "網址長度必須在 4 到 2000 字元之間",
    });
  }

  console.log("📍[Analyze API] 開始分析:", trimmedUrl);
  const startTime = Date.now();

  try {
    // Step 1: 抓取網站
    console.log("📍[Analyze API] Step 1: 抓取網站內容");
    const scrapeResult = await scrapeWebsite(trimmedUrl);

    if (!scrapeResult.ok) {
      console.error("📍[Analyze API] 抓取失敗:", scrapeResult.message);
      return res.status(400).json({
        error: scrapeResult.error,
        message: scrapeResult.message,
      });
    }

    const content = scrapeResult.data;
    console.log("📍[Analyze API] 抓取成功，標題:", content.title);

    // Step 2: AI 分析
    console.log("📍[Analyze API] Step 2: 執行 AI 分析");
    const analysisResult = await analyzeWithAI(
      content,
      null,
      apiKey,
      !!claudeKey,
    );

    if (!analysisResult.ok) {
      console.error("📍[Analyze API] 分析失敗:", analysisResult.message);
      return res.status(500).json({
        error: analysisResult.error,
        message: analysisResult.message,
      });
    }

    // Step 3: 組裝報告
    console.log("📍[Analyze API] Step 3: 組裝報告");
    const report = {
      id: generateReportId(),
      websiteUrl: content.url,
      websiteTitle: content.title || "未知網站",
      analysis: analysisResult.data,
      generatedAt: new Date().toISOString(),
    };

    const duration = Date.now() - startTime;
    console.log(`📍[Analyze API] ✅ 完成，耗時 ${duration}ms`);

    return res.status(200).json(report);
  } catch (error) {
    console.error("❌ [Analyze API] 未預期錯誤:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "分析過程發生未預期錯誤，請稍後再試",
    });
  }
}
