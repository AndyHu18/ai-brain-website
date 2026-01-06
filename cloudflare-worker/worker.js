/**
 * AI 智能大腦公司 - Gemini API 代理
 * Cloudflare Worker 實現，保護 API Key 不暴露於前端
 * 
 * @version 1.0.0
 * @author Agent B - Cloudflare Worker API 代理專家
 */

// ============================================================================
// CORS 設定
// ============================================================================

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*', // 生產環境建議改為具體域名
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // 24 小時預檢快取
};

/**
 * 處理 CORS 預檢請求 (OPTIONS)
 */
function handleCORS() {
    return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
    });
}

/**
 * 為回應添加 CORS 標頭
 */
function addCORSHeaders(response) {
    const newHeaders = new Headers(response.headers);
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
        newHeaders.set(key, value);
    });
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
    });
}

// ============================================================================
// Gemini API 設定
// ============================================================================

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-2.0-flash';

// ============================================================================
// 請求處理
// ============================================================================

/**
 * 驗證請求體格式
 */
function validateRequestBody(body) {
    if (!body) {
        return { valid: false, error: '請求體不能為空' };
    }
    
    if (!body.contents || !Array.isArray(body.contents)) {
        return { valid: false, error: 'contents 欄位必須為陣列' };
    }
    
    return { valid: true };
}

/**
 * 處理 POST /api/chat 請求
 */
async function handleChatRequest(request, env) {
    // 1. 讀取並驗證請求體
    let requestBody;
    try {
        requestBody = await request.json();
    } catch (e) {
        return new Response(JSON.stringify({
            error: '無效的 JSON 格式',
            details: e.message
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
        });
    }

    // 2. 驗證請求格式
    const validation = validateRequestBody(requestBody);
    if (!validation.valid) {
        return new Response(JSON.stringify({
            error: validation.error
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
        });
    }

    // 3. 檢查 API Key
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('📍[worker] GEMINI_API_KEY 環境變數未設定');
        return new Response(JSON.stringify({
            error: '伺服器設定錯誤：API Key 未設定'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
        });
    }

    // 4. 選擇模型
    const model = requestBody.model || DEFAULT_MODEL;
    const geminiUrl = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;

    // 5. 準備 Gemini API 請求體
    const geminiRequest = {
        system_instruction: requestBody.system_instruction,
        contents: requestBody.contents,
        generationConfig: requestBody.generationConfig || {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
        }
    };

    // 6. 轉發請求到 Gemini API
    console.log(`📍[worker] 轉發請求到 Gemini API: ${model}`);
    
    try {
        const geminiResponse = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(geminiRequest)
        });

        // 7. 處理 Gemini API 回應
        const responseData = await geminiResponse.json();

        if (!geminiResponse.ok) {
            console.error('📍[worker] Gemini API 錯誤:', responseData);
            return new Response(JSON.stringify({
                error: 'Gemini API 錯誤',
                details: responseData.error?.message || '未知錯誤',
                status: geminiResponse.status
            }), {
                status: geminiResponse.status,
                headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
            });
        }

        // 8. 成功回應
        console.log('📍[worker] 請求成功完成');
        return new Response(JSON.stringify(responseData), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
        });

    } catch (error) {
        console.error('📍[worker] 網路錯誤:', error);
        return new Response(JSON.stringify({
            error: '無法連接到 Gemini API',
            details: error.message
        }), {
            status: 502,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
        });
    }
}

/**
 * 處理健康檢查請求
 */
function handleHealthCheck() {
    return new Response(JSON.stringify({
        status: 'ok',
        service: 'ai-brain-api-proxy',
        timestamp: new Date().toISOString()
    }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
}

// ============================================================================
// 主入口
// ============================================================================

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const method = request.method;

        console.log(`📍[worker] ${method} ${url.pathname}`);

        // CORS 預檢
        if (method === 'OPTIONS') {
            return handleCORS();
        }

        // 路由處理
        switch (url.pathname) {
            case '/api/chat':
                if (method === 'POST') {
                    return handleChatRequest(request, env);
                }
                break;
            
            case '/health':
            case '/':
                if (method === 'GET') {
                    return handleHealthCheck();
                }
                break;
        }

        // 404 Not Found
        return new Response(JSON.stringify({
            error: 'Not Found',
            path: url.pathname,
            method: method
        }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
        });
    }
};
