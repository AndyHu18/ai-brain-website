// pricing.js — Extracted from pricing.html inline scripts
// Generated: 2026-03-18

// ── Navigation, Floating CTA, Fade-up, Section Nav, Typewriter, Price Bars ──
// 初始化共用導航（與首頁統一）
initNavigation();
initSmoothScroll();

// Floating LINE CTA visibility
const floatingLineCta = document.getElementById("floatingLineCta");
const observer1 = new IntersectionObserver(
  ([entry]) => {
    floatingLineCta.classList.toggle("visible", !entry.isIntersecting);
  },
  { threshold: 0 },
);
observer1.observe(document.querySelector(".hero"));

// Fade-up on scroll
const fadeEls = document.querySelectorAll(".fade-up");
const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
);
fadeEls.forEach((el) => fadeObserver.observe(el));

// Section nav: dynamically match navbar height (must track scroll too —
// navbar shrinks when .navbar-scrolled is added)
const navbarEl = document.getElementById("navbar");
const sectionNavEl = document.getElementById("sectionNav");
if (navbarEl && sectionNavEl) {
  let lastH = 0;
  const updateNavTop = () => {
    const h = navbarEl.offsetHeight;
    if (h !== lastH) {
      lastH = h;
      sectionNavEl.style.top = h + "px";
      document.documentElement.style.setProperty("--navbar-height", h + "px");
    }
  };
  updateNavTop();
  window.addEventListener("resize", updateNavTop);
  window.addEventListener("load", updateNavTop);
  window.addEventListener("scroll", updateNavTop, { passive: true });
}

// Section nav active state
const sectionNavLinks = document.querySelectorAll(".section-nav a");
const sections = document.querySelectorAll(".section[id]");
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        sectionNavLinks.forEach((link) => {
          link.classList.toggle("active", link.dataset.section === id);
        });
      }
    });
  },
  { threshold: 0.3, rootMargin: "-80px 0px -50% 0px" },
);
sections.forEach((s) => sectionObserver.observe(s));

// Typewriter effect for hero title
const typewriterText = "讓網站自己招攬客戶";
const typewriterEl = document.getElementById("typewriter-text");
const highlightEl = document.querySelector(".typewriter-highlight");
const cursorEl = document.querySelector(".typewriter-cursor");
let charIndex = 0;

function typeNextChar() {
  if (charIndex < typewriterText.length) {
    typewriterEl.textContent += typewriterText[charIndex];
    charIndex++;
    setTimeout(typeNextChar, 120);
  } else {
    // Typing done — show highlight line, fade in subtitle, hide cursor
    highlightEl.style.opacity = "1";
    const heroSub = document.querySelector(".hero-sub");
    if (heroSub) heroSub.style.opacity = "1";
    setTimeout(() => {
      cursorEl.style.display = "none";
    }, 600);
  }
}

// Start typing — hero is always visible on load
setTimeout(typeNextChar, 500);

// ── Animated price comparison bars ──
document.querySelectorAll(".price-visual").forEach((visual) => {
  // Store original widths and set to 0
  const bars = visual.querySelectorAll(".pv-ours-bar, .pv-range");
  bars.forEach((bar) => {
    const w = bar.style.width;
    if (w) {
      bar.dataset.targetWidth = w;
      bar.style.width = "0%";
      // Position label based on bar position and width
      const widthPct = parseInt(w, 10);
      const leftPct = parseInt(bar.style.left, 10) || 0;
      const rightEdge = leftPct + widthPct;
      const label = bar.querySelector(".pv-range-text");
      if (label) {
        if (widthPct >= 60 || (rightEdge >= 70 && widthPct >= 25)) {
          // Wide bar or near right edge with enough room: text inside
          label.classList.add("pv-text-inside");
        } else if (rightEdge >= 70) {
          // Narrow bar near right edge: text to the left
          label.classList.add("pv-text-left");
        }
      }
    }
  });

  const pvObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        pvObserver.unobserve(entry.target);
        // Small delay then animate bars sequentially
        const rows = entry.target.querySelectorAll(".price-visual-row");
        rows.forEach((row, i) => {
          const bar = row.querySelector(".pv-ours-bar, .pv-range");
          if (bar && bar.dataset.targetWidth) {
            setTimeout(() => {
              bar.style.width = bar.dataset.targetWidth;
            }, i * 300);
          }
        });
        // Add animated class for text/badge fade-ins
        setTimeout(() => {
          entry.target.classList.add("pv-animated");
        }, 200);
      }
    },
    { threshold: 0.3 },
  );
  pvObserver.observe(visual);
});

// ── Agent Demo IntersectionObserver ──
(function () {
  const container = document.querySelector(".agent-demo-section");
  if (!container) return;
  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        io.disconnect();
        runAgentDemo(container);
      }
    },
    { threshold: 0.1 },
  );
  io.observe(container);
})();

// ── Charts: Radar, Multiplier, Staircase ──
// ── Radar Chart (SVG) ──
(function () {
  const svg = document.getElementById("radarChart");
  if (!svg) return;

  const cx = 140,
    cy = 140,
    maxR = 110;
  const dims = ["操作門檻", "擴展性", "維護成本低", "客製自由度", "生態系統"];
  // Scores out of 10
  const wpScores = [9, 5, 3, 4, 9]; // WordPress
  const compScores = [8, 9, 9, 9, 6]; // 組件式

  const angleStep = (2 * Math.PI) / dims.length;
  const startAngle = -Math.PI / 2;

  function polarToXY(score, i) {
    const angle = startAngle + i * angleStep;
    const r = (score / 10) * maxR;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  }

  function makePath(scores) {
    return (
      scores
        .map((s, i) => {
          const [x, y] = polarToXY(s, i);
          return (i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1);
        })
        .join(" ") + " Z"
    );
  }

  // Grid rings
  [0.25, 0.5, 0.75, 1].forEach((pct) => {
    const r = maxR * pct;
    const points = dims.map((_, i) => {
      const angle = startAngle + i * angleStep;
      return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
    });
    const d =
      points
        .map(
          (p, i) =>
            (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1),
        )
        .join(" ") + " Z";
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#e8e0d8");
    path.setAttribute("stroke-width", pct === 1 ? "1.5" : "0.8");
    svg.appendChild(path);
  });

  // Axis lines
  dims.forEach((_, i) => {
    const [x, y] = polarToXY(10, i);
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", cx);
    line.setAttribute("y1", cy);
    line.setAttribute("x2", x.toFixed(1));
    line.setAttribute("y2", y.toFixed(1));
    line.setAttribute("stroke", "#e8e0d8");
    line.setAttribute("stroke-width", "0.8");
    svg.appendChild(line);
  });

  // Labels
  dims.forEach((label, i) => {
    const [x, y] = polarToXY(11.5, i);
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x.toFixed(1));
    text.setAttribute("y", y.toFixed(1));
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("font-size", "13");
    text.setAttribute("font-weight", "700");
    text.setAttribute("fill", "#374151");
    text.textContent = label;
    svg.appendChild(text);
  });

  // WordPress polygon
  const wpPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  wpPath.setAttribute("d", makePath(wpScores.map(() => 0)));
  wpPath.setAttribute("fill", "rgba(139, 69, 83, 0.25)");
  wpPath.setAttribute("stroke", "rgba(139, 69, 83, 0.85)");
  wpPath.setAttribute("stroke-width", "2.5");
  wpPath.id = "radarWP";
  svg.appendChild(wpPath);

  // Component polygon
  const compPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path",
  );
  compPath.setAttribute("d", makePath(compScores.map(() => 0)));
  compPath.setAttribute("fill", "rgba(210, 105, 30, 0.22)");
  compPath.setAttribute("stroke", "rgba(210, 105, 30, 0.85)");
  compPath.setAttribute("stroke-width", "2.5");
  compPath.id = "radarComp";
  svg.appendChild(compPath);

  // Dots
  wpScores.forEach((s, i) => {
    const dot = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    const [x, y] = polarToXY(s, i);
    dot.setAttribute("cx", cx);
    dot.setAttribute("cy", cy);
    dot.setAttribute("r", "4");
    dot.setAttribute("fill", "#8b4553");
    dot.classList.add("radar-dot-wp");
    dot.dataset.tx = x.toFixed(1);
    dot.dataset.ty = y.toFixed(1);
    svg.appendChild(dot);
  });

  compScores.forEach((s, i) => {
    const dot = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    const [x, y] = polarToXY(s, i);
    dot.setAttribute("cx", cx);
    dot.setAttribute("cy", cy);
    dot.setAttribute("r", "4");
    dot.setAttribute("fill", "#d2691e");
    dot.classList.add("radar-dot-comp");
    dot.dataset.tx = x.toFixed(1);
    dot.dataset.ty = y.toFixed(1);
    svg.appendChild(dot);
  });

  // Animate on scroll
  const radarObs = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        radarObs.disconnect();
        let progress = 0;
        const dur = 60;
        function step() {
          progress++;
          const t = Math.min(progress / dur, 1);
          const ease = 1 - Math.pow(1 - t, 3);

          const wpAnimated = wpScores.map((s) => s * ease);
          const compAnimated = compScores.map((s) => s * ease);

          wpPath.setAttribute("d", makePath(wpAnimated));
          compPath.setAttribute("d", makePath(compAnimated));

          document.querySelectorAll(".radar-dot-wp").forEach((dot, i) => {
            const [x, y] = polarToXY(wpAnimated[i], i);
            dot.setAttribute("cx", x.toFixed(1));
            dot.setAttribute("cy", y.toFixed(1));
          });
          document.querySelectorAll(".radar-dot-comp").forEach((dot, i) => {
            const [x, y] = polarToXY(compAnimated[i], i);
            dot.setAttribute("cx", x.toFixed(1));
            dot.setAttribute("cy", y.toFixed(1));
          });

          if (t < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }
    },
    { threshold: 0.3 },
  );
  radarObs.observe(svg.closest(".radar-compare"));
})();

// ── Multiplier Chart Animation ──
(function () {
  const chart = document.getElementById("multiplierChart");
  if (!chart) return;
  const bars = chart.querySelectorAll(".multiplier-bar");

  const mulObs = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        mulObs.disconnect();
        bars.forEach((bar, i) => {
          const targetW = bar.dataset.width;
          setTimeout(() => {
            bar.style.width = targetW;
          }, i * 120);
        });
      }
    },
    { threshold: 0.2 },
  );
  mulObs.observe(chart);
})();

// ── Staircase Chart Animation ──
(function () {
  const stair = document.getElementById("stairChart");
  if (!stair) return;
  const bars = stair.querySelectorAll(".stair-bar");

  const stairObs = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        stairObs.disconnect();
        bars.forEach((bar, i) => {
          const h = bar.dataset.height;
          setTimeout(() => {
            bar.style.height = h + "px";
          }, i * 200);
        });
        setTimeout(() => {
          stair.classList.add("stair-animated");
        }, 800);
      }
    },
    { threshold: 0.3 },
  );
  stairObs.observe(stair);
})();

// ── Section Podcast Player ──
(() => {
  const audio = new Audio();
  let activePlayer = null;

  const formatTime = (s) => {
    if (isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ":" + String(sec).padStart(2, "0");
  };

  // Generate wave bars for each player
  document.querySelectorAll(".section-player").forEach((player) => {
    const wave = player.querySelector(".sp-wave");
    for (let i = 0; i < 24; i++) {
      const bar = document.createElement("div");
      bar.className = "sp-wave-bar";
      bar.style.height = 3 + Math.random() * 10 + "px";
      wave.appendChild(bar);
    }
  });

  const resetPlayer = (player) => {
    player.classList.remove("playing");
    player.querySelector(".sp-icon-play").style.display = "";
    player.querySelector(".sp-icon-pause").style.display = "none";
    player.querySelectorAll(".sp-wave-bar").forEach((b) => {
      b.style.height = 3 + Math.random() * 10 + "px";
    });
  };

  const playTrack = (player) => {
    ensureAudioContext();
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    if (activePlayer && activePlayer !== player) {
      resetPlayer(activePlayer);
    }

    const src = player.dataset.src;
    const fullSrc = new URL(src, location.href).href;
    if (audio.src !== fullSrc) {
      audio.src = src;
    }

    activePlayer = player;
    audio.play();
  };

  const togglePlay = (player) => {
    if (activePlayer === player && !audio.paused) {
      audio.pause();
    } else {
      playTrack(player);
    }
  };

  audio.addEventListener("play", () => {
    if (!activePlayer) return;
    activePlayer.classList.add("playing");
    activePlayer.querySelector(".sp-icon-play").style.display = "none";
    activePlayer.querySelector(".sp-icon-pause").style.display = "";
  });

  audio.addEventListener("pause", () => {
    if (!activePlayer) return;
    activePlayer.classList.remove("playing");
    activePlayer.querySelector(".sp-icon-play").style.display = "";
    activePlayer.querySelector(".sp-icon-pause").style.display = "none";
  });

  audio.addEventListener("timeupdate", () => {
    if (!activePlayer || !audio.duration) return;
    const progress = activePlayer.querySelector(".sp-progress");
    const timeEl = activePlayer.querySelector(".sp-time");
    progress.value = (audio.currentTime / audio.duration) * 100;
    timeEl.textContent =
      formatTime(audio.currentTime) + " / " + formatTime(audio.duration);
  });

  audio.addEventListener("ended", () => {
    if (!activePlayer) return;
    resetPlayer(activePlayer);
    activePlayer.querySelector(".sp-progress").value = 0;
    activePlayer.querySelector(".sp-time").textContent = "0:00";
  });

  // Click handlers
  document.querySelectorAll(".section-player").forEach((player) => {
    player.querySelector(".sp-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      togglePlay(player);
    });
    const progress = player.querySelector(".sp-progress");
    progress.addEventListener("input", () => {
      if (activePlayer === player && audio.duration) {
        audio.currentTime = (progress.value / 100) * audio.duration;
      } else if (activePlayer !== player) {
        playTrack(player);
        const seekTo = () => {
          if (audio.duration) {
            audio.currentTime = (progress.value / 100) * audio.duration;
            audio.removeEventListener("loadedmetadata", seekTo);
          }
        };
        audio.addEventListener("loadedmetadata", seekTo);
      }
    });
  });

  // Web Audio API — real frequency-driven wave animation
  let audioCtx = null;
  let analyser = null;
  let sourceConnected = false;

  const ensureAudioContext = () => {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.75;
    const source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    sourceConnected = true;
  };

  // Attach context on first user interaction (autoplay policy)
  const initOnce = () => {
    ensureAudioContext();
    document.removeEventListener("click", initOnce);
  };
  document.addEventListener("click", initOnce);

  const freqData = new Uint8Array(32);
  let lastWaveTime = 0;

  const updateWave = (timestamp) => {
    if (activePlayer && !audio.paused && analyser) {
      // Throttle to ~30fps for smoother visual transitions
      if (timestamp - lastWaveTime > 33) {
        lastWaveTime = timestamp;
        analyser.getByteFrequencyData(freqData);
        const bars = activePlayer.querySelectorAll(".sp-wave-bar");
        const barCount = bars.length;
        const step = freqData.length / barCount;
        bars.forEach((bar, i) => {
          const idx = Math.floor(i * step);
          const val = freqData[idx] || 0;
          // Map 0-255 to 4-30px height
          const h = 4 + (val / 255) * 26;
          bar.style.height = h + "px";
        });
      }
    }
    requestAnimationFrame(updateWave);
  };
  requestAnimationFrame(updateWave);
})();

// ── FAB Typewriter (disabled) ──
(function () {
  const LINE_PHRASES = [
    "想聊聊？加 LINE 最快",
    "有問題直接問，不綁約",
    "聊完就有方向",
    "加好友，方案帶著走",
  ];

  function fabTypewriter(el, phrases) {
    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let pauseTimer = null;

    const cursor = document.createElement("span");
    cursor.className = "fab-cursor";
    el.appendChild(cursor);

    function tick() {
      const current = phrases[phraseIdx];
      if (!isDeleting) {
        el.firstChild && el.firstChild.nodeType === 3
          ? (el.firstChild.textContent = current.slice(0, charIdx + 1))
          : el.insertBefore(
              document.createTextNode(current.slice(0, charIdx + 1)),
              cursor,
            );
        charIdx++;
        if (charIdx >= current.length) {
          el.classList.add("typing");
          pauseTimer = setTimeout(function () {
            isDeleting = true;
            tick();
          }, 3000);
          return;
        }
        el.classList.add("typing");
        setTimeout(tick, 80);
      } else {
        charIdx--;
        if (el.firstChild && el.firstChild.nodeType === 3) {
          el.firstChild.textContent = current.slice(0, charIdx);
        }
        if (charIdx <= 0) {
          isDeleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          el.classList.remove("typing");
          setTimeout(tick, 600);
          return;
        }
        setTimeout(tick, 40);
      }
    }

    // Start after random delay so two labels don't sync
    setTimeout(tick, 1000 + Math.random() * 2000);
  }

  // LINE 輪播標籤已關閉
  // const lineLabel = document.getElementById("lineFabLabel");
  // if (lineLabel) fabTypewriter(lineLabel, LINE_PHRASES);
})();
