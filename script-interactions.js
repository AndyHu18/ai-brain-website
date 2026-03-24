/**
 * @file    : script-interactions.js
 * @purpose : 表單處理、影片、聲音控制、計數動畫
 * @depends : ['script-navigation.js']
 * @lines   : ~110
 */

/**
 * 聯繫表單處理
 */
function initContactForm() {
  const form = document.getElementById("contactForm");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // 顯示載入狀態
    submitBtn.textContent = "送出中...";
    submitBtn.disabled = true;

    // 模擬提交（實際使用時替換為真實 API 呼叫）
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 顯示成功訊息
    submitBtn.textContent = "✓ 已送出！";
    submitBtn.style.background =
      "linear-gradient(135deg, #10B981 0%, #059669 100%)";

    // 重置表單
    setTimeout(() => {
      form.reset();
      submitBtn.textContent = originalText;
      submitBtn.style.background = "";
      submitBtn.disabled = false;
    }, 2000);
  });
}

/**
 * 影片載入失敗時的備用方案
 */
function initVideoFallback() {
  const video = document.getElementById("heroVideo");
  const heroSection = document.querySelector(".hero");

  if (video) {
    video.addEventListener("error", () => {
      // 如果影片載入失敗，使用暖色漸層背景作為備用
      heroSection.style.background = `
                linear-gradient(
                    135deg,
                    #FDF9F3 0%,
                    rgba(210, 105, 30, 0.1) 50%,
                    rgba(205, 133, 63, 0.05) 100%
                )
            `;
      video.parentElement.style.display = "none";
    });

    // 檢查影片來源是否存在
    // 注意: file:// 協議不支援 fetch，跳過檢查
    const source = video.querySelector("source");
    if (source && !window.location.protocol.startsWith("file")) {
      fetch(source.src, { method: "HEAD" }).catch(() => {
        video.dispatchEvent(new Event("error"));
      });
    }
  }
}

/**
 * 數字計數動畫 (可選功能)
 */
function animateCounter(element, target, duration = 2000) {
  let start = 0;
  const increment = target / (duration / 16);

  const timer = setInterval(() => {
    start += increment;
    if (start >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(start);
    }
  }, 16);
}

/**
 * 聲音控制功能
 * 因瀏覽器政策限制，影片預設靜音，用戶點擊後可開啟聲音
 */
function initSoundToggle() {
  const soundToggle = document.getElementById("soundToggle");
  const video = document.getElementById("heroVideo");
  const soundOn = soundToggle?.querySelector(".sound-on");
  const soundOff = soundToggle?.querySelector(".sound-off");

  if (!soundToggle || !video) return;

  soundToggle.addEventListener("click", () => {
    if (video.muted) {
      // 開啟聲音
      video.muted = false;
      video.volume = 0.5; // 設定適中音量
      soundToggle.classList.add("active");
      soundOn.style.display = "inline";
      soundOff.style.display = "none";
    } else {
      // 關閉聲音
      video.muted = true;
      soundToggle.classList.remove("active");
      soundOn.style.display = "none";
      soundOff.style.display = "inline";
    }
  });
}

/**
 * 初始化所有功能
 * 入口點：由 HTML 載入後執行
 */
/**
 * 案例影片：點擊整個畫面即可播放/暫停
 * 自動注入播放覆蓋按鈕到每個 .phone-frame
 */
function initVideoClickToPlay() {
  const playSvg =
    '<svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="28" cy="28" r="28" fill="rgba(255,255,255,0.9)"/><polygon points="22,16 42,28 22,40" fill="#1a0f0a"/></svg>';

  document.querySelectorAll(".phone-frame").forEach((frame) => {
    const video = frame.querySelector("video");
    if (!video) return;

    frame.style.cursor = "pointer";

    // 注入播放覆蓋按鈕（inline style 避免合併 CSS 遺漏）
    const overlay = document.createElement("div");
    overlay.innerHTML = playSvg;
    Object.assign(overlay.style, {
      position: "absolute",
      inset: "0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: "4",
      borderRadius: "22px",
      background: "rgba(0,0,0,0.25)",
      transition: "opacity 0.3s",
    });
    const svg = overlay.querySelector("svg");
    Object.assign(svg.style, {
      width: "56px",
      height: "56px",
      filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))",
    });
    frame.appendChild(overlay);

    const showOverlay = () => {
      overlay.style.opacity = "1";
      overlay.style.pointerEvents = "auto";
    };
    const hideOverlay = () => {
      overlay.style.opacity = "0";
      overlay.style.pointerEvents = "none";
    };

    // overlay 點擊播放，之後原生 controls 接管
    overlay.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      video.play();
      hideOverlay();
    });

    // 影片結束或被原生 controls 暫停時，重新顯示 overlay
    video.addEventListener("ended", showOverlay);
    video.addEventListener("pause", () => {
      // 只在影片不是剛開始播放的瞬間才顯示（避免 play/pause 競爭）
      setTimeout(() => {
        if (video.paused) showOverlay();
      }, 100);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // initNavigation, initSmoothScroll, initScrollAnimations
  // 已在 script-navigation.js 中初始化，不重複呼叫
  initContactForm();
  initVideoFallback();
  initSoundToggle();
  initVideoClickToPlay();
});
