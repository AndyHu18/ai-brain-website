/**
 * Agent Demo Animation Engine — AI Brain Pricing Edition
 * Adapted from fufu-villa agent-demo-engine.
 * Call runAgentDemo(container) to start; returns a cleanup function.
 */

// ===== ICONS =====
const IC = {
  needs:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>',
  match:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/><circle cx="12" cy="12" r="3"/></svg>',
  budget:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
};

// ===== AGENT DATA =====
const AGENTS = [
  {
    id: "needs",
    name: "需求診斷代理",
    icon: IC.needs,
    color: "var(--agd-needs)",
    glow: "rgba(40,116,166,0.06)",
    colorHex: "#2874a6",
    cover: "images/agent-demo/needs-cover.jpg",
    recImg: "images/agent-demo/rec-needs.jpg",
    ingest: [
      { src: "客戶表單", desc: "讀取業務類型、產業、目標客群" },
      { src: "社群平台", desc: "掃描 Instagram 粉絲數、貼文頻率、互動率" },
      { src: "競品資料庫", desc: "搜尋同業網站現況 → 找到 6 個競品" },
    ],
    reasoning: [
      { op: "辨識", text: "業務類型 = 手工甜點品牌（B2C 零售）" },
      {
        op: "分析",
        text: "IG 粉絲 3,200、月均貼文 12 篇、互動率 4.8%",
        cls: "indent",
      },
      {
        op: "判斷",
        text: "社群經營活躍，具備線上轉換基礎",
        cls: "indent highlight",
      },
      { op: "掃描", text: "競品 6 家：4 家有官網、3 家有線上訂購" },
      { op: "評估", text: "缺少官網 → 品牌信任度落後同業 40%", cls: "indent" },
      { op: "計算", text: "數位成熟度 = 社群×0.4 + 官網×0.3 + 電商×0.3" },
      {
        op: "產出",
        text: "數位成熟度 = 52 / 100（社群強、官網電商空白）",
        cls: "highlight",
      },
    ],
    confidence: [
      { label: "需求判讀", pct: 94, color: "#2874a6" },
      { label: "競品分析", pct: 88, color: "#D2691E" },
      { label: "成長潛力", pct: 92, color: "#2d7d5f" },
    ],
    results: [
      { label: "數位成熟度", value: "52", sub: "待提升", color: "#2874a6" },
      { label: "品牌階段", value: "成長期", sub: "第 2 年", color: "#2874a6" },
      { label: "線上需求", value: "高", sub: "急需官網", color: "#D2691E" },
      { label: "成長潛力", value: "92%", sub: "市場空間大", color: "#2d7d5f" },
    ],
    rec: {
      title: "需求診斷結論",
      text: "品牌社群經營成熟（IG 互動率 4.8% 高於業界平均 2.5%），但缺乏官網作為品牌中心和轉換入口。\n建議優先建置可管理網站 + 電商功能，讓 IG 流量有地方落地。",
    },
    commOut: { to: "方案匹配代理", msg: "傳送需求分析報告與業務特徵" },
  },
  {
    id: "match",
    name: "方案匹配代理",
    icon: IC.match,
    color: "var(--agd-match)",
    glow: "rgba(210,105,30,0.06)",
    colorHex: "#D2691E",
    cover: "images/agent-demo/match-cover.jpg",
    recImg: "images/agent-demo/rec-match.jpg",
    ingest: [
      { src: "需求代理", desc: "接收需求分析報告 + 業務特徵" },
      { src: "方案資料庫", desc: "載入 6 大服務方案規格與價格" },
      { src: "客戶偏好", desc: "讀取預算範圍、時程要求、技術程度" },
    ],
    reasoning: [
      {
        op: "載入",
        text: "6 大方案：靜態站 / CMS / 電商 / 行銷 / AI 客服 / 素材轉製",
      },
      { op: "篩選", text: "需要自行更新內容 → 排除靜態站", cls: "indent" },
      {
        op: "匹配",
        text: "需要線上收款 → 必須加裝電商模組",
        cls: "indent highlight",
      },
      { op: "比對", text: "組件式後台 vs WordPress：長期維護成本對比" },
      {
        op: "計算",
        text: "組件式 3 年 TCO = $30K + 0 | WP 3 年 TCO = $28K + $18K 維護",
        cls: "indent",
      },
      {
        op: "評分",
        text: "適配度 = 功能×0.35 + 預算×0.3 + 維護×0.2 + 擴展×0.15",
      },
      {
        op: "產出",
        text: "最佳方案 = 組件式後台 + 電商加裝（適配度 94%）",
        cls: "highlight",
      },
    ],
    confidence: [
      { label: "方案適配", pct: 94, color: "#D2691E" },
      { label: "成本效益", pct: 91, color: "#2d7d5f" },
      { label: "擴展可行", pct: 88, color: "#2874a6" },
    ],
    results: [
      {
        label: "推薦方案",
        value: "組件式",
        sub: "後台 + 電商",
        color: "#D2691E",
      },
      { label: "適配度", value: "94%", sub: "最佳匹配", color: "#D2691E" },
      { label: "上線週期", value: "3 週", sub: "含測試", color: "#2874a6" },
      { label: "年維護費", value: "$0", sub: "零維護成本", color: "#2d7d5f" },
    ],
    rec: {
      title: "推薦方案組合",
      text: "主方案：組件式後台 NT$30,000 起（7 頁 + 後台管理）\n加裝：電商模組 +NT$32,000（購物車 + 金流 + 訂單）\n加裝：Google 商家檔案 +NT$2,000\n總計 NT$64,000 起 — 涵蓋官網 + 電商 + 本地搜尋",
    },
    commOut: { to: "預算規劃代理", msg: "傳送推薦方案與配置明細" },
  },
  {
    id: "budget",
    name: "預算規劃代理",
    icon: IC.budget,
    color: "var(--agd-budget)",
    glow: "rgba(45,125,95,0.06)",
    colorHex: "#2d7d5f",
    cover: "images/agent-demo/budget-cover.jpg",
    recImg: "images/agent-demo/rec-budget.jpg",
    ingest: [
      { src: "匹配代理", desc: "接收推薦方案 + 配置明細" },
      {
        src: "市場行情庫",
        desc: "載入同規格方案市場價格（個人接案 / 工作室 / 設計公司）",
      },
      { src: "ROI 模型", desc: "匯入產業平均轉換率與客單價模型" },
    ],
    reasoning: [
      {
        op: "載入",
        text: "方案總價 = NT$64,000（組件式 $30K + 電商 $32K + GMB $2K）",
      },
      {
        op: "比對",
        text: "同規格市場行情：個人 $38K~65K / 工作室 $80K~120K",
        cls: "indent",
      },
      {
        op: "計算",
        text: "相比個人接案省 $3.5K~30.5K（省 9%~47%）",
        cls: "indent highlight",
      },
      {
        op: "計算",
        text: "相比設計公司省 $16K~56K（省 20%~47%）",
        cls: "indent",
      },
      { op: "模擬", text: "月均訂單 30 筆 × 客單價 $450 = 月營收 $13,500" },
      {
        op: "計算",
        text: "回本週期 = $64,000 ÷ $13,500 = 4.7 個月",
        cls: "indent",
      },
      {
        op: "優化",
        text: "建議分期：先上官網 $30K → 驗證流量 → 再加電商 $32K",
      },
      {
        op: "產出",
        text: "預算 NT$64,000 | 省 20%~47% | 4.7 個月回本",
        cls: "highlight",
      },
    ],
    confidence: [
      { label: "預算評估", pct: 96, color: "#2d7d5f" },
      { label: "行情比對", pct: 93, color: "#D2691E" },
      { label: "ROI 預測", pct: 85, color: "#2874a6" },
    ],
    results: [
      { label: "總預算", value: "$64K", sub: "含電商加裝", color: "#2d7d5f" },
      {
        label: "市場省幅",
        value: "20~47%",
        sub: "vs 設計公司",
        color: "#2d7d5f",
      },
      { label: "回本週期", value: "4.7月", sub: "預估值", color: "#D2691E" },
      { label: "年 ROI", value: "153%", sub: "保守估計", color: "#2874a6" },
    ],
    rec: {
      title: "預算規劃建議",
      text: "第一階段（本月）：組件式官網 $30,000 → 讓 IG 流量有落地頁\n第二階段（下月）：電商加裝 $32,000 → 開始線上接單收款\n第三階段（第 3 月）：Google 商家 $2,000 → 攻佔在地搜尋\n可選加購：AI 客服 $8,000 起 → 24 小時自動回覆訂單查詢",
    },
    commOut: null,
  },
];

const PLAN = [
  {
    time: "第 1 週",
    desc: "品牌定位 + 設計稿確認",
    tag: "設計",
    color: "var(--agd-needs)",
  },
  {
    time: "第 2 週",
    desc: "前端開發 + 後台串接",
    tag: "開發",
    color: "var(--agd-match)",
  },
  {
    time: "第 3 週",
    desc: "電商模組 + 金流測試",
    tag: "電商",
    color: "var(--agd-budget)",
  },
  {
    time: "第 4 週",
    desc: "Google 商家 + SEO 設定",
    tag: "行銷",
    color: "var(--agd-match)",
  },
  {
    time: "上線後",
    desc: "IG 導流 + 首月營運追蹤",
    tag: "營運",
    color: "var(--agd-needs)",
  },
];

// ===== SPARK PATTERNS =====
const SPARK_PATTERNS = {
  數位成熟度: [3, 4, 4, 5, 5, 6, 6, 7, 7, 8],
  品牌階段: [4, 5, 6, 6, 7, 7, 8, 8, 9, 9],
  線上需求: [6, 7, 8, 8, 9, 9, 10, 10, 10, 10],
  成長潛力: [5, 6, 7, 7, 8, 8, 9, 9, 10, 10],
  推薦方案: [5, 6, 7, 8, 8, 9, 9, 10, 10, 10],
  適配度: [4, 5, 6, 7, 8, 8, 9, 9, 10, 10],
  上線週期: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
  年維護費: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  總預算: [7, 7, 7, 6, 6, 5, 5, 4, 4, 4],
  市場省幅: [4, 5, 6, 7, 7, 8, 8, 9, 9, 10],
  回本週期: [10, 8, 6, 5, 4, 3, 3, 2, 2, 2],
  "年 ROI": [3, 4, 5, 6, 7, 8, 9, 9, 10, 10],
};

// ===== HELPERS =====
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const makeEl = (tag, cls, html) => {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (html) el.innerHTML = html;
  return el;
};

const showEl = async (el, delay = 200) => {
  await wait(delay);
  el.classList.add("visible");
};

const makeMeaningfulSparkline = (label, color, count = 8) => {
  const pattern = SPARK_PATTERNS[label];
  let html = "";
  for (let i = 0; i < count; i++) {
    const h = pattern ? pattern[i] * 1.8 + 2 : Math.random() * 18 + 4;
    html +=
      '<div class="spark-bar" style="background:' +
      color +
      ";height:" +
      h +
      "px;animation-delay:" +
      i * 60 +
      'ms"></div>';
  }
  return html;
};

// ===== CHART BUILDERS =====

// Radar chart for needs agent (business dimensions)
const RADAR_DIMS = [
  { label: "社群", value: 88 },
  { label: "品牌", value: 65 },
  { label: "官網", value: 15 },
  { label: "電商", value: 10 },
  { label: "SEO", value: 20 },
];

const buildRadarChartHTML = () => {
  const cx = 60,
    cy = 60,
    R = 44,
    n = RADAR_DIMS.length;
  const color = "#2874a6";
  const startAngle = -Math.PI / 2;
  const toXY = (a, r) => ({
    x: +(cx + r * Math.cos(a)).toFixed(1),
    y: +(cy + r * Math.sin(a)).toFixed(1),
  });

  let gridHTML = "";
  for (const scale of [0.33, 0.66, 1]) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const { x, y } = toXY(startAngle + (i * 2 * Math.PI) / n, R * scale);
      pts.push(x + "," + y);
    }
    gridHTML +=
      '<polygon points="' +
      pts.join(" ") +
      '" fill="none" stroke="var(--agd-surface-3)" stroke-width="0.5"/>';
  }

  let axesHTML = "";
  for (let i = 0; i < n; i++) {
    const { x, y } = toXY(startAngle + (i * 2 * Math.PI) / n, R);
    axesHTML +=
      '<line x1="' +
      cx +
      '" y1="' +
      cy +
      '" x2="' +
      x +
      '" y2="' +
      y +
      '" stroke="var(--agd-surface-3)" stroke-width="0.5"/>';
  }

  const dataPts = [];
  let dotsHTML = "";
  for (let i = 0; i < n; i++) {
    const { x, y } = toXY(
      startAngle + (i * 2 * Math.PI) / n,
      (R * RADAR_DIMS[i].value) / 100,
    );
    dataPts.push(x + "," + y);
    dotsHTML +=
      '<circle cx="' +
      x +
      '" cy="' +
      y +
      '" r="2.5" fill="' +
      color +
      '" class="agd-radar-dot" style="animation-delay:' +
      i * 120 +
      'ms"/>';
  }

  let labelsHTML = "";
  for (let i = 0; i < n; i++) {
    const a = startAngle + (i * 2 * Math.PI) / n;
    const { x, y } = toXY(a, R + 14);
    const cosA = Math.cos(a),
      sinA = Math.sin(a);
    const anchor =
      Math.abs(cosA) < 0.15 ? "middle" : cosA > 0 ? "start" : "end";
    const dy = sinA > 0.3 ? "1em" : sinA < -0.3 ? "-0.2em" : "0.35em";
    labelsHTML +=
      '<text x="' +
      x +
      '" y="' +
      y +
      '" text-anchor="' +
      anchor +
      '" dy="' +
      dy +
      '" class="agd-radar-label">' +
      RADAR_DIMS[i].label +
      "</text>";
  }

  let legendHTML = "";
  RADAR_DIMS.forEach((d) => {
    legendHTML +=
      '<div class="agd-radar-item"><span class="agd-radar-dim">' +
      d.label +
      '</span><span class="agd-radar-val" style="color:' +
      color +
      '">' +
      d.value +
      "</span></div>";
  });

  return (
    '<div class="agd-chart-block"><div class="agd-chart-hdr"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="' +
    color +
    '" stroke-width="2"><polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5"/></svg><span class="agd-chart-title" style="color:' +
    color +
    '">數位五維分析</span></div><div class="agd-radar-row"><svg class="agd-radar-svg" viewBox="0 0 120 120">' +
    gridHTML +
    axesHTML +
    '<polygon points="' +
    dataPts.join(" ") +
    '" class="agd-radar-area"/>' +
    dotsHTML +
    labelsHTML +
    '</svg><div class="agd-radar-legend">' +
    legendHTML +
    "</div></div></div>"
  );
};

// Gauge chart for needs agent (digital readiness)
const buildGaugeChartHTML = () => {
  const score = 52,
    color = "#2874a6";
  const cx = 60,
    cy = 55,
    r = 40;
  const semiC = Math.PI * r;
  const fillLen = (score / 100) * semiC;
  const arcPath =
    "M " +
    (cx - r) +
    " " +
    cy +
    " A " +
    r +
    " " +
    r +
    " 0 0 1 " +
    (cx + r) +
    " " +
    cy;
  const needleAngle = (score / 100) * 180;

  return (
    '<div class="agd-chart-block"><div class="agd-chart-hdr"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="' +
    color +
    '" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg><span class="agd-chart-title" style="color:' +
    color +
    '">數位成熟度</span><span class="agd-chart-val" style="color:' +
    color +
    '">' +
    score +
    '<small>/100</small></span></div><svg class="agd-gauge-svg" viewBox="0 0 120 70"><defs><linearGradient id="agd-gauge-grad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#c94444"/><stop offset="40%" stop-color="#D2691E"/><stop offset="70%" stop-color="#2d7d5f"/><stop offset="100%" stop-color="#2d7d5f"/></linearGradient></defs><path d="' +
    arcPath +
    '" fill="none" stroke="var(--agd-surface-3)" stroke-width="10" stroke-linecap="round"/><path d="' +
    arcPath +
    '" fill="none" stroke="url(#agd-gauge-grad)" stroke-width="10" stroke-linecap="round" class="agd-gauge-fill" stroke-dasharray="0 ' +
    semiC.toFixed(1) +
    '" data-target="' +
    fillLen.toFixed(1) +
    " " +
    (semiC - fillLen).toFixed(1) +
    '"/><g class="agd-gauge-needle-g" data-angle="' +
    needleAngle.toFixed(1) +
    '"><line x1="' +
    cx +
    '" y1="' +
    cy +
    '" x2="' +
    (cx - r + 8) +
    '" y2="' +
    cy +
    '" stroke="#D2691E" stroke-width="2" stroke-linecap="round"/></g><circle cx="' +
    cx +
    '" cy="' +
    cy +
    '" r="4" fill="' +
    color +
    '"/><text x="' +
    (cx - r) +
    '" y="' +
    (cy + 14) +
    '" class="agd-gauge-label" text-anchor="middle">0</text><text x="' +
    cx +
    '" y="' +
    (cy - r - 4) +
    '" class="agd-gauge-label" text-anchor="middle">50</text><text x="' +
    (cx + r) +
    '" y="' +
    (cy + 14) +
    '" class="agd-gauge-label" text-anchor="middle">100</text></svg></div>'
  );
};

// Bar chart for match agent (plan comparison)
const PLAN_SCORES = [
  { plan: "靜態站", score: 35, color: "#9ca3af" },
  { plan: "WordPress", score: 72, color: "#2874a6" },
  { plan: "組件式", score: 94, color: "#D2691E" },
  { plan: "電商加裝", score: 89, color: "#2d7d5f" },
];

const buildPlanBarChartHTML = () => {
  const color = "#D2691E";
  const maxScore = 100;

  let barsHTML = "";
  PLAN_SCORES.forEach((d, i) => {
    const pct = (d.score / maxScore) * 100;
    barsHTML +=
      '<div class="agd-wp-row" style="animation-delay:' +
      i * 80 +
      'ms"><span class="agd-wp-day">' +
      d.plan +
      '</span><div class="agd-wp-bar-wrap"><div class="agd-wp-bar-fill" style="width:0;background:' +
      d.color +
      '" data-w="' +
      pct +
      '%"></div></div><span class="agd-wp-type" style="color:' +
      d.color +
      '">' +
      d.score +
      '%</span><span class="agd-wp-min">' +
      (d.score >= 89 ? "推薦" : "") +
      "</span></div>";
  });

  return (
    '<div class="agd-chart-block"><div class="agd-chart-hdr"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="' +
    color +
    '" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg><span class="agd-chart-title" style="color:' +
    color +
    '">方案適配度評分</span></div><div class="agd-wp-bars">' +
    barsHTML +
    "</div></div>"
  );
};

// Donut chart for budget agent (budget allocation)
const buildDonutChartHTML = () => {
  const r = 40,
    C = 2 * Math.PI * r,
    gap = 3;
  const segments = [
    { label: "組件式後台", pct: 39, color: "#D2691E" },
    { label: "電商模組", pct: 55, color: "#2874a6" },
    { label: "Google 商家", pct: 6, color: "#2d7d5f" },
  ];

  let cumOffset = 0,
    circlesHTML = "",
    legendHTML = "";
  segments.forEach((seg) => {
    const arcLen = (seg.pct / 100) * C - gap;
    const gapLen = C - arcLen;
    circlesHTML +=
      '<circle cx="50" cy="50" r="' +
      r +
      '" fill="none" stroke="' +
      seg.color +
      '" stroke-width="12" stroke-linecap="round" class="agd-donut-seg" stroke-dasharray="0 ' +
      C.toFixed(1) +
      '" stroke-dashoffset="' +
      (-cumOffset).toFixed(1) +
      '" data-target="' +
      arcLen.toFixed(1) +
      " " +
      gapLen.toFixed(1) +
      '"/>';
    cumOffset += (seg.pct / 100) * C;
    legendHTML +=
      '<div class="agd-donut-item"><span class="agd-donut-dot" style="background:' +
      seg.color +
      '"></span><span class="agd-donut-label">' +
      seg.label +
      '</span><span class="agd-donut-pct" style="color:' +
      seg.color +
      '">$' +
      (seg.pct === 39 ? "13.5K" : seg.pct === 55 ? "19K" : "2K") +
      "</span></div>";
  });

  return (
    '<div class="agd-chart-block"><div class="agd-chart-hdr"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--agd-budget)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg><span class="agd-chart-title" style="color:var(--agd-budget)">預算分配</span><span class="agd-chart-val" style="color:var(--agd-budget)">$34.5K</span></div><div class="agd-donut-row"><svg class="agd-donut-svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="' +
    r +
    '" fill="none" stroke="var(--agd-surface-3)" stroke-width="12"/>' +
    circlesHTML +
    '</svg><div class="agd-donut-legend">' +
    legendHTML +
    "</div></div></div>"
  );
};

// Savings comparison multi-line chart
const OUR_COST = [
  34.5, 34.5, 34.5, 34.5, 34.5, 34.5, 34.5, 34.5, 34.5, 34.5, 34.5, 34.5,
];
const MARKET_COST = [80, 80, 83, 83, 86, 86, 89, 89, 92, 92, 95, 95];

const buildSavingsChartHTML = () => {
  const W = 300,
    H = 70,
    pad = 6;
  const allData = [...OUR_COST, ...MARKET_COST];
  const min = Math.min(...allData) - 5;
  const max = Math.max(...allData) + 5;
  const range = max - min;
  const ourColor = "#2d7d5f",
    marketColor = "#9ca3af";

  const toPoints = (data) =>
    data
      .map((v, i) => {
        const x = ((i * W) / (data.length - 1)).toFixed(1);
        const y = (pad + (1 - (v - min) / range) * (H - 2 * pad)).toFixed(1);
        return x + "," + y;
      })
      .join(" ");

  const ourLine = toPoints(OUR_COST);
  const marketLine = toPoints(MARKET_COST);
  const areaPoints = "0," + H + " " + marketLine + " " + W + "," + H;

  return (
    '<div class="agd-chart-block"><div class="agd-chart-hdr"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="' +
    ourColor +
    '" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg><span class="agd-chart-title" style="color:' +
    ourColor +
    '">3 年成本比較（萬）</span><span class="agd-chart-val" style="color:' +
    ourColor +
    '">省 57%</span></div><svg class="agd-multiline-svg" viewBox="0 0 ' +
    W +
    " " +
    H +
    '"><defs><linearGradient id="agd-sv-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="' +
    marketColor +
    '" stop-opacity="0.12"/><stop offset="100%" stop-color="' +
    marketColor +
    '" stop-opacity="0.01"/></linearGradient></defs><polygon points="' +
    areaPoints +
    '" fill="url(#agd-sv-grad)"/><polyline points="' +
    marketLine +
    '" fill="none" stroke="' +
    marketColor +
    '" stroke-width="1.5" stroke-dasharray="4 3" stroke-linejoin="round"/><polyline points="' +
    ourLine +
    '" fill="none" stroke="' +
    ourColor +
    '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg><div class="agd-ml-legend"><div class="agd-ml-item"><span class="agd-ml-line" style="background:' +
    ourColor +
    '"></span><span>AI 智能大腦 $34.5K</span></div><div class="agd-ml-item"><span class="agd-ml-line agd-ml-dashed" style="border-color:' +
    marketColor +
    '"></span><span>設計公司 $80K~95K</span></div></div></div>'
  );
};

// Budget time bar
const buildBudgetBarHTML = () => {
  const items = [
    { label: "組件式後台", amount: 13.5, color: "var(--agd-match)" },
    { label: "電商模組", amount: 19, color: "var(--agd-needs)" },
    { label: "Google 商家", amount: 2, color: "var(--agd-budget)" },
  ];
  const total = items.reduce((s, i) => s + i.amount, 0);

  let barHTML = "",
    legendHTML = "";
  items.forEach((item) => {
    const pct = ((item.amount / total) * 100).toFixed(1);
    barHTML +=
      '<div class="agd-tbar-seg" style="width:0;background:' +
      item.color +
      '" data-w="' +
      pct +
      '%"></div>';
    legendHTML +=
      '<div class="agd-tbar-item"><span class="agd-tbar-dot" style="background:' +
      item.color +
      '"></span><span>' +
      item.label +
      '</span><span class="agd-tbar-hrs">$' +
      item.amount +
      "K</span></div>";
  });

  return (
    '<div class="agd-chart-block"><div class="agd-chart-hdr"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--agd-primary)" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span class="agd-chart-title" style="color:var(--agd-primary)">費用組成</span></div><div class="agd-tbar">' +
    barHTML +
    '</div><div class="agd-tbar-legend">' +
    legendHTML +
    "</div></div>"
  );
};

// ===== MAIN EXPORT =====
function runAgentDemo(container) {
  let aborted = false;
  const intervals = [];
  let animFrameId = null;

  const qs = (sel) => container.querySelector(sel);
  const stage = qs(".agd-main");
  const elapsedEl = qs(".elapsed-time");
  const mAgentsEl = qs(".m-agents");
  const mConfEl = qs(".m-conf");
  const canvas = qs(".agd-particles");

  let elapsedSec = 0;
  let elapsedInterval = null;

  const updateElapsed = () => {
    const m = String(Math.floor(elapsedSec / 60)).padStart(2, "0");
    const s = String(elapsedSec % 60).padStart(2, "0");
    if (elapsedEl) elapsedEl.textContent = m + ":" + s;
  };

  const startTimer = () => {
    elapsedSec = 0;
    updateElapsed();
    elapsedInterval = setInterval(() => {
      elapsedSec++;
      updateElapsed();
    }, 1000);
    intervals.push(elapsedInterval);
  };

  const stopTimer = () => {
    if (elapsedInterval) clearInterval(elapsedInterval);
  };

  const updateMetric = (el, val) => {
    if (el) el.textContent = val;
  };

  // Smooth scroll
  const scheduleFrame = (cb) => {
    if (document.hidden) setTimeout(() => cb(performance.now()), 16);
    else requestAnimationFrame(cb);
  };

  const smoothScrollTo = (el, duration = 1000) => {
    return new Promise((resolve) => {
      const elRect = el.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const targetTop =
        elRect.bottom - stageRect.top + stage.scrollTop - stageRect.height + 64;
      if (targetTop <= stage.scrollTop) {
        resolve();
        return;
      }
      const startTop = stage.scrollTop;
      const distance = targetTop - startTop;
      const startTime = performance.now();
      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
      const step = (currentTime) => {
        if (aborted) {
          resolve();
          return;
        }
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        stage.scrollTop = startTop + distance * easeOutCubic(progress);
        if (progress < 1) scheduleFrame(step);
        else resolve();
      };
      scheduleFrame(step);
    });
  };

  const keepInView = (el) => {
    const elRect = el.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const overshoot = elRect.bottom - stageRect.bottom + 64;
    if (overshoot > 0) stage.scrollTop += overshoot;
  };

  // Typewriter
  const typeText = async (el, text, speed = 35) => {
    el.textContent = "";
    el.classList.add("typing-cursor");
    for (let i = 0; i < text.length; i++) {
      if (aborted) {
        el.textContent = text;
        el.classList.remove("typing-cursor");
        return;
      }
      el.textContent += text[i];
      if (text[i] !== " ") await wait(speed);
      if (i % 10 === 0) keepInView(el);
    }
    keepInView(el);
    el.classList.remove("typing-cursor");
  };

  const typeTextWithBreaks = async (el, text, speed = 30) => {
    el.innerHTML = "";
    el.classList.add("typing-cursor");
    for (let i = 0; i < text.length; i++) {
      if (aborted) {
        el.innerHTML = text.replace(/\n/g, "<br>");
        el.classList.remove("typing-cursor");
        return;
      }
      if (text[i] === "\n") {
        el.appendChild(document.createElement("br"));
        keepInView(el);
      } else el.appendChild(document.createTextNode(text[i]));
      if (text[i] !== " " && text[i] !== "\n") await wait(speed);
      if (i % 10 === 0) keepInView(el);
    }
    keepInView(el);
    el.classList.remove("typing-cursor");
  };

  // Particles
  if (canvas) {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      let W = 800,
        H = 600;
      const ps = [];
      const resize = () => {
        const rect = container.getBoundingClientRect();
        W = canvas.width = rect.width;
        H = canvas.height = rect.height;
      };
      resize();
      window.addEventListener("resize", resize);
      for (let i = 0; i < 35; i++) {
        ps.push({
          x: Math.random() * (W || 800),
          y: Math.random() * (H || 600),
          r: Math.random() * 1.5 + 0.5,
          dx: (Math.random() - 0.5) * 0.25,
          dy: (Math.random() - 0.5) * 0.25,
          a: Math.random() * 0.2 + 0.03,
        });
      }
      const draw = () => {
        if (aborted) return;
        ctx.clearRect(0, 0, W, H);
        ps.forEach((p) => {
          p.x += p.dx;
          p.y += p.dy;
          if (p.x < 0) p.x = W;
          if (p.x > W) p.x = 0;
          if (p.y < 0) p.y = H;
          if (p.y > H) p.y = 0;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(210,105,30," + p.a * 0.4 + ")";
          ctx.fill();
        });
        animFrameId = requestAnimationFrame(draw);
      };
      draw();
    }
  }

  // Animate agent
  const animateAgent = async (agent, idx) => {
    if (aborted) return;
    updateMetric(mAgentsEl, idx + "/3");

    const card = makeEl("div", "agent-card");
    card.innerHTML =
      '<div class="agent-hdr"><div class="agent-icon-box" style="background:' +
      agent.glow +
      ";border:1px solid " +
      agent.color +
      ";color:" +
      agent.color +
      '">' +
      agent.icon +
      '</div><div class="agent-name" style="color:' +
      agent.color +
      '">' +
      agent.name +
      '</div><div class="agent-badge run"><span class="spin"></span>執行中</div></div>' +
      (agent.cover
        ? '<div class="agent-cover"><img src="' +
          agent.cover +
          '" alt="" loading="eager"></div>'
        : "") +
      '<div class="agent-body"></div>';
    stage.appendChild(card);
    await wait(300);
    if (aborted) return;
    card.classList.add("visible");
    await smoothScrollTo(card);
    await wait(600);
    if (aborted) return;

    const body = card.querySelector(".agent-body");
    card.classList.add("agd-processing");

    // Scan bar
    const scanBar = makeEl("div", "scan-bar");
    scanBar.style.background =
      "linear-gradient(90deg, transparent 0%, " +
      agent.colorHex +
      " 50%, transparent 100%)";
    scanBar.style.backgroundSize = "200% 100%";
    body.appendChild(scanBar);
    await showEl(scanBar, 100);

    // Data loading
    const loadBlock = makeEl("div", "agd-load-block");
    loadBlock.innerHTML =
      '<div class="agd-load-label" style="color:' +
      agent.color +
      '"><span class="agd-proc-spin" style="border-top-color:' +
      agent.color +
      '"></span>資料載入</div>';

    const loadItems = [];
    for (const src of agent.ingest) {
      const item = makeEl("div", "agd-load-item");
      item.innerHTML =
        '<div class="agd-load-status"><span class="agd-load-icon">\u25CB</span></div><div class="agd-load-info"><div class="agd-load-name">' +
        src.src +
        '</div><div class="agd-load-desc">' +
        src.desc +
        '</div><div class="agd-load-bar"><div class="agd-load-fill" style="background:' +
        agent.color +
        '"></div></div></div><div class="agd-load-pct">\u2014</div>';
      loadBlock.appendChild(item);
      loadItems.push(item);
    }
    body.appendChild(loadBlock);
    await showEl(loadBlock, 200);
    await smoothScrollTo(loadBlock);
    if (aborted) return;

    for (const item of loadItems) {
      if (aborted) return;
      item.classList.add("active");
      item.querySelector(".agd-load-icon").textContent = "\u27F3";
      const fill = item.querySelector(".agd-load-fill");
      const pctEl = item.querySelector(".agd-load-pct");
      let pct = 0;
      await new Promise((resolve) => {
        const iv = setInterval(() => {
          if (aborted) {
            clearInterval(iv);
            resolve();
            return;
          }
          pct = Math.min(pct + Math.floor(Math.random() * 6 + 1), 100);
          fill.style.width = pct + "%";
          pctEl.textContent = pct + "%";
          if (pct >= 100) {
            clearInterval(iv);
            resolve();
          }
        }, 30);
        intervals.push(iv);
      });
      item.classList.remove("active");
      item.classList.add("done");
      item.querySelector(".agd-load-icon").textContent = "\u2713";
      keepInView(item);
      await wait(200);
    }

    await wait(500);
    loadBlock.classList.add("fade-out");
    await wait(400);
    loadBlock.remove();

    // Thinking
    const thinkRow = makeEl(
      "div",
      "thinking-row",
      '<div class="thinking-dots" style="color:' +
        agent.colorHex +
        '"><div class="thinking-dot"></div><div class="thinking-dot"></div><div class="thinking-dot"></div></div><span>深度分析推理中...</span>',
    );
    body.appendChild(thinkRow);
    await showEl(thinkRow, 300);
    await smoothScrollTo(thinkRow);
    await wait(1800);
    if (aborted) return;

    // Reasoning chain
    const rBlock = makeEl("div", "reasoning");
    rBlock.innerHTML =
      '<div class="r-label" style="color:' +
      agent.color +
      '"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/><circle cx="12" cy="12" r="3"/></svg>推理鏈</div>';
    body.appendChild(rBlock);
    await showEl(rBlock, 200);
    await smoothScrollTo(rBlock);
    thinkRow.remove();

    for (const step of agent.reasoning) {
      const sEl = makeEl(
        "div",
        "r-step " + (step.cls || ""),
        '<span class="op" style="color:' +
          agent.color +
          '">' +
          step.op +
          '</span><span class="arrow">&rarr;</span><span class="val"></span>',
      );
      rBlock.appendChild(sEl);
      await showEl(sEl, 400);
      await smoothScrollTo(sEl);
      const valSpan = sEl.querySelector(".val");
      await typeText(valSpan, step.text, 35);
      if (aborted) return;
    }
    await wait(800);
    scanBar.remove();

    // Confidence
    const thinkRow3 = makeEl(
      "div",
      "thinking-row",
      '<div class="thinking-dots" style="color:' +
        agent.colorHex +
        '"><div class="thinking-dot"></div><div class="thinking-dot"></div><div class="thinking-dot"></div></div><span>評估信心指數...</span>',
    );
    body.appendChild(thinkRow3);
    await showEl(thinkRow3, 300);
    await smoothScrollTo(thinkRow3);
    await wait(900);
    if (aborted) return;
    thinkRow3.remove();

    for (const c of agent.confidence) {
      const row = makeEl(
        "div",
        "confidence-row",
        '<div class="conf-label">' +
          c.label +
          '</div><div class="conf-bar"><div class="conf-fill" style="background:' +
          c.color +
          '"></div></div><div class="conf-val" style="color:' +
          c.color +
          '">0%</div>',
      );
      body.appendChild(row);
      await showEl(row, 300);
      const fill = row.querySelector(".conf-fill");
      const val = row.querySelector(".conf-val");
      fill.style.width = c.pct + "%";
      let cur = 0;
      const iv = setInterval(() => {
        cur += 2;
        if (cur > c.pct) cur = c.pct;
        val.textContent = cur + "%";
        if (cur >= c.pct) clearInterval(iv);
      }, 20);
      intervals.push(iv);
      await smoothScrollTo(row);
      if (aborted) return;
    }
    await wait(1200);
    updateMetric(
      mConfEl,
      Math.round(
        agent.confidence.reduce((a, c) => a + c.pct, 0) /
          agent.confidence.length,
      ) + "%",
    );

    // Progress
    const pRow = makeEl(
      "div",
      "progress-row",
      '<span>彙整中</span><div class="progress-bar-wrap"><div class="progress-fill" style="background:' +
        agent.color +
        '"></div></div><span class="pnum">0%</span>',
    );
    body.appendChild(pRow);
    const pFill = pRow.querySelector(".progress-fill");
    const pNum = pRow.querySelector(".pnum");
    pFill.style.width = "100%";
    let pc = 0;
    const pIv = setInterval(() => {
      pc += 2;
      if (pc > 100) pc = 100;
      pNum.textContent = pc + "%";
      if (pc >= 100) clearInterval(pIv);
    }, 25);
    intervals.push(pIv);
    await wait(2000);
    if (aborted) return;

    // Agent-specific charts
    if (agent.id === "needs") {
      const tmp = document.createElement("div");
      tmp.innerHTML = buildRadarChartHTML();
      const chartBlock = tmp.firstElementChild;
      body.appendChild(chartBlock);
      await showEl(chartBlock, 400);
      await smoothScrollTo(chartBlock);
      if (aborted) return;
      await wait(200);
      const radarSvg = chartBlock.querySelector(".agd-radar-svg");
      if (radarSvg) radarSvg.classList.add("revealed");
      await wait(1400);
      if (aborted) return;

      const gTmp = document.createElement("div");
      gTmp.innerHTML = buildGaugeChartHTML();
      const gaugeBlock = gTmp.firstElementChild;
      body.appendChild(gaugeBlock);
      await showEl(gaugeBlock, 400);
      await smoothScrollTo(gaugeBlock);
      if (aborted) return;
      await wait(200);
      const gaugeFill = gaugeBlock.querySelector(".agd-gauge-fill");
      if (gaugeFill) {
        const target = gaugeFill.getAttribute("data-target");
        if (target) gaugeFill.setAttribute("stroke-dasharray", target);
      }
      const needleG = gaugeBlock.querySelector(".agd-gauge-needle-g");
      if (needleG) {
        const angle = needleG.getAttribute("data-angle");
        if (angle) needleG.style.transform = "rotate(" + angle + "deg)";
      }
      await wait(1600);
      if (aborted) return;
    } else if (agent.id === "match") {
      const tmp = document.createElement("div");
      tmp.innerHTML = buildPlanBarChartHTML();
      const chartBlock = tmp.firstElementChild;
      body.appendChild(chartBlock);
      await showEl(chartBlock, 400);
      await smoothScrollTo(chartBlock);
      if (aborted) return;
      await wait(200);
      const wpBars = chartBlock.querySelectorAll(".agd-wp-bar-fill");
      wpBars.forEach((bar, i) => {
        setTimeout(() => {
          bar.style.width = bar.dataset.w || "0";
        }, i * 100);
      });
      await wait(wpBars.length * 100 + 800);
      if (aborted) return;
    } else if (agent.id === "budget") {
      const tmp = document.createElement("div");
      tmp.innerHTML = buildDonutChartHTML();
      const chartBlock = tmp.firstElementChild;
      body.appendChild(chartBlock);
      await showEl(chartBlock, 400);
      await smoothScrollTo(chartBlock);
      if (aborted) return;
      await wait(300);
      const segs = chartBlock.querySelectorAll(".agd-donut-seg");
      segs.forEach((seg, i) => {
        setTimeout(() => {
          if (aborted) return;
          const target = seg.getAttribute("data-target");
          if (target) seg.setAttribute("stroke-dasharray", target);
        }, i * 250);
      });
      await wait(segs.length * 250 + 800);
      if (aborted) return;

      const mlTmp = document.createElement("div");
      mlTmp.innerHTML = buildSavingsChartHTML();
      const mlBlock = mlTmp.firstElementChild;
      body.appendChild(mlBlock);
      await showEl(mlBlock, 400);
      await smoothScrollTo(mlBlock);
      if (aborted) return;
      await wait(100);
      const mlSvg = mlBlock.querySelector(".agd-multiline-svg");
      if (mlSvg) mlSvg.classList.add("revealed");
      await wait(1600);
      if (aborted) return;
    }

    // Results grid
    const grid = makeEl("div", "results-grid");
    agent.results.forEach((r) => {
      const c = makeEl(
        "div",
        "result-card",
        '<div class="result-label">' +
          r.label +
          '</div><div class="result-value" style="color:' +
          r.color +
          '">' +
          r.value +
          '</div><div class="result-sub">' +
          r.sub +
          '</div><div class="result-spark">' +
          makeMeaningfulSparkline(r.label, r.color, 8) +
          "</div>",
      );
      grid.appendChild(c);
    });
    body.appendChild(grid);
    for (const c of Array.from(grid.children)) {
      await showEl(c, 350);
      await smoothScrollTo(c);
      if (aborted) return;
    }
    await wait(700);

    // Recommendation
    const rec = makeEl("div", "rec-block");
    rec.style.background = agent.glow;
    rec.style.borderColor = agent.color;
    rec.innerHTML =
      (agent.recImg
        ? '<div class="rec-thumb"><img src="' + agent.recImg + '" alt=""></div>'
        : "") +
      '<div class="rec-content"><div class="rec-title" style="color:' +
      agent.color +
      '">' +
      agent.rec.title +
      '</div><div class="rec-text"></div></div>';
    body.appendChild(rec);
    await showEl(rec, 300);
    await smoothScrollTo(rec);
    const recTextEl = rec.querySelector(".rec-text");
    await typeTextWithBreaks(recTextEl, agent.rec.text, 30);

    card.classList.remove("agd-processing");

    const badge = card.querySelector(".agent-badge");
    badge.className = "agent-badge done";
    badge.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M20 6 9 17l-5-5"/></svg> 完成';
    updateMetric(mAgentsEl, idx + 1 + "/3");
    await wait(700);
    if (aborted) return;

    // Communication
    if (agent.commOut) {
      const comm = makeEl(
        "div",
        "agent-comm",
        '<span class="comm-from" style="color:' +
          agent.color +
          '">' +
          agent.name.replace("代理", "") +
          '</span><div class="comm-arrow-box"><div class="comm-dot" style="background:' +
          agent.colorHex +
          '"></div><div class="comm-dot" style="background:' +
          agent.colorHex +
          '"></div><div class="comm-dot" style="background:' +
          agent.colorHex +
          '"></div><div class="comm-dot" style="background:' +
          agent.colorHex +
          '"></div></div><span class="comm-to">' +
          agent.commOut.to +
          '</span><span class="comm-msg">' +
          agent.commOut.msg +
          "</span>",
      );
      body.appendChild(comm);
      await showEl(comm, 300);
      await smoothScrollTo(comm);
      await wait(900);
      if (aborted) return;
    }

    // Phase transition
    if (idx < AGENTS.length - 1) {
      const nextAgent = AGENTS[idx + 1];
      const transition = makeEl(
        "div",
        "phase-transition",
        '<div class="phase-label">資料傳輸中</div><div class="phase-flow"><div class="phase-node" style="background:' +
          agent.colorHex +
          '"></div><div class="phase-line" style="background:linear-gradient(90deg, transparent, ' +
          agent.colorHex +
          ", " +
          nextAgent.colorHex +
          ', transparent)"></div><div class="phase-node" style="background:' +
          nextAgent.colorHex +
          '"></div></div>',
      );
      stage.appendChild(transition);
      await showEl(transition, 300);
      await smoothScrollTo(transition);
      await wait(2000);
      if (aborted) return;
      transition.remove();
    }

    await wait(300);
  };

  // Summary
  const renderSummary = async () => {
    if (aborted) return;
    const card = makeEl("div", "summary-card");
    card.innerHTML =
      '<div class="summary-banner"><img src="images/agent-demo/summary-banner.jpg" alt=""></div>' +
      '<div class="summary-title">AI 為你的客戶產出的完整規劃</div><div class="plan-list"></div>';
    stage.appendChild(card);
    await wait(300);
    card.classList.add("visible");
    await smoothScrollTo(card);
    await wait(600);

    const list = card.querySelector(".plan-list");
    for (const p of PLAN) {
      const row = makeEl(
        "div",
        "plan-row",
        '<div class="plan-time" style="color:' +
          p.color +
          '">' +
          p.time +
          '</div><div class="plan-desc"></div><span class="plan-tag" style="background:' +
          p.color +
          "18;color:" +
          p.color +
          '">' +
          p.tag +
          "</span>",
      );
      list.appendChild(row);
      await showEl(row, 400);
      const descEl = row.querySelector(".plan-desc");
      await typeText(descEl, p.desc, 30);
      await smoothScrollTo(row);
      if (aborted) return;
    }
    await wait(1200);

    if (!aborted) {
      const tbarTmp = document.createElement("div");
      tbarTmp.innerHTML = buildBudgetBarHTML();
      const tbarBlock = tbarTmp.firstElementChild;
      card.appendChild(tbarBlock);
      await showEl(tbarBlock, 400);
      await smoothScrollTo(tbarBlock);
      await wait(200);
      const tbarSegs = tbarBlock.querySelectorAll(".agd-tbar-seg");
      tbarSegs.forEach((seg, i) => {
        setTimeout(() => {
          seg.style.width = seg.dataset.w || "0";
        }, i * 150);
      });
      await wait(tbarSegs.length * 150 + 1000);
    }
  };

  // Replay overlay
  const showReplayOverlay = () => {
    const existing = container.querySelector(".agd-replay-overlay");
    if (existing) existing.remove();

    const overlay = makeEl("div", "agd-replay-overlay");
    overlay.innerHTML =
      '<div class="agd-replay-inner"><div class="agd-replay-check"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10" stroke-opacity="0.2"/><path d="M8 12l3 3 5-5"/></svg></div><div class="agd-replay-label">這就是 AI 驅動的客戶體驗</div><div class="agd-replay-sub">想讓你的網站也能這樣自動服務每一位客戶？</div><div class="agd-replay-actions"><button class="agd-replay-btn" type="button"><svg class="agd-replay-icon" viewBox="0 0 24 24" fill="currentColor"><polygon points="8,5 19,12 8,19"/></svg><span>再次模擬</span></button><a class="agd-contact-btn" href="https://line.me/ti/p/5gW0er9baG" target="_blank" rel="noopener"><svg class="agd-replay-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>LINE 免費諮詢</span></a></div></div>';
    container.appendChild(overlay);

    const scrollHint = qs(".agd-scroll-hint");
    if (scrollHint) scrollHint.style.opacity = "0";

    requestAnimationFrame(() => {
      overlay.classList.add("visible");
    });

    const statusDot = qs(".agd-status-dot");
    const statusSpan = qs(".agd-status span:last-child");
    if (statusDot) {
      statusDot.style.animation = "none";
      statusDot.style.background = "var(--agd-budget)";
    }
    if (statusSpan) statusSpan.textContent = "分析完成";

    const btn = overlay.querySelector(".agd-replay-btn");
    btn.addEventListener("click", () => {
      overlay.classList.remove("visible");
      setTimeout(() => {
        overlay.remove();
        intervals.forEach((iv) => clearInterval(iv));
        intervals.length = 0;
        elapsedSec = 0;
        stage.scrollTop = 0;
        if (statusDot) {
          statusDot.style.animation = "";
          statusDot.style.background = "";
        }
        if (statusSpan) statusSpan.textContent = "模擬分析中";
        if (scrollHint) scrollHint.style.opacity = "1";
        run();
      }, 400);
    });
  };

  // Main
  const run = async () => {
    stage.innerHTML = "";
    updateMetric(mAgentsEl, "0/3");
    updateMetric(mConfEl, "\u2014");
    startTimer();

    // Client brief
    const member = makeEl("div", "agent-card");
    member.innerHTML =
      '<div class="agent-hdr" style="border:none"><img class="member-portrait" src="images/agent-demo/client-portrait.jpg" alt="林小姐"><div style="flex:1"><div class="agd-member-name">💡 情境模擬 <span class="agd-member-meta">你的客戶造訪你的網站</span></div><div class="agd-member-tags">林小姐 · 32 歲 · Sugar Lane 手工甜點 · 創業第 2 年 · IG 3,200 粉絲 · 想轉線上銷售</div></div></div>';
    stage.appendChild(member);
    await wait(300);
    if (aborted) return;
    member.classList.add("visible");
    await smoothScrollTo(member);
    await wait(600);

    for (let i = 0; i < AGENTS.length; i++) {
      if (aborted) return;
      await animateAgent(AGENTS[i], i);
    }

    stopTimer();
    await renderSummary();
    if (aborted) return;
    showReplayOverlay();
  };

  run();

  return () => {
    aborted = true;
    intervals.forEach((iv) => clearInterval(iv));
    if (animFrameId !== null) cancelAnimationFrame(animFrameId);
    if (elapsedInterval) clearInterval(elapsedInterval);
  };
}
