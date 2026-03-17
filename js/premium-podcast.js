/**
 * Premium Podcast Generator
 * Generates a two-person discussion using Claude (script) + Gemini TTS (voice) + Web Audio (BGM mix)
 */
const PremiumPodcast = (function () {
  "use strict";

  const CLAUDE_API =
    "https://getlove-api-proxy.getlove-ai.workers.dev/api/claude";
  const TTS_API =
    "https://getlove-api-proxy.getlove-ai.workers.dev/api/gemini-tts";
  const TTS_MODEL = "gemini-2.5-pro-preview-tts";

  const VOICE_HOST = "Kore"; // Female host
  const VOICE_GUEST = "Puck"; // Male expert guest

  const BGM_TRACKS = [
    "audio/bgm-lofi.mp3",
    "audio/bgm-ep4-marketing.mp3",
    "audio/bgm-ep5-aics.mp3",
  ];

  const SCRIPT_SYSTEM_PROMPT = `\u4F60\u662F\u4E00\u500B Podcast \u8173\u672C\u4F5C\u5BB6\u3002\u6839\u64DA\u7528\u6236\u63D0\u4F9B\u7684\u884C\u696D\u5206\u6790\uFF0C\u5BEB\u4E00\u6BB5\u96D9\u4EBA\u5C0D\u8A71\u8173\u672C\u3002

\u89D2\u8272\uFF1A
- [\u4E3B\u6301\u4EBA] \u5C0F\u6797\uFF1A\u89AA\u5207\u6D3B\u6F51\uFF0C\u64C5\u9577\u7528\u767D\u8A71\u89E3\u91CB\u8907\u96DC\u6982\u5FF5
- [\u4F86\u8CD3] \u963F\u5F37\uFF1A\u7DB2\u7AD9\u884C\u92B7\u5C08\u5BB6\uFF0C\u6709\u8C50\u5BCC\u5BE6\u6230\u7D93\u9A57

\u5167\u5BB9\u7D50\u69CB\uFF08\u56B4\u683C\u9075\u5B88\uFF09\uFF1A
1. \u958B\u5834\u767D\uFF0840\u5B57\uFF09\uFF1A\u4E3B\u6301\u4EBA\u5E36\u51FA\u4ECA\u5929\u8A0E\u8AD6\u7684\u884C\u696D
2. \u884C\u696D\u7DB2\u7AD9\u884C\u92B7\u7B56\u7565\uFF08200\u5B57\uFF09\uFF1A\u9019\u500B\u884C\u696D\u505A\u7DB2\u7AD9\u884C\u92B7\u7684\u91CD\u9EDE\u3001\u75DB\u9EDE\u3001\u5BE6\u969B\u505A\u6CD5
3. AI \u5982\u4F55\u61C9\u7528\uFF08200\u5B57\uFF09\uFF1AAI \u5BA2\u670D\u3001\u667A\u6167\u63A8\u85A6\u3001\u81EA\u52D5\u5316\u884C\u92B7\u7B49\u5177\u9AD4\u61C9\u7528
4. \u670D\u52D9\u63A8\u85A6\uFF08150\u5B57\uFF09\uFF1A\u81EA\u7136\u5E36\u5165 AI \u667A\u80FD\u5927\u8166\u7684\u670D\u52D9\uFF0C\u8AAA\u660E\u70BA\u4EC0\u9EBC\u9069\u5408
5. \u53CE\u5C3E\uFF0850\u5B57\uFF09\uFF1A\u9F13\u52F5\u52A0 LINE \u514D\u8CBB\u8AEE\u8A62

\u683C\u5F0F\u898F\u5247\uFF1A
- \u6BCF\u53E5\u7528 [\u4E3B\u6301\u4EBA] \u6216 [\u4F86\u8CD3] \u958B\u982D\uFF0C\u5404\u4F54\u7D04\u4E00\u534A
- \u7E3D\u5B57\u6578\u56B4\u683C\u63A7\u5236\u5728 600-800 \u5B57\uFF08\u542B\u6A19\u8A18\uFF09
- \u8AAA\u8A71\u98A8\u683C\u81EA\u7136\u53E3\u8A9E\u5316\uFF0C\u50CF\u771F\u4EBA\u804A\u5929
- \u4E0D\u8981\u7528 markdown \u683C\u5F0F\uFF0C\u7D14\u6587\u5B57
- \u4E0D\u8981\u5BEB\u300C\u7B2C\u4E00\u6BB5\u300D\u300C\u7B2C\u4E8C\u6BB5\u300D\u7B49\u5F8C\u8A2D\u6307\u793A
- \u670D\u52D9\u63A8\u85A6\u8981\u81EA\u7136\u4E0D\u751F\u786C\uFF0C\u50CF\u662F\u8DA3\u805E\u5206\u4EAB\u800C\u4E0D\u662F\u63A8\u92B7`;

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
    // Build multi-speaker text: replace [主持人] → Kore, [來賓] → Puck
    const ttsText = segmentText
      .replace(/\[主持人\]\s*/g, '<speaker name="' + VOICE_HOST + '">')
      .replace(/\[來賓\]\s*/g, '<speaker name="' + VOICE_GUEST + '">');

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
          multi_speaker_voice_config: {
            speaker_voice_configs: [
              {
                speaker: VOICE_HOST,
                voice_config: {
                  prebuilt_voice_config: { voice_name: VOICE_HOST },
                },
              },
              {
                speaker: VOICE_GUEST,
                voice_config: {
                  prebuilt_voice_config: { voice_name: VOICE_GUEST },
                },
              },
            ],
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
      if (!res.ok) throw new Error(data.error || "TTS API \u5931\u6557");

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

    // Decode TTS chunks
    const ttsBuffers = [];
    for (const chunk of audioChunks) {
      const raw = Uint8Array.from(atob(chunk.data), (c) => c.charCodeAt(0));
      try {
        const decoded = await audioContext.decodeAudioData(raw.buffer.slice(0));
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
    const sampleRate = ttsBuffers[0].sampleRate;
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
        gain.gain.linearRampToValueAtTime(0.08, bgmOffset + 2);
        // Sustain
        const segEnd = bgmOffset + bgmSegmentDuration;
        gain.gain.setValueAtTime(0.08, Math.max(bgmOffset + 2, segEnd - 2));
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
   * Show floating play button
   */
  function showFloatingPlayer(industry) {
    floatPlayerEl = document.getElementById("pcFloatPlayer");
    if (!floatPlayerEl) return;

    const label = floatPlayerEl.querySelector(".pc-float-label");
    if (label)
      label.textContent =
        "\u{1F3A7} \u5C08\u5C6C\u300C" +
        industry +
        "\u300D\u884C\u92B7\u8A0E\u8AD6";

    floatPlayerEl.classList.add("visible");

    // Main button toggle
    const mainBtn = floatPlayerEl.querySelector(".pc-float-btn");
    const miniPlayer = floatPlayerEl.querySelector(".pc-mini-player");
    const playBtn = floatPlayerEl.querySelector(".pc-mini-play");
    const progressBar = floatPlayerEl.querySelector(".pc-mini-progress");
    const progressFill = floatPlayerEl.querySelector(".pc-mini-progress-fill");
    const timeCurrentEl = floatPlayerEl.querySelector(".pc-time-current");
    const timeTotalEl = floatPlayerEl.querySelector(".pc-time-total");
    const titleEl = floatPlayerEl.querySelector(".pc-mini-title");

    if (titleEl)
      titleEl.textContent = industry + " \u884C\u696D\u884C\u92B7\u5C08\u984C";
    if (timeTotalEl) timeTotalEl.textContent = formatTime(audioBuffer.duration);

    // Toggle mini player
    mainBtn.addEventListener("click", () => {
      const wasVisible = miniPlayer.classList.contains("visible");
      if (wasVisible) {
        miniPlayer.classList.remove("visible");
        if (label) label.style.display = "";
      } else {
        miniPlayer.classList.add("visible");
        if (label) label.style.display = "none";
      }
    });

    // Play/pause
    playBtn.addEventListener("click", () => {
      if (isPlaying) {
        pauseAudio();
        playBtn.textContent = "\u25B6";
        mainBtn.classList.remove("playing");
      } else {
        playAudio();
        playBtn.textContent = "\u23F8";
        mainBtn.classList.add("playing");
      }
    });

    // Progress bar click to seek
    progressBar.addEventListener("click", (e) => {
      const rect = progressBar.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      pauseOffset = pct * audioBuffer.duration;
      if (isPlaying) {
        pauseAudio();
        playAudio();
      }
      updateProgressUI(progressFill, timeCurrentEl, pct);
    });

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
        mainBtn.classList.remove("playing");
        return;
      }
      rafId = requestAnimationFrame(updateLoop);
    }

    // Override play to start update loop
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
