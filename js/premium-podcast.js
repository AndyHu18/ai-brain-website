/**
 * Premium Podcast Generator
 * Generates a two-person discussion using Claude (script) + Gemini TTS (voice) + Web Audio (BGM mix)
 */
const PremiumPodcast = (function () {
  "use strict";

  const CLAUDE_API = "/api/claude";
  const TTS_API = "/api/gemini-tts";
  const TTS_MODEL = "gemini-2.5-pro-preview-tts";

  const VOICE_HOST = "Kore"; // Female host
  const VOICE_GUEST = "Puck"; // Male expert guest

  const BGM_TRACKS = ["audio/bgm-luxury-1.mp3", "audio/bgm-luxury-2.mp3"];

  const SCRIPT_SYSTEM_PROMPT = `\u4F60\u662F\u4E00\u500B Podcast \u8173\u672C\u4F5C\u5BB6\u3002\u6839\u64DA\u7528\u6236\u63D0\u4F9B\u7684\u884C\u696D\u5206\u6790\uFF0C\u5BEB\u4E00\u6BB5\u55AE\u4EBA\u65C1\u767D\u8173\u672C\u3002

\u8AAA\u8A71\u8005\uFF1A\u4E00\u4F4D\u89AA\u5207\u5C08\u696D\u7684\u5973\u6027\u884C\u92B7\u9867\u554F\uFF0C\u7528\u767D\u8A71\u89E3\u91CB\u8907\u96DC\u6982\u5FF5

\u5167\u5BB9\u7D50\u69CB\uFF1A
1. \u958B\u5834\uFF0830\u5B57\uFF09\uFF1A\u6B61\u8FCE\u807D\u773E + \u5E36\u51FA\u4ECA\u5929\u884C\u696D
2. \u884C\u696D\u75DB\u9EDE\uFF08100\u5B57\uFF09\uFF1A\u9019\u500B\u884C\u696D\u7DB2\u7AD9\u884C\u92B7\u7684\u91CD\u9EDE\u548C\u75DB\u9EDE
3. AI \u89E3\u6C7A\u65B9\u6848\uFF08100\u5B57\uFF09\uFF1A\u5177\u9AD4\u600E\u9EBC\u7528 AI \u89E3\u6C7A
4. \u5834\u666F\u63CF\u7E6A\uFF0880\u5B57\uFF09\uFF1A\u7528\u5177\u9AD4\u5834\u666F\u5E6B\u807D\u773E\u770B\u5230\u756B\u9762\u2014\u2014\u63CF\u8FF0\u4E00\u500B\u5BA2\u6236\u5728\u4ED6\u5011\u7DB2\u7AD9\u4E0A\u7684\u771F\u5BE6\u4F7F\u7528\u9AD4\u9A57\uFF0C\u4F8B\u5982\uFF1A\u300C\u60F3\u50CF\u4E00\u4E0B\uFF0C\u665A\u4E0A\u5341\u9EDE\u6709\u500B\u5BA2\u6236\u6253\u958B\u60A8\u7684\u7DB2\u7AD9\uFF0CAI \u5BA2\u670D\u7ACB\u523B\u56DE\u61C9\u4ED6\u7684\u554F\u984C\u3001\u63A8\u85A6\u9069\u5408\u7684\u670D\u52D9\u3001\u5E6B\u4ED6\u9810\u7D04\u660E\u5929\u7684\u6642\u6BB5\u2026\u300D\u9019\u6A23\u7684\u5177\u9AD4\u63CF\u8FF0\uFF0C\u8B93\u807D\u773E\u611F\u53D7\u5230\u9019\u4E9B\u529F\u80FD\u5C31\u662F\u70BA\u4ED6\u7684\u751F\u610F\u8A2D\u8A08\u7684
5. \u53CE\u5C3E\uFF0830\u5B57\uFF09\uFF1A\u9F13\u52F5\u52A0 LINE \u514D\u8CBB\u8AEE\u8A62

\u56B4\u683C\u898F\u5247\uFF1A
- \u7E3D\u5B57\u6578\u63A7\u5236\u5728 300-400 \u5B57
- \u8AAA\u8A71\u98A8\u683C\u81EA\u7136\u53E3\u8A9E\u5316\uFF0C\u50CF\u771F\u4EBA\u8AAA\u8A71
- \u4E0D\u8981\u7528 markdown\u3001\u6A19\u984C\u3001\u7DE8\u865F\uFF0C\u7D14\u6587\u5B57\u6D41\u66A2\u8FF0\u8AAA
- \u670D\u52D9\u63A8\u85A6\u8981\u81EA\u7136\u4E0D\u751F\u786C
- \u4E0D\u8981\u63D0 SEO\uFF0C\u6539\u7528 AEO\uFF08AI \u641C\u5C0B\u5F15\u64CE\u512A\u5316\uFF09`;

  let floatPlayerEl = null;
  let audioContext = null;
  let currentSource = null;
  let audioBuffer = null;
  let startTime = 0;
  let pauseOffset = 0;
  let isPlaying = false;

  /**
   * Main generation pipeline
   */
  async function generate(industry, analysisHtml, onProgress) {
    // Step 1: Generate script via Claude
    onProgress("\u6b63\u5728\u64b0\u5beb\u8a0e\u8ad6\u8173\u672c...", 15);
    const script = await generateScript(industry, analysisHtml);

    // Step 2: Split script into TTS segments
    onProgress("\u6b63\u5728\u62c6\u5206\u8173\u672c...", 25);
    const segments = splitScript(script);

    // Step 3: Generate TTS audio for each segment
    onProgress("\u6b63\u5728\u751f\u6210\u8a9e\u97f3...", 35);
    const audioChunks = [];
    for (let i = 0; i < segments.length; i++) {
      onProgress(
        "\u8a9e\u97f3\u751f\u6210\u4e2d (" +
          (i + 1) +
          "/" +
          segments.length +
          ")...",
        35 + (i / segments.length) * 35,
      );
      const chunk = await generateTTS(segments[i]);
      if (chunk) audioChunks.push(chunk);
    }

    if (audioChunks.length === 0)
      throw new Error("\u8a9e\u97f3\u751f\u6210\u5931\u6557");

    // Step 4: Mix with BGM
    onProgress("\u6b63\u5728\u6df7\u97f3\u8655\u7406...", 75);
    await mixWithBGM(audioChunks, industry);

    // Step 5: Show floating player
    onProgress("\u5b8c\u6210\uff01", 100);
    showFloatingPlayer(industry);
  }

  /**
   * Generate discussion script via Claude
   */
  async function generateScript(industry, analysisHtml) {
    // Strip HTML tags to get plain text
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = analysisHtml;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";

    const res = await fetch(CLAUDE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        system: SCRIPT_SYSTEM_PROMPT,
        temperature: 0.85,
        messages: [
          {
            role: "user",
            content:
              "\u884C\u696D\uFF1A" +
              industry +
              "\n\n\u5206\u6790\u5167\u5BB9\uFF1A\n" +
              plainText.slice(0, 1500),
          },
        ],
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Claude API \u5931\u6557");
    return data.content?.[0]?.text || data.text || "";
  }

  /**
   * Split script into TTS-friendly segments (< 4000 bytes each)
   * Each segment contains dialogue with speaker labels for multi-speaker TTS
   */
  function splitScript(script) {
    const lines = script.split("\n").filter((l) => l.trim());
    const segments = [];
    let current = [];
    let currentBytes = 0;

    for (const line of lines) {
      const lineBytes = new TextEncoder().encode(line).length;
      if (currentBytes + lineBytes > 3500 && current.length > 0) {
        segments.push(current.join("\n"));
        current = [];
        currentBytes = 0;
      }
      current.push(line);
      currentBytes += lineBytes + 1;
    }
    if (current.length > 0) segments.push(current.join("\n"));

    return segments;
  }

  /**
   * Generate TTS audio for a script segment
   * Returns base64 audio data or null on failure
   */
  async function generateTTS(segmentText) {
    // Clean up text for TTS: strip labels, markdown, and empty lines
    const ttsText = segmentText
      .replace(/\[主持人\]\s*/g, "")
      .replace(/\[來賓\]\s*/g, "")
      .replace(/^#{1,6}\s+.*$/gm, "")
      .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
      .replace(/^[-=]{3,}$/gm, "")
      .replace(/\n{2,}/g, "\n")
      .trim();

    if (!ttsText || ttsText.length < 5) return null;

    const requestBody = {
      model: TTS_MODEL,
      contents: [
        {
          parts: [{ text: ttsText }],
        },
      ],
      generationConfig: {
        response_modalities: ["AUDIO"],
        speech_config: {
          voice_config: {
            prebuilt_voice_config: { voice_name: VOICE_HOST },
          },
        },
      },
    };

    try {
      const res = await fetch(TTS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.error?.message || data.error || "TTS API \u5931\u6557",
        );

      // Extract audio from response
      const parts = data.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType?.startsWith("audio/")) {
          return {
            data: part.inlineData.data,
            mimeType: part.inlineData.mimeType,
          };
        }
      }
      return null;
    } catch (err) {
      console.warn("[PremiumPodcast] TTS segment failed:", err);
      return null;
    }
  }

  /**
   * Mix TTS audio chunks with BGM using Web Audio API
   */
  async function mixWithBGM(audioChunks, industry) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Decode TTS chunks (handles PCM L16 from Gemini TTS)
    const ttsBuffers = [];
    for (const chunk of audioChunks) {
      const raw = Uint8Array.from(atob(chunk.data), (c) => c.charCodeAt(0));
      try {
        let decoded;
        if (chunk.mimeType && chunk.mimeType.includes("pcm")) {
          // Raw PCM L16 — manually create AudioBuffer
          const sampleRate = parseInt(
            (chunk.mimeType.match(/rate=(\d+)/) || [])[1] || "24000",
            10,
          );
          const int16 = new Int16Array(raw.buffer);
          const float32 = new Float32Array(int16.length);
          for (let i = 0; i < int16.length; i++) {
            float32[i] = int16[i] / 32768;
          }
          decoded = audioContext.createBuffer(1, float32.length, sampleRate);
          decoded.getChannelData(0).set(float32);
        } else {
          // Standard format (MP3/WAV/OGG) — use built-in decoder
          decoded = await audioContext.decodeAudioData(raw.buffer.slice(0));
        }
        ttsBuffers.push(decoded);
      } catch (e) {
        console.warn("[PremiumPodcast] Failed to decode audio chunk:", e);
      }
    }

    if (ttsBuffers.length === 0)
      throw new Error("\u97F3\u983B\u89E3\u78BC\u5931\u6557");

    // Calculate total TTS duration
    let totalTTSDuration = 0;
    for (const buf of ttsBuffers) totalTTSDuration += buf.duration;

    // Load BGM tracks
    const bgmBuffers = [];
    for (const track of BGM_TRACKS) {
      try {
        const bgmRes = await fetch(track);
        const bgmArrayBuf = await bgmRes.arrayBuffer();
        const bgmDecoded = await audioContext.decodeAudioData(bgmArrayBuf);
        bgmBuffers.push(bgmDecoded);
      } catch (e) {
        console.warn("[PremiumPodcast] Failed to load BGM:", track, e);
      }
    }

    // Create offline context for mixing
    // Use 44100Hz (standard) so both TTS (24000Hz) and BGM (44100Hz) resample correctly
    const sampleRate = 44100;
    const channels = 1; // mono
    const totalLength = Math.ceil((totalTTSDuration + 4) * sampleRate); // +4s for fade
    const offlineCtx = new OfflineAudioContext(
      channels,
      totalLength,
      sampleRate,
    );

    // Schedule TTS segments sequentially
    let offset = 1; // 1s lead-in for BGM
    for (const buf of ttsBuffers) {
      const src = offlineCtx.createBufferSource();
      src.buffer = buf;
      // TTS at full volume
      const ttsGain = offlineCtx.createGain();
      ttsGain.gain.value = 1.0;
      src.connect(ttsGain).connect(offlineCtx.destination);
      src.start(offset);
      offset += buf.duration + 0.3; // small gap between segments
    }

    // Schedule BGM tracks underneath
    if (bgmBuffers.length > 0) {
      const bgmSegmentDuration =
        (totalTTSDuration + 4) / Math.min(bgmBuffers.length, 3);
      let bgmOffset = 0;

      for (let i = 0; i < Math.min(bgmBuffers.length, 3); i++) {
        const src = offlineCtx.createBufferSource();
        src.buffer = bgmBuffers[i];
        src.loop = false;

        const gain = offlineCtx.createGain();
        // Fade in
        gain.gain.setValueAtTime(0, bgmOffset);
        gain.gain.linearRampToValueAtTime(0.15, bgmOffset + 2);
        // Sustain
        const segEnd = bgmOffset + bgmSegmentDuration;
        gain.gain.setValueAtTime(0.15, Math.max(bgmOffset + 2, segEnd - 2));
        // Fade out
        gain.gain.linearRampToValueAtTime(0, segEnd);

        src.connect(gain).connect(offlineCtx.destination);
        src.start(bgmOffset);
        if (src.buffer.duration < bgmSegmentDuration) {
          src.stop(bgmOffset + src.buffer.duration);
        } else {
          src.stop(segEnd);
        }

        bgmOffset += bgmSegmentDuration;
      }
    }

    // Render
    audioBuffer = await offlineCtx.startRendering();
  }

  /**
   * Show bottom action bar with audio player
   */
  function showFloatingPlayer(industry) {
    const bar = document.getElementById("pcBottomBar");
    if (!bar) return;

    const titleEl = document.getElementById("pcBarTitle");
    const timeTotalEl = document.getElementById("pcBarTimeTotal");
    const playBtn = document.getElementById("pcBarPlayBtn");
    const progressEl = bar.querySelector(".pc-bar-progress");
    const progressFill = document.getElementById("pcBarProgressFill");
    const timeCurrentEl = document.getElementById("pcBarTimeCurrent");

    if (titleEl)
      titleEl.textContent = industry + " \u884C\u696D\u5206\u6790\u8A9E\u97F3";
    if (timeTotalEl) timeTotalEl.textContent = formatTime(audioBuffer.duration);

    bar.classList.add("visible");

    // Push other floating elements above the bar
    const barHeight = bar.offsetHeight || 56;
    document
      .querySelectorAll(
        '[class*="float"], [class*="chatbot-fab"], [class*="line-"]',
      )
      .forEach((el) => {
        if (el !== bar && el.style) {
          const currentBottom = parseInt(getComputedStyle(el).bottom, 10) || 0;
          el.style.bottom = currentBottom + barHeight + 8 + "px";
        }
      });

    // Play/pause
    playBtn.addEventListener("click", () => {
      if (isPlaying) {
        pauseAudio();
        playBtn.textContent = "\u25B6";
        playBtn.classList.remove("playing");
      } else {
        playAudio();
        playBtn.textContent = "\u23F8";
        playBtn.classList.add("playing");
      }
    });

    // Seek
    if (progressEl) {
      progressEl.addEventListener("click", (e) => {
        const rect = progressEl.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        pauseOffset = pct * audioBuffer.duration;
        if (isPlaying) {
          pauseAudio();
          playAudio();
        }
        updateProgressUI(progressFill, timeCurrentEl, pct);
      });
    }

    // Update loop
    let rafId = null;
    function updateLoop() {
      if (!isPlaying || !audioContext) return;
      const elapsed = audioContext.currentTime - startTime + pauseOffset;
      const pct = Math.min(elapsed / audioBuffer.duration, 1);
      updateProgressUI(progressFill, timeCurrentEl, pct);
      if (pct >= 1) {
        pauseAudio();
        pauseOffset = 0;
        playBtn.textContent = "\u25B6";
        playBtn.classList.remove("playing");
        return;
      }
      rafId = requestAnimationFrame(updateLoop);
    }

    const origPlay = playAudio;
    playAudio = function () {
      origPlay();
      cancelAnimationFrame(rafId);
      updateLoop();
    };
  }

  function playAudio() {
    if (!audioBuffer || !audioContext) return;
    if (audioContext.state === "suspended") audioContext.resume();

    currentSource = audioContext.createBufferSource();
    currentSource.buffer = audioBuffer;
    currentSource.connect(audioContext.destination);
    startTime = audioContext.currentTime;
    currentSource.start(0, pauseOffset);
    isPlaying = true;
  }

  function pauseAudio() {
    if (currentSource) {
      currentSource.stop();
      currentSource.disconnect();
      currentSource = null;
    }
    if (audioContext) {
      pauseOffset += audioContext.currentTime - startTime;
    }
    isPlaying = false;
  }

  function updateProgressUI(fillEl, timeEl, pct) {
    if (fillEl) fillEl.style.width = pct * 100 + "%";
    if (timeEl && audioBuffer)
      timeEl.textContent = formatTime(pct * audioBuffer.duration);
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  return { generate };
})();
