/**
 * 行業方案分析器 — Industry Analyzer
 * 自動輪播展示 + 用戶選擇行業 + Claude AI 分析
 */
(function () {
  "use strict";

  // ── Config ──
  const API_URL = "https://getlove-api-proxy.getlove-ai.workers.dev/api/gemini";
  const MODEL = "gemini-2.5-flash";

  const SERVICES = [
    { name: "靜態形象網站", icon: "", color: "#3b82f6" },
    { name: "CMS 可管理網站", icon: "", color: "#8b5cf6" },
    { name: "電商金流串接", icon: "", color: "#10b981" },
    { name: "行銷導向網站", icon: "", color: "#f59e0b" },
    { name: "AI 智能客服", icon: "", color: "#e07b3a" },
    { name: "素材轉製服務", icon: "", color: "#ec4899" },
  ];

  const INDUSTRIES = [
    "餐飲",
    "美容美髮",
    "教育補習",
    "電商零售",
    "醫療診所",
    "法律事務所",
    "房地產",
    "健身瑜珈",
    "寵物店",
    "攝影工作室",
  ];

  // ── Showcase Data (pre-built demos) ──
  const SHOWCASE_DATA = [
    {
      industry: "咖啡廳",
      lines: [
        {
          svc: 0,
          text: "<strong>形象網站</strong> — 展示精品咖啡菜單、店內環境、烘豆故事，讓顧客還沒進門就想來",
        },
        {
          svc: 4,
          text: "<strong>AI 客服</strong> — 自動回覆營業時間、座位預約、外送範圍，老闆不用一直盯手機",
        },
        {
          svc: 3,
          text: "<strong>行銷網站</strong> — 會員集點系統 + 新品推播，回購率提升 40%",
        },
        {
          svc: 5,
          text: "<strong>素材轉製</strong> — 把手機拍的 100 張咖啡照片，自動裁切成社群貼文尺寸",
        },
      ],
    },
    {
      industry: "牙醫診所",
      lines: [
        {
          svc: 0,
          text: "<strong>形象網站</strong> — 醫師團隊介紹、診療項目說明、環境照片，建立專業信任感",
        },
        {
          svc: 4,
          text: "<strong>AI 客服</strong> — 24 小時自動回覆掛號問題、看診流程、保險適用，減少 70% 電話",
        },
        {
          svc: 1,
          text: "<strong>CMS 網站</strong> — 護理師可以自己更新衛教文章、最新公告，不需要工程師",
        },
        {
          svc: 3,
          text: "<strong>行銷網站</strong> — 洗牙提醒 + 療程回訪推播，把一次性患者變長期客戶",
        },
      ],
    },
    {
      industry: "瑜珈教室",
      lines: [
        {
          svc: 0,
          text: "<strong>形象網站</strong> — 師資介紹、課表查詢、教室實景，吸引新學員報名",
        },
        {
          svc: 2,
          text: "<strong>電商功能</strong> — 線上購買課程包、瑜珈墊等周邊，串接金流直接收款",
        },
        {
          svc: 4,
          text: "<strong>AI 客服</strong> — 即時回覆課程時間、適合程度、體驗課預約",
        },
        {
          svc: 5,
          text: "<strong>素材轉製</strong> — 上課錄影自動截取精華片段，產出 IG Reels 短影音",
        },
      ],
    },
    {
      industry: "律師事務所",
      lines: [
        {
          svc: 0,
          text: "<strong>形象網站</strong> — 專業形象、案件類型、成功案例展示，讓客戶安心委託",
        },
        {
          svc: 4,
          text: "<strong>AI 客服</strong> — 初步法律問題分類、諮詢預約、費用說明，過濾無效諮詢",
        },
        {
          svc: 1,
          text: "<strong>CMS 網站</strong> — 律師自行發布法律專欄、判決解析，建立專業聲望",
        },
        {
          svc: 3,
          text: "<strong>行銷網站</strong> — SEO 優化讓「離婚律師推薦」等關鍵字排名第一頁",
        },
      ],
    },
    {
      industry: "寵物美容",
      lines: [
        {
          svc: 0,
          text: "<strong>形象網站</strong> — 毛小孩美容前後對比照、價目表、預約系統",
        },
        {
          svc: 4,
          text: "<strong>AI 客服</strong> — 自動判斷犬種體型推薦方案，回覆接送範圍和空檔時段",
        },
        {
          svc: 2,
          text: "<strong>電商功能</strong> — 線上賣寵物零食、洗毛精，宅配到家",
        },
        {
          svc: 5,
          text: "<strong>素材轉製</strong> — 把每天拍的萌寵照批次生成有品牌浮水印的社群圖",
        },
      ],
    },
  ];

  // ── System Prompt ──
  const SYSTEM_PROMPT = `你是 AI 智能大腦的方案分析師。用戶會告訴你他的行業，你要分析這個行業如果搭配以下 6 種網站服務能產生什麼具體效果。

6 種服務：
1. 靜態形象網站（NT$5,000 起）— 品牌展示、RWD、SEO 基礎
2. CMS 可管理網站（NT$12,000 起）— 客戶可自行更新內容
3. 電商金流串接（NT$8,000 起）— 綠界/藍新金流、購物車
4. 行銷導向網站（NT$15,000 起）— 轉換優化、銷售漏斗、SEO 進階
5. AI 智能客服（NT$3,000 起/月）— 24/7 自動回覆、意圖辨識
6. 素材轉製服務（NT$2,000 起）— 錄音/影片/文件轉網站素材

規則：
- 用繁體中文回覆
- 針對該行業的痛點和需求，推薦最適合的 3-4 個服務
- 每個推薦要有具體的使用情境和預期效果（用數字說話，例如「減少 60% 電話諮詢」）
- 語氣親切專業，像在跟老闆聊天
- 最後加一句鼓勵性的總結
- 用 h3 標題區分每個服務（格式：### 服務名稱）
- 不要用 markdown 的 ** 粗體語法，用 <strong> 標籤
- 保持精簡，總共不超過 350 字
- 最後總結時自然帶一句：這套組合不只適用於這個行業，暗示讀者可以輸入自己的行業試試看`;

  // ── DOM Refs ──
  let showcaseBody,
    showcaseIndustry,
    resultEl,
    resultBody,
    resultStatus,
    submitBtn,
    inputEl;
  let currentShowcase = 0;
  let showcaseTimer = null;
  let isAnalyzing = false;

  // ── Init ──
  function init() {
    showcaseBody = document.getElementById("iaShowcaseBody");
    showcaseIndustry = document.getElementById("iaShowcaseIndustry");
    resultEl = document.getElementById("iaResult");
    resultBody = document.getElementById("iaResultBody");
    resultStatus = document.getElementById("iaResultStatus");
    submitBtn = document.getElementById("iaSubmit");
    inputEl = document.getElementById("iaInput");

    if (!showcaseBody) return;

    // Bind tags
    document.querySelectorAll(".ia-tag").forEach((tag) => {
      tag.addEventListener("click", () => {
        document
          .querySelectorAll(".ia-tag")
          .forEach((t) => t.classList.remove("active"));
        tag.classList.add("active");
        inputEl.value = tag.dataset.industry;
      });
    });

    // Bind submit
    submitBtn.addEventListener("click", handleSubmit);
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleSubmit();
    });

    // Start showcase carousel
    playShowcase(0);
    showcaseTimer = setInterval(() => {
      currentShowcase = (currentShowcase + 1) % SHOWCASE_DATA.length;
      playShowcase(currentShowcase);
    }, 8000);

    // Header typewriter
    typewriteSubtitle();
  }

  // ── Header Typewriter ──
  const SUBTITLE_TEXTS = [
    "看看 AI 能為你的行業帶來什麼改變",
    "餐廳、診所、教室⋯都有最適合的方案",
    "選個行業，3 秒看到完整規劃",
  ];
  let subtitleIdx = 0;

  function typewriteSubtitle() {
    const el = document.getElementById("iaSubtitleText");
    if (!el) return;

    const text = SUBTITLE_TEXTS[subtitleIdx];
    el.textContent = "";
    let i = 0;

    const timer = setInterval(() => {
      if (i < text.length) {
        el.textContent += text[i];
        i++;
      } else {
        clearInterval(timer);
        setTimeout(() => {
          subtitleIdx = (subtitleIdx + 1) % SUBTITLE_TEXTS.length;
          typewriteSubtitle();
        }, 3000);
      }
    }, 60);
  }

  // ── Showcase Carousel ──
  function playShowcase(index) {
    const data = SHOWCASE_DATA[index];
    showcaseIndustry.textContent = data.industry;
    showcaseBody.innerHTML = "";

    data.lines.forEach((line, i) => {
      const svc = SERVICES[line.svc];
      const div = document.createElement("div");
      div.className = "ia-showcase-line";
      div.innerHTML = `
        ${svc.icon ? `<div class="ia-showcase-icon" style="background:${svc.color}20;color:${svc.color}">${svc.icon}</div>` : ""}
        <div class="ia-showcase-text">${line.text}</div>
      `;
      showcaseBody.appendChild(div);

      setTimeout(() => div.classList.add("visible"), 300 + i * 600);
    });
  }

  // ── Submit ──
  async function handleSubmit() {
    const industry = inputEl.value.trim();
    if (!industry || isAnalyzing) return;

    isAnalyzing = true;
    submitBtn.disabled = true;
    submitBtn.textContent = "分析中...";

    // Show result area with loading
    resultEl.classList.add("visible");
    resultStatus.textContent = "正在分析中...";
    resultBody.innerHTML = `
      <div class="ia-loading">
        <div class="ia-loading-dots"><span></span><span></span><span></span></div>
        <span>AI 正在為「${escapeHtml(industry)}」規劃最佳方案組合...</span>
      </div>
    `;

    // Scroll to result
    resultEl.scrollIntoView({ behavior: "smooth", block: "center" });

    // Pause showcase
    if (showcaseTimer) {
      clearInterval(showcaseTimer);
      showcaseTimer = null;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: MODEL,
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            { role: "user", parts: [{ text: `我的行業是：${industry}` }] },
          ],
          generationConfig: { temperature: 0.8, maxOutputTokens: 1500 },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "API 呼叫失敗");
      }

      // Extract text from Gemini response
      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "無法取得分析結果";

      // Typewriter effect
      resultStatus.textContent = "分析完成";
      await typewriteResult(text);

      // Trigger Premium Content generation (podcast + infographic + PDF)
      if (typeof PremiumContent !== "undefined") {
        PremiumContent.start(industry, resultBody.innerHTML);
      }
    } catch (err) {
      resultBody.innerHTML = `<div class="ia-error">⚠ ${escapeHtml(err.message)}<br>請稍後再試，或直接 LINE 諮詢我們！</div>`;
      resultStatus.textContent = "分析失敗";
    } finally {
      isAnalyzing = false;
      submitBtn.disabled = false;
      submitBtn.textContent = "開始分析 →";

      // Resume showcase
      showcaseTimer = setInterval(() => {
        currentShowcase = (currentShowcase + 1) % SHOWCASE_DATA.length;
        playShowcase(currentShowcase);
      }, 8000);
    }
  }

  // ── Typewriter for Result ──
  async function typewriteResult(rawText) {
    // Convert markdown-style ### headings to <h3>
    const html = rawText
      .replace(/### (.+)/g, "<h3>$1</h3>")
      .replace(/- /g, "<li>")
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>");

    resultBody.innerHTML = "";
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = `<p>${html}</p>`;

    // Walk through text nodes and type them out
    const container = document.createElement("div");
    resultBody.appendChild(container);

    // Simple approach: render HTML chunks with delay
    const chunks = splitHtmlChunks(tempDiv.innerHTML);
    let rendered = "";

    for (let i = 0; i < chunks.length; i++) {
      rendered += chunks[i];
      container.innerHTML = rendered;

      // Scroll to bottom
      if (i % 5 === 0) {
        resultBody.scrollTop = resultBody.scrollHeight;
      }

      // Speed: tags render instantly, text chars have delay
      if (chunks[i].startsWith("<")) {
        await sleep(0);
      } else {
        await sleep(18);
      }
    }
  }

  // Split HTML into chars but keep tags intact
  function splitHtmlChunks(html) {
    const chunks = [];
    let i = 0;
    while (i < html.length) {
      if (html[i] === "<") {
        const end = html.indexOf(">", i);
        if (end !== -1) {
          chunks.push(html.slice(i, end + 1));
          i = end + 1;
        } else {
          chunks.push(html[i]);
          i++;
        }
      } else if (html[i] === "&") {
        const end = html.indexOf(";", i);
        if (end !== -1 && end - i < 8) {
          chunks.push(html.slice(i, end + 1));
          i = end + 1;
        } else {
          chunks.push(html[i]);
          i++;
        }
      } else {
        chunks.push(html[i]);
        i++;
      }
    }
    return chunks;
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Boot ──
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
