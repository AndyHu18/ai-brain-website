/**
 * AI Brain Podcast Player
 * Handles both full (multi-episode) and mini (single-episode) players
 */
(function () {
  "use strict";

  const BAR_COUNT = 24;
  const PLAY_SVG =
    '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6,3 20,12 6,21"/></svg>';
  const PAUSE_SVG =
    '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="4" width="4" height="16"/><rect x="15" y="4" width="4" height="16"/></svg>';

  let audioEl = null;
  let audioCtx = null;
  let analyser = null;
  let sourceNode = null;
  let animId = null;
  let activePlayer = null; // currently playing player element

  const formatTime = (s) => {
    if (isNaN(s) || !isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ":" + (sec < 10 ? "0" : "") + sec;
  };

  const initAudio = () => {
    if (!audioEl) {
      audioEl = document.createElement("audio");
      audioEl.preload = "metadata";
      document.body.appendChild(audioEl);
    }
  };

  const initAudioContext = () => {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.75;
    sourceNode = audioCtx.createMediaElementSource(audioEl);
    sourceNode.connect(analyser);
    analyser.connect(audioCtx.destination);
  };

  const generateWaveBars = (container) => {
    container.innerHTML = "";
    for (let i = 0; i < BAR_COUNT; i++) {
      const bar = document.createElement("span");
      bar.style.height = Math.random() * 8 + 3 + "px";
      container.appendChild(bar);
    }
  };

  /**
   * Initialize a full player (landing-page style with multiple episodes)
   */
  const initFullPlayer = (section) => {
    const episodes = section.querySelectorAll(".abp-ep");
    if (episodes.length === 0) return;

    episodes.forEach((ep) => {
      // Generate wave bars
      const wave = ep.querySelector(".abp-wave");
      if (wave) generateWaveBars(wave);

      // Click episode to select it
      ep.addEventListener("click", (e) => {
        // Don't toggle if clicking play button or progress bar
        if (
          e.target.closest(".abp-play-btn") ||
          e.target.closest(".abp-progress-bar")
        )
          return;

        const wasActive = ep.classList.contains("active");
        episodes.forEach((other) => other.classList.remove("active"));
        if (!wasActive) {
          ep.classList.add("active");
          loadEpisode(ep);
        }
      });

      // Play button
      const playBtn = ep.querySelector(".abp-play-btn");
      if (playBtn) {
        playBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          // Activate this episode
          episodes.forEach((other) => other.classList.remove("active"));
          ep.classList.add("active");
          togglePlay(ep);
        });
      }

      // Progress bar seek
      const progressBar = ep.querySelector(".abp-progress-bar");
      if (progressBar) {
        progressBar.addEventListener("click", (e) => {
          e.stopPropagation();
          if (!audioEl || !audioEl.duration) return;
          const rect = progressBar.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          audioEl.currentTime = pct * audioEl.duration;
        });
      }
    });

    // Auto-activate first episode
    episodes[0].classList.add("active");
  };

  /**
   * Initialize a mini player (single episode)
   */
  const initMiniPlayer = (container) => {
    const wave = container.querySelector(".abp-wave");
    if (wave) generateWaveBars(wave);

    const playBtn = container.querySelector(".abp-play-btn");
    if (playBtn) {
      playBtn.addEventListener("click", () => {
        togglePlay(container);
      });
    }

    const progressBar = container.querySelector(".abp-progress-bar");
    if (progressBar) {
      progressBar.addEventListener("click", (e) => {
        if (!audioEl || !audioEl.duration) return;
        const rect = progressBar.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        audioEl.currentTime = pct * audioEl.duration;
      });
    }
  };

  /**
   * Load an episode's audio source (if not already loaded)
   */
  const loadEpisode = (playerEl) => {
    initAudio();
    const src = playerEl.dataset.src;
    if (!src || audioEl.dataset.loadedSrc === src) return;

    audioEl.src = src;
    audioEl.dataset.loadedSrc = src;
    audioEl.load();

    // Update duration when metadata loads
    audioEl.addEventListener(
      "loadedmetadata",
      () => {
        const totalEl = playerEl.querySelector(".abp-time-total");
        if (totalEl) totalEl.textContent = formatTime(audioEl.duration);
        const durEl = playerEl.querySelector(".abp-ep-duration");
        if (durEl && durEl.textContent === "0:00")
          durEl.textContent = formatTime(audioEl.duration);
      },
      { once: true },
    );
  };

  /**
   * Toggle play/pause for a player element
   */
  const togglePlay = (playerEl) => {
    initAudio();
    const src = playerEl.dataset.src;
    if (!src) return;

    // If switching to a different episode
    if (audioEl.dataset.loadedSrc !== src) {
      // Pause previous
      if (activePlayer) {
        resetPlayerUI(activePlayer);
      }
      loadEpisode(playerEl);
      audioEl.play().then(() => {
        initAudioContext();
        if (audioCtx.state === "suspended") audioCtx.resume();
      });
      setPlayingUI(playerEl);
      activePlayer = playerEl;
      return;
    }

    // Same episode: toggle
    if (audioEl.paused) {
      audioEl.play().then(() => {
        initAudioContext();
        if (audioCtx.state === "suspended") audioCtx.resume();
      });
      setPlayingUI(playerEl);
      activePlayer = playerEl;
    } else {
      audioEl.pause();
      resetPlayerUI(playerEl);
    }
  };

  const setPlayingUI = (playerEl) => {
    const btn = playerEl.querySelector(".abp-play-btn");
    const wave = playerEl.querySelector(".abp-wave");
    if (btn) {
      btn.innerHTML = PAUSE_SVG;
      btn.classList.add("playing");
    }
    if (wave) wave.classList.add("active");
    startUpdateLoop(playerEl);
  };

  const resetPlayerUI = (playerEl) => {
    const btn = playerEl.querySelector(".abp-play-btn");
    const wave = playerEl.querySelector(".abp-wave");
    if (btn) {
      btn.innerHTML = PLAY_SVG;
      btn.classList.remove("playing");
    }
    if (wave) wave.classList.remove("active");
    cancelAnimationFrame(animId);
  };

  /**
   * Progress + wave animation loop
   */
  let lastWaveTs = 0;

  const startUpdateLoop = (playerEl) => {
    cancelAnimationFrame(animId);

    const progressFill = playerEl.querySelector(".abp-progress-fill");
    const timeCurrent = playerEl.querySelector(".abp-time-current");
    const timeTotal = playerEl.querySelector(".abp-time-total");
    const wave = playerEl.querySelector(".abp-wave");
    const bars = wave ? wave.querySelectorAll("span") : [];

    const update = (ts) => {
      if (!audioEl || audioEl.paused) return;
      animId = requestAnimationFrame(update);

      // Progress
      if (audioEl.duration) {
        const pct = (audioEl.currentTime / audioEl.duration) * 100;
        if (progressFill) progressFill.style.width = pct + "%";
        if (timeCurrent)
          timeCurrent.textContent = formatTime(audioEl.currentTime);
        if (timeTotal) timeTotal.textContent = formatTime(audioEl.duration);
      }

      // Wave bars (~20fps)
      if (ts - lastWaveTs > 50 && analyser && bars.length > 0) {
        lastWaveTs = ts;
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const step = Math.floor(data.length / bars.length);
        bars.forEach((bar, i) => {
          const val = data[i * step] || 0;
          bar.style.height = (val / 255) * 16 + 2 + "px";
        });
      }
    };

    animId = requestAnimationFrame(update);
  };

  // Audio events
  const setupAudioEvents = () => {
    initAudio();

    audioEl.addEventListener("ended", () => {
      if (activePlayer) {
        resetPlayerUI(activePlayer);
        const fill = activePlayer.querySelector(".abp-progress-fill");
        if (fill) fill.style.width = "0%";
      }
    });

    audioEl.addEventListener("timeupdate", () => {
      if (!activePlayer || audioEl.paused) return;
      const progressFill = activePlayer.querySelector(".abp-progress-fill");
      const timeCurrent = activePlayer.querySelector(".abp-time-current");
      if (audioEl.duration) {
        const pct = (audioEl.currentTime / audioEl.duration) * 100;
        if (progressFill) progressFill.style.width = pct + "%";
        if (timeCurrent)
          timeCurrent.textContent = formatTime(audioEl.currentTime);
      }
    });
  };

  // Init all players on page
  const init = () => {
    setupAudioEvents();

    // Full players
    document.querySelectorAll(".abp-section").forEach(initFullPlayer);

    // Mini players
    document.querySelectorAll(".abp-mini").forEach(initMiniPlayer);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
