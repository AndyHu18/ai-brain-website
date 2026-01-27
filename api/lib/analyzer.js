/**
 * @file    : api/lib/analyzer.js
 * @purpose : AI 分析引擎 - Gemini API 呼叫與回應解析
 * @depends : ['api/config/system-prompts.js']
 * @usedBy  : ['api/analyze.js']
 */

const { buildAnalysisPrompt } = require('../config/system-prompts');

// ============ 常數設定 ============

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/** 最大內容長度（傳給 AI） */
const MAX_CONTENT_LENGTH = 25000;

/** API 重試次數 */
const MAX_API_RETRIES = 2;

/** 重試延遲（毫秒） */
const API_RETRY_DELAY = 2000;

// ============ Prompt 建構 ============

/**
 * 建構發送給 Gemini 的完整提示詞
 */
function buildFullPrompt(content, config) {
    const systemPrompt = buildAnalysisPrompt(config);

    const headings = content.headings || [];
    const serviceBlocks = content.serviceBlocks || [];

    // 構建結構化的網站資訊
    const structuredInfo = [
        `網址: ${content.url}`,
        `標題: ${content.title}`,
        `描述: ${content.description || '(無)'}`,
        headings.length > 0 ? `主要標題 (H1-H3):\n${headings.map(h => `  • ${h}`).join('\n')}` : '',
        content.navigation.length > 0 ? `導航項目: ${content.navigation.join('、')}` : '',
        serviceBlocks.length > 0 ? `識別到的服務區塊:\n${serviceBlocks.map(s => `  ▸ ${s}`).join('\n')}` : ''
    ].filter(Boolean).join('\n');

    // 截取內容
    const contentText = content.textContent.slice(0, MAX_CONTENT_LENGTH);

    return `${systemPrompt}

═══════════════════════════════════════════════════════════════
【網站資訊】
═══════════════════════════════════════════════════════════════

${structuredInfo}

═══════════════════════════════════════════════════════════════
【網站內容】（已清理的純文字，共 ${contentText.length} 字）
═══════════════════════════════════════════════════════════════

${contentText}

═══════════════════════════════════════════════════════════════
【輸出格式】
═══════════════════════════════════════════════════════════════

請以 JSON 格式輸出，結構如下：
{
  "services": [{"name": "具體服務名", "description": "描述", "category": "類別"}],
  "aiOpportunities": [{"area": "領域", "application": "具體應用", "estimatedBenefit": "預期效益", "difficulty": "low|medium|high"}],
  "departmentInsights": [{"department": "部門名", "opportunities": ["機會1", "機會2"], "tools": ["智能客服系統", "AI 內容生成系統"]}],
  "positionOpportunities": [{"level": "executive|management|operational", "levelName": "層級名稱", "opportunities": ["機會1", "機會2"]}],
  "websiteOptimizations": [{"type": "類型", "suggestion": "建議", "priority": "high|medium|low"}],
  "salesFunnelAI": [{"stage": "階段", "aiApplication": "AI應用", "description": "描述"}],
  "summary": "整體摘要（需包含網站行業識別和主要發現）"
}

【重要】只輸出 JSON，不要任何其他文字或 markdown 標記。`;
}

// ============ 回應解析 ============

/**
 * 解析 AI 回應
 */
function parseAIResponse(text) {
    try {
        let jsonText = text.trim();

        // 移除可能的 markdown 代碼塊包裝
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.slice(7);
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.slice(3);
        }
        if (jsonText.endsWith('```')) {
            jsonText = jsonText.slice(0, -3);
        }
        jsonText = jsonText.trim();

        // 嘗試提取 JSON 物件
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('📍[Analyzer] 找不到 JSON 物件');
            return null;
        }

        const parsed = JSON.parse(jsonMatch[0]);

        // 驗證必要欄位
        if (!parsed.services || !Array.isArray(parsed.services)) {
            console.error('📍[Analyzer] 缺少 services 欄位');
            return null;
        }
        if (!parsed.aiOpportunities || !Array.isArray(parsed.aiOpportunities)) {
            console.error('📍[Analyzer] 缺少 aiOpportunities 欄位');
            return null;
        }

        // 確保所有欄位都存在（給予預設值）
        return {
            services: parsed.services,
            aiOpportunities: parsed.aiOpportunities,
            departmentInsights: parsed.departmentInsights || [],
            positionOpportunities: parsed.positionOpportunities || [],
            websiteOptimizations: parsed.websiteOptimizations || [],
            salesFunnelAI: parsed.salesFunnelAI || [],
            summary: parsed.summary || '分析完成'
        };

    } catch (error) {
        console.error('📍[Analyzer] JSON 解析失敗:', error);
        return null;
    }
}

// ============ API 呼叫 ============

/**
 * 呼叫 Gemini API（含重試機制）
 */
async function callGeminiAPI(prompt, apiKey, retries = MAX_API_RETRIES) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        if (attempt > 0) {
            console.log(`📍[Analyzer] API 重試 ${attempt}/${retries}...`);
            await new Promise(r => setTimeout(r, API_RETRY_DELAY * attempt));
        }

        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.4,
                        maxOutputTokens: 8192,
                        topP: 0.8,
                        topK: 40
                    }
                })
            });

            if (response.status === 429) {
                console.warn('📍[Analyzer] Rate limit，等待重試...');
                continue;
            }

            if (response.status >= 500) {
                console.warn(`📍[Analyzer] 伺服器錯誤 ${response.status}，等待重試...`);
                continue;
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error('📍[Analyzer] API 錯誤:', errorText);
                return { ok: false, error: 'AI_API_ERROR', message: `API 錯誤: ${response.status}` };
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                console.error('📍[Analyzer] 空白回應');
                return { ok: false, error: 'INVALID_RESPONSE', message: 'AI 回應格式異常' };
            }

            return { ok: true, data: text };

        } catch (error) {
            console.error('📍[Analyzer] 請求錯誤:', error);
            if (attempt === retries) {
                return { ok: false, error: 'AI_API_ERROR', message: error.message || '未知錯誤' };
            }
        }
    }

    return { ok: false, error: 'RATE_LIMIT', message: 'API 請求失敗，請稍後再試' };
}

// ============ 主函數 ============

/**
 * 使用 Gemini API 分析網站
 */
async function analyzeWithAI(content, config, apiKey) {
    console.log('📍[Analyzer] 開始 AI 分析');

    if (content.textContent.length < 50) {
        console.error('📍[Analyzer] 內容過短:', content.textContent.length);
        return { ok: false, error: 'CONTENT_TOO_SHORT', message: '網站內容太少，無法進行有效分析（需至少 50 字）' };
    }

    console.log('📍[Analyzer] 內容長度:', content.textContent.length);

    const prompt = buildFullPrompt(content, config);
    console.log('📍[Analyzer] Prompt 長度:', prompt.length);

    const apiResult = await callGeminiAPI(prompt, apiKey);
    if (!apiResult.ok) {
        return apiResult;
    }

    console.log('📍[Analyzer] 收到 AI 回應，長度:', apiResult.data.length);

    const result = parseAIResponse(apiResult.data);
    if (!result) {
        console.error('📍[Analyzer] 無法解析的回應前 500 字:', apiResult.data.slice(0, 500));
        return { ok: false, error: 'INVALID_RESPONSE', message: '無法解析 AI 回應' };
    }

    console.log('📍[Analyzer] 分析完成，識別服務數:', result.services.length);
    return { ok: true, data: result };
}

// ============ 匯出 ============

module.exports = {
    analyzeWithAI,
    buildFullPrompt,
    parseAIResponse,
    callGeminiAPI
};
