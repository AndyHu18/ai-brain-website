/**
 * 網站分析器 - 語音播報模組
 * 分析完成後用 Claude 生成語音腳本 + Gemini TTS 生成語音 + BGM 混音
 * @module website-analyzer/analyzer-tts
 */
const AnalyzerTTS = (function () {
  "use strict";

  const CLAUDE_API = "/api/claude";
  const TTS_API = "/api/gemini-tts";
  const TTS_MODEL = "gemini-2.5-pro-preview-tts";
  const VOICE = "Kore";

  const BGM_TRACKS = [
    "audio/bgm-lofi.mp3",
    "audio/bgm-ep4-marketing.mp3",
    "audio/bgm-ep5-aics.mp3",
  ];

  const SCRIPT_PROMPT = `你是一位親切的 AI 行銷顧問。根據以下網站分析報告，用口語化的方式做一段語音摘要播報。

要求：
1. 開場（30字）：歡迎聽眾，帶出這個網站
2. 關鍵發現（100字）：最重要的 2-3 個 AI 導入機會
3. 具體效益（80字）：用數字說明能省多少時間/成本
4. 行動建議（40字）：鼓勵加 LINE 免費諮詢

嚴格規則：
- 總字數 250-350 字
- 說話風格自然口語化，像真人說話
- 不要用 markdown、標題、編號，純文字流暢述說
- 提到具體數字和百分比讓內容有說服力`;

  let audioContext = null;
  let currentSource = null;
  let audioBuffer = null;
  let startTime = 0;
  let pauseOffset = 0;
  let isPlaying = false;
  let isGenerating = false;

  /**
   * 主流程：從分析報告生成語音
   * @param {Object} report - 分析報告數據
   */
  async function generate(report) {
    if (isGenerating) return;
    isGenerating = true;

    const btn = document.getElementById("analyzer-tts-btn");
    const btnText = btn ? btn.querySelector(".tts-btn-text") : null;

    try {
      // Step 1: 生成語音腳本
      updateBtn(btnText, "撰寫語音腳本...", true);
      const script = await generateScript(report);

      // Step 2: 拆分腳本
      updateBtn(btnText, "拆分腳本...", true);
      const segments = splitScript(script);

      // Step 3: TTS 語音生成
      const audioChunks = [];
      for (let i = 0; i < segments.length; i++) {
        updateBtn(
          btnText,
          "語音生成 (" + (i + 1) + "/" + segments.length + ")...",
          true,
        );
        const chunk = await generateTTS(segments[i]);
        if (chunk) audioChunks.push(chunk);
      }

      if (audioChunks.length === 0) throw new Error("語音生成失敗");

      // Step 4: 混音
      updateBtn(btnText, "混音處理...", true);
      await mixWithBGM(audioChunks);

      // Step 5: 顯示播放器
      updateBtn(btnText, "語音播報", false);
      if (btn) {
        btn.classList.add("tts-ready");
        btn.classList.remove("tts-generating");
      }
      showPlayer(report.websiteTitle || report.websiteUrl);
      isGenerating = false;
    } catch (err) {
      console.error("[AnalyzerTTS] 生成失敗:", err);
      updateBtn(btnText, "生成失敗，點擊重試", false);
      if (btn) btn.classList.remove("tts-generating");
      isGenerating = false;
    }
  }

  function updateBtn(btnText, text, loading) {
    if (btnText) btnText.textContent = text;
    const btn = document.getElementById("analyzer-tts-btn");
    if (btn) {
      if (loading) {
        btn.classList.add("tts-generating");
        btn.disabled = true;
      } else {
        btn.disabled = false;
      }
    }
  }

  /**
   * 用 Claude 生成語音腳本
   */
  async function generateScript(report) {
    const analysis = report.analysis || {};
    const summaryText = analysis.summary || "";
    const services = (analysis.services || []).map((s) => s.name).join("、");
    const opportunities = (analysis.aiOpportunities || [])
      .slice(0, 3)
      .map(
        (o) => o.area + "：" + o.application + "（" + o.estimatedBenefit + "）",
      )
      .join("\n");

    const content =
      "網站：" +
      (report.websiteTitle || report.websiteUrl) +
      "\n\n摘要：\n" +
      summaryText.slice(0, 800) +
      "\n\n服務項目：" +
      services +
      "\n\nAI 機會：\n" +
      opportunities;

    const res = await fetch(CLAUDE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        system: SCRIPT_PROMPT,
        temperature: 0.85,
        messages: [{ role: "user", content: content }],
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Claude API 失敗");
    return data.content?.[0]?.text || data.text || "";
  }

  /**
   * 拆分腳本成 TTS 段落（< 3500 bytes）
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
   * Gemini TTS 生成
   */
  async function generateTTS(text) {
    const ttsText = text
      .replace(/^#{1,6}\s+.*$/gm, "")
      .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
      .replace(/^[-=]{3,}$/gm, "")
      .replace(/\n{2,}/g, "\n")
      .trim();

    if (!ttsText || ttsText.length < 5) return null;

    try {
      const res = await fetch(TTS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: TTS_MODEL,
          contents: [{ parts: [{ text: ttsText }] }],
          generationConfig: {
            response_modalities: ["AUDIO"],
            speech_config: {
              voice_config: {
                prebuilt_voice_config: { voice_name: VOICE },
              },
            },
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "TTS API 失敗");

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
      console.warn("[AnalyzerTTS] TTS segment failed:", err);
      return null;
    }
  }

  /**
   * Web Audio 混音
   */
  async function mixWithBGM(audioChunks) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const ttsBuffers = [];
    for (const chunk of audioChunks) {
      const raw = Uint8Array.from(atob(chunk.data), (c) => c.charCodeAt(0));
      try {
        let decoded;
        if (chunk.mimeType && chunk.mimeType.includes("pcm")) {
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
          decoded = await audioContext.decodeAudioData(raw.buffer.slice(0));
        }
        ttsBuffers.push(decoded);
      } catch (e) {
        console.warn("[AnalyzerTTS] Failed to decode chunk:", e);
      }
    }

    if (ttsBuffers.length === 0) throw new Error("音頻解碼失敗");

    let totalTTSDuration = 0;
    for (const buf of ttsBuffers) totalTTSDuration += buf.duration;

    // Load BGM
    const bgmBuffers = [];
    for (const track of BGM_TRACKS) {
      try {
        const bgmRes = await fetch(track);
        const bgmArrayBuf = await bgmRes.arrayBuffer();
        const bgmDecoded = await audioContext.decodeAudioData(bgmArrayBuf);
        bgmBuffers.push(bgmDecoded);
        break; // 只用第一首成功載入的 BGM
      } catch (e) {
        console.warn("[AnalyzerTTS] BGM load failed:", track, e);
      }
    }

    // Offline mixing
    const sampleRate = 44100;
    const totalLength = Math.ceil((totalTTSDuration + 4) * sampleRate);
    const offlineCtx = new OfflineAudioContext(1, totalLength, sampleRate);

    // Schedule TTS
    let offset = 1;
    for (const buf of ttsBuffers) {
      const src = offlineCtx.createBufferSource();
      src.buffer = buf;
      const gain = offlineCtx.createGain();
      gain.gain.value = 1.0;
      src.connect(gain).connect(offlineCtx.destination);
      src.start(offset);
      offset += buf.duration + 0.3;
    }

    // Schedule BGM
    if (bgmBuffers.length > 0) {
      const bgmSrc = offlineCtx.createBufferSource();
      bgmSrc.buffer = bgmBuffers[0];
      bgmSrc.loop = false;
      const bgmGain = offlineCtx.createGain();
      bgmGain.gain.setValueAtTime(0, 0);
      bgmGain.gain.linearRampToValueAtTime(0.12, 2);
      const fadeOutStart = totalTTSDuration + 1;
      bgmGain.gain.setValueAtTime(0.12, fadeOutStart);
      bgmGain.gain.linearRampToValueAtTime(0, fadeOutStart + 3);
      bgmSrc.connect(bgmGain).connect(offlineCtx.destination);
      bgmSrc.start(0);
      const bgmEnd = Math.min(bgmBuffers[0].duration, totalTTSDuration + 4);
      bgmSrc.stop(bgmEnd);
    }

    audioBuffer = await offlineCtx.startRendering();
  }

  /**
   * 顯示浮動播放器
   */
  function showPlayer(title) {
    const bar = document.getElementById("analyzerBottomBar");
    if (!bar) return;

    const titleEl = document.getElementById("analyzerBarTitle");
    const timeTotalEl = document.getElementById("analyzerBarTimeTotal");
    const playBtn = document.getElementById("analyzerBarPlayBtn");
    const progressEl = bar.querySelector(".analyzer-bar-progress");
    const progressFill = document.getElementById("analyzerBarProgressFill");
    const timeCurrentEl = document.getElementById("analyzerBarTimeCurrent");

    if (titleEl) titleEl.textContent = (title || "網站") + " AI 語音分析";
    if (timeTotalEl) timeTotalEl.textContent = formatTime(audioBuffer.duration);

    bar.classList.add("visible");

    // Play/pause
    const handlePlay = () => {
      if (isPlaying) {
        pauseAudio();
        playBtn.textContent = "\u25B6";
        playBtn.classList.remove("playing");
      } else {
        playAudio();
        playBtn.textContent = "\u23F8";
        playBtn.classList.add("playing");
      }
    };

    // Remove old listener, add new
    playBtn.replaceWith(playBtn.cloneNode(true));
    const newPlayBtn = document.getElementById("analyzerBarPlayBtn");
    newPlayBtn.addEventListener("click", handlePlay);

    // Seek
    if (progressEl) {
      const newProgress = progressEl.cloneNode(true);
      progressEl.replaceWith(newProgress);
      const newFill = document.getElementById("analyzerBarProgressFill");
      newProgress.addEventListener("click", (e) => {
        const rect = newProgress.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        pauseOffset = pct * audioBuffer.duration;
        if (isPlaying) {
          pauseAudio();
          playAudio();
        }
        if (newFill) newFill.style.width = pct * 100 + "%";
        if (timeCurrentEl)
          timeCurrentEl.textContent = formatTime(pct * audioBuffer.duration);
      });
    }

    // Progress update loop
    let rafId = null;
    function updateLoop() {
      if (!isPlaying || !audioContext) return;
      const elapsed = audioContext.currentTime - startTime + pauseOffset;
      const pct = Math.min(elapsed / audioBuffer.duration, 1);
      const fill = document.getElementById("analyzerBarProgressFill");
      const timeCur = document.getElementById("analyzerBarTimeCurrent");
      if (fill) fill.style.width = pct * 100 + "%";
      if (timeCur) timeCur.textContent = formatTime(pct * audioBuffer.duration);
      if (pct >= 1) {
        pauseAudio();
        pauseOffset = 0;
        const pb = document.getElementById("analyzerBarPlayBtn");
        if (pb) {
          pb.textContent = "\u25B6";
          pb.classList.remove("playing");
        }
        return;
      }
      rafId = requestAnimationFrame(updateLoop);
    }

    // Override playAudio to include update loop
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

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  return { generate };
})();

window.AnalyzerTTS = AnalyzerTTS;
