// 把 landing-page-v2.html 的 sections 重新排序輸出 landing-page-v4.html
// 改動:作品集前置 / 教學後置 / 中間加 3 個 CTA bar / 加 sticky navbar

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'landing-page-v2.html');
const DST = path.join(__dirname, 'landing-page-v4.html');

const raw = fs.readFileSync(SRC, 'utf-8');
const lines = raw.split('\n');

// 0-indexed,start/end 都是「行號 - 1」
function slice(startLine, endLine) {
  return lines.slice(startLine - 1, endLine).join('\n');
}

// === Chunk Map(基於 grep 出的 section 邊界)===
const CHUNK = {
  head:        slice(1, 37),     // <!doctype> + <head> + body 開頭 + portfolio-page 開頭
  hero:        slice(38, 61),    // Hero
  lab:         slice(60, 508),   // 5 個實驗(exp-lab #lab)
  fm:          slice(509, 939),  // 漏斗法(fm-section #funnel-method)+ leading style/comment
  s12:         slice(940, 1379), // 12 環節(s12-section #series-framework)
  worksFirst:  slice(1380, 1418),// AI 智能大腦(第 1 件)
  worksRest:   slice(1419, 1765),// pf-divider 精選作品展示 + 9 件其他作品
  caseVideo1:  slice(1766, 1809),// 第 1 段 case-video
  podcast:     slice(1808, 1924),// abp-section #podcast
  founder:     slice(1925, 1981),// pf-founder 創辦人對比
  caseVideo2:  slice(1982, 2021),// 第 2 段 case-video
  caseVideo3:  slice(2022, 2053),// 第 3 段 case-video
  pfCta:       slice(2054, 2087),// 原 pf-cta(打字機大標)
  expert:      slice(2088, 2194),// expert-section 專家對比
  footer:      slice(2195, 2201),// 頁尾
  floating:    slice(2202, 2214),// floating brain LINE 按鈕
  scripts:     slice(2215, 2643),// 全部 scripts(typewriter / observer / modal)
};

// === 新增區塊 ===

// Sticky scroll-aware navbar(下滑超過 80vh 才浮出)
const NAVBAR = `      <!-- ═══════ V4 STICKY NAVBAR(scroll-aware)═══════ -->
      <style>
        .v4-navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 9000;
          background: rgba(15, 8, 28, 0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(210, 105, 30, 0.25);
          transform: translateY(-110%); transition: transform 0.35s cubic-bezier(0.16,1,0.3,1);
          padding-top: env(safe-area-inset-top);
        }
        .v4-navbar.is-shown { transform: translateY(0); }
        .v4-navbar-inner {
          max-width: 1280px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 24px; gap: 16px;
        }
        .v4-navbar-brand {
          font-size: 16px; font-weight: 900; color: #fff; text-decoration: none;
          letter-spacing: 0.02em; white-space: nowrap;
        }
        .v4-navbar-brand .dot { color: #d2691e; }
        .v4-navbar-links {
          display: flex; gap: 4px; align-items: center; list-style: none; margin: 0; padding: 0;
        }
        .v4-navbar-links a {
          color: rgba(255,255,255,0.78); text-decoration: none;
          font-size: 13px; font-weight: 600; padding: 8px 14px;
          border-radius: 9999px; transition: all 0.2s ease;
          white-space: nowrap;
        }
        .v4-navbar-links a:hover { color: #fff; background: rgba(255,255,255,0.08); }
        .v4-navbar-cta {
          display: inline-flex; align-items: center; gap: 6px;
          background: linear-gradient(135deg, #d2691e, #b85a15);
          color: #fff; text-decoration: none;
          padding: 9px 18px; border-radius: 9999px;
          font-size: 13px; font-weight: 700; white-space: nowrap;
          box-shadow: 0 4px 14px rgba(210, 105, 30, 0.4);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .v4-navbar-cta:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(210, 105, 30, 0.55); }
        .v4-hamburger {
          display: none; flex-direction: column; justify-content: center; align-items: center;
          gap: 5px; width: 40px; height: 40px; border: 0; background: transparent;
          cursor: pointer; padding: 0;
        }
        .v4-hamburger span {
          display: block; width: 22px; height: 2px;
          background: #fff; border-radius: 2px;
          transition: transform 0.3s ease, opacity 0.2s ease;
        }
        .v4-mobile-panel {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: min(320px, 88vw); z-index: 9100;
          background: #0f081c;
          border-left: 1px solid rgba(210, 105, 30, 0.3);
          padding: 80px 24px 40px;
          transform: translateX(110%); transition: transform 0.35s cubic-bezier(0.16,1,0.3,1);
          display: flex; flex-direction: column; gap: 8px;
        }
        .v4-mobile-panel.is-open { transform: translateX(0); }
        .v4-mobile-panel a {
          color: rgba(255,255,255,0.85); text-decoration: none;
          padding: 14px 16px; border-radius: 12px;
          font-size: 15px; font-weight: 600;
          border: 1px solid rgba(255,255,255,0.08);
          transition: background 0.2s ease;
        }
        .v4-mobile-panel a:hover { background: rgba(210, 105, 30, 0.15); }
        .v4-mobile-panel .v4-navbar-cta { margin-top: 20px; justify-content: center; padding: 14px 18px; font-size: 15px; }
        .v4-mobile-overlay {
          position: fixed; inset: 0; z-index: 9050;
          background: rgba(0,0,0,0.55); backdrop-filter: blur(2px);
          opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
        }
        .v4-mobile-overlay.is-open { opacity: 1; pointer-events: auto; }

        @media (max-width: 768px) {
          .v4-navbar-links { display: none; }
          .v4-hamburger { display: flex; }
          .v4-navbar-cta { padding: 8px 14px; font-size: 12px; }
        }

        /* 不再新增浮動按鈕 — v2 原本的 .pf-floating-brain 已是 LINE 連結 */
      </style>

      <nav class="v4-navbar" id="v4Navbar" role="navigation" aria-label="主選單">
        <div class="v4-navbar-inner">
          <a href="#top" class="v4-navbar-brand">AI 智能大腦<span class="dot">.</span></a>
          <ul class="v4-navbar-links">
            <li><a href="#works">作品</a></li>
            <li><a href="#method">方法</a></li>
            <li><a href="#podcast">Podcast</a></li>
            <li><a href="#about">關於我</a></li>
          </ul>
          <a href="https://line.me/ti/p/5gW0er9baG" target="_blank" rel="noopener" class="v4-navbar-cta">
            <span>加 LINE 諮詢</span><span aria-hidden="true">→</span>
          </a>
          <button class="v4-hamburger" id="v4Hamburger" aria-label="開啟選單" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>
      <div class="v4-mobile-overlay" id="v4MobileOverlay" aria-hidden="true"></div>
      <aside class="v4-mobile-panel" id="v4MobilePanel" aria-label="行動選單" aria-hidden="true">
        <a href="#works">作品集</a>
        <a href="#method">我的方法</a>
        <a href="#podcast">Podcast</a>
        <a href="#about">關於我</a>
        <a href="#cta">預約諮詢</a>
        <a href="https://line.me/ti/p/5gW0er9baG" target="_blank" rel="noopener" class="v4-navbar-cta">
          <span>加 LINE 諮詢</span><span aria-hidden="true">→</span>
        </a>
      </aside>
      `;

// CTA bar 1:Hero 結束後立刻
const CTA_BAR_1 = `      <!-- ═══════ V4 CTA BAR 1(Hero 後)═══════ -->
      <style>
        .v4-cta-bar { padding: 32px 24px; background: linear-gradient(180deg, #0f081c 0%, #1a0f2e 100%); border-bottom: 1px solid rgba(210, 105, 30, 0.18); }
        .v4-cta-bar-inner { max-width: 980px; margin: 0 auto; display: flex; flex-wrap: wrap; gap: 16px; align-items: center; justify-content: center; text-align: center; }
        .v4-cta-bar-text { color: rgba(255,255,255,0.85); font-size: 15px; font-weight: 600; flex: 1 1 auto; min-width: 200px; }
        .v4-cta-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #d2691e, #b85a15);
          color: #fff; text-decoration: none;
          padding: 14px 28px; border-radius: 9999px;
          font-size: 14px; font-weight: 700; white-space: nowrap;
          box-shadow: 0 6px 20px rgba(210, 105, 30, 0.45);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .v4-cta-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 9px 26px rgba(210, 105, 30, 0.6); }
        .v4-cta-btn-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.08);
          color: #fff; text-decoration: none;
          padding: 14px 28px; border-radius: 9999px;
          font-size: 14px; font-weight: 600; white-space: nowrap;
          border: 1px solid rgba(255,255,255,0.18);
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .v4-cta-btn-secondary:hover { background: rgba(255,255,255,0.14); transform: translateY(-1px); }
        @media (max-width: 768px) {
          .v4-cta-bar-inner { flex-direction: column; gap: 12px; }
          .v4-cta-bar-text { flex: 1 1 100%; }
          .v4-cta-btn-primary, .v4-cta-btn-secondary { width: 100%; max-width: 320px; justify-content: center; }
        }
        @media (max-width: 480px) {
          .v4-cta-bar { padding: 22px 16px; }
          .v4-cta-bar-text { font-size: 14px; line-height: 1.6; }
          .v4-cta-btn-primary, .v4-cta-btn-secondary { padding: 12px 18px; font-size: 13px; }
        }
      </style>
      <section class="v4-cta-bar" aria-label="第一個成交路徑">
        <div class="v4-cta-bar-inner">
          <div class="v4-cta-bar-text">急著看作品?直接往下滑;想直接諮詢?點 LINE。</div>
          <a href="#works" class="v4-cta-btn-secondary"><span>↓ 直接看作品</span></a>
          <a href="https://line.me/ti/p/5gW0er9baG" target="_blank" rel="noopener" class="v4-cta-btn-primary"><span>加 LINE 諮詢</span><span aria-hidden="true">→</span></a>
        </div>
      </section>`;

// CTA bar 2:作品集後
const CTA_BAR_2 = `      <!-- ═══════ V4 CTA BAR 2(作品集後)═══════ -->
      <section class="v4-cta-bar" aria-label="第二個成交路徑" style="background: linear-gradient(180deg, #fdf3eb 0%, #f5efe6 100%); border-bottom: 1px solid rgba(210, 105, 30, 0.18);">
        <div class="v4-cta-bar-inner">
          <div class="v4-cta-bar-text" style="color: #4a3320;">看完作品有興趣?30 分鐘免費聊聊,診斷你的網站漏哪幾塊。</div>
          <a href="https://line.me/ti/p/5gW0er9baG" target="_blank" rel="noopener" class="v4-cta-btn-primary"><span>加 LINE 預約諮詢</span><span aria-hidden="true">→</span></a>
          <a href="#method" class="v4-cta-btn-secondary" style="background: rgba(74, 51, 32, 0.08); color: #4a3320; border-color: rgba(74, 51, 32, 0.2);"><span>↓ 想看我怎麼做</span></a>
        </div>
      </section>`;

// 分隔線:從作品集進到教學區的視覺斷點
const TEACH_DIVIDER = `      <!-- ═══════ V4 TEACH DIVIDER(教學區起點)═══════ -->
      <style>
        .v4-teach-divider { padding: 80px 24px 60px; background: #fffaf5; text-align: center; }
        .v4-teach-divider-eyebrow { display: inline-block; font-size: 11px; letter-spacing: 0.32em; text-transform: uppercase; color: #d2691e; font-weight: 700; margin-bottom: 16px; }
        .v4-teach-divider-title { font-size: clamp(1.6rem, 3vw + 1rem, 2.6rem); font-weight: 900; color: #2a1a08; line-height: 1.3; max-width: 720px; margin: 0 auto 12px; }
        .v4-teach-divider-title em { font-style: normal; color: #d2691e; }
        .v4-teach-divider-sub { font-size: 15px; color: #5a4530; max-width: 540px; margin: 0 auto; line-height: 1.7; }
        @media (max-width: 480px) {
          .v4-teach-divider { padding: 56px 16px 40px; }
        }
      </style>
      <section class="v4-teach-divider" id="method" aria-label="教學內容起點">
        <span class="v4-teach-divider-eyebrow">METHOD · 我的方法</span>
        <h2 class="v4-teach-divider-title">看完作品想知道<br />我<em>到底怎麼做的</em>?</h2>
        <p class="v4-teach-divider-sub">下面這幾段是我做網站的核心思考 — 5 個真線上實驗、漏斗結構、12 環節框架。<br />沒興趣可以直接點上方<a href="https://line.me/ti/p/5gW0er9baG" target="_blank" rel="noopener" style="color:#d2691e;font-weight:700;">加 LINE</a>跳過。</p>
      </section>`;

// 加在作品集第一件 section 上,讓 #works 錨點生效
// 作法:把 worksFirst 包在 `<div id="works">` 裡(不能改原 section 的 id 因為會破 CSS)
const WORKS_OPEN = `      <div id="works" aria-label="作品集">`;
const WORKS_CLOSE = `      </div><!-- /#works -->`;

// 給 pf-cta section 加 id="cta"(用 string replace)
const pfCtaWithId = CHUNK.pfCta.replace(
  '<section class="pf-cta">',
  '<section class="pf-cta" id="cta">'
);

// 給 founder section 加 id="about"(因為 nav about 對應)
const founderWithId = CHUNK.founder.replace(
  '<section class="pf-founder">',
  '<section class="pf-founder" id="about">'
);

// === 新增 V4 scroll-aware nav 行為 + body 開頭錨點 ===
const V4_INIT_SCRIPT = `
    <script>
      (function () {
        // ── Scroll-aware navbar(scroll > 80vh 才浮出)──
        const nav = document.getElementById('v4Navbar');
        const showThreshold = window.innerHeight * 0.8;
        let ticking = false;
        function onScroll() {
          if (!ticking) {
            window.requestAnimationFrame(function () {
              const y = window.scrollY || window.pageYOffset || 0;
              if (y > showThreshold) {
                nav.classList.add('is-shown');
              } else {
                nav.classList.remove('is-shown');
              }
              ticking = false;
            });
            ticking = true;
          }
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        // ── 漢堡選單 ──
        const ham = document.getElementById('v4Hamburger');
        const panel = document.getElementById('v4MobilePanel');
        const overlay = document.getElementById('v4MobileOverlay');
        function openPanel() {
          panel.classList.add('is-open'); overlay.classList.add('is-open');
          ham.setAttribute('aria-expanded', 'true');
          panel.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden';
        }
        function closePanel() {
          panel.classList.remove('is-open'); overlay.classList.remove('is-open');
          ham.setAttribute('aria-expanded', 'false');
          panel.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
        }
        ham.addEventListener('click', function () {
          panel.classList.contains('is-open') ? closePanel() : openPanel();
        });
        overlay.addEventListener('click', closePanel);
        panel.querySelectorAll('a').forEach(function (a) {
          a.addEventListener('click', closePanel);
        });
        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape' && panel.classList.contains('is-open')) closePanel();
        });

        // ── 平滑捲動到錨點(扣掉 navbar 高度)──
        document.querySelectorAll('a[href^="#"]').forEach(function (a) {
          a.addEventListener('click', function (e) {
            const id = a.getAttribute('href').slice(1);
            if (!id || id === 'top') {
              if (id === 'top') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
              return;
            }
            const target = document.getElementById(id);
            if (target) {
              e.preventDefault();
              const navH = nav.classList.contains('is-shown') ? 64 : 0;
              const top = target.getBoundingClientRect().top + window.scrollY - navH - 8;
              window.scrollTo({ top: top, behavior: 'smooth' });
            }
          });
        });
      })();
    </script>`;

// === 修改 head:title + 加 v4 識別 ===
const headV4 = CHUNK.head
  .replace('<title>作品集 — AI 智能大腦</title>', '<title>AI 智能大腦 · v4(作品優先版)</title>')
  .replace('<body>', '<body id="top">');

// === 重組順序 ===
const out = [
  headV4,
  NAVBAR,
  CHUNK.hero,
  CTA_BAR_1,
  WORKS_OPEN,
  CHUNK.worksFirst,
  CHUNK.worksRest,
  WORKS_CLOSE,
  CTA_BAR_2,
  TEACH_DIVIDER,
  CHUNK.lab,
  CHUNK.fm,
  CHUNK.s12,
  CHUNK.caseVideo1,
  CHUNK.caseVideo2,
  CHUNK.caseVideo3,
  founderWithId,
  CHUNK.expert,
  CHUNK.podcast,
  pfCtaWithId,
  CHUNK.footer,
  CHUNK.floating,
  CHUNK.scripts.replace('</body>', V4_INIT_SCRIPT + '\n  </body>'),
].join('\n');

fs.writeFileSync(DST, out, 'utf-8');
const dstLines = out.split('\n').length;
console.log(`✓ wrote ${DST}`);
console.log(`  v2 lines: ${lines.length}`);
console.log(`  v4 lines: ${dstLines}`);
