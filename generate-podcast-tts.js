/**
 * Generate Podcast TTS + Mix with BGM
 * Uses Gemini TTS for two speakers (Kore=female, Puck=male)
 * Then mixes with Suno BGM using ffmpeg
 */
const fs = require("fs");
const path = require("path");

const API_KEY = "AIzaSyD3k7WcUyKJURDcmfygR_hBb4OuT_kT4ms";
const TTS_MODEL = "gemini-2.5-pro-preview-tts";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

const VOICE_FEMALE = "Kore"; // 小雅
const VOICE_MALE = "Puck"; // 志豪

const EPISODES = [
  { ep: 4, script: "scripts/podcast-ep4.md", bgm: "audio/podcast-bgm-ep4.mp3" },
  { ep: 5, script: "scripts/podcast-ep5.md", bgm: "audio/podcast-bgm-ep5.mp3" },
  { ep: 6, script: "scripts/podcast-ep6.md", bgm: "audio/podcast-bgm-ep6.mp3" },
  { ep: 7, script: "scripts/podcast-ep7.md", bgm: "audio/podcast-bgm-ep7.mp3" },
];

/**
 * Parse script into dialogue segments with speaker labels
 */
function parseScript(scriptPath) {
  const content = fs.readFileSync(scriptPath, "utf-8");
  const lines = content.split("\n");
  const segments = [];
  let currentSpeaker = null;
  let currentText = [];

  for (const line of lines) {
    const speakerMatch = line.match(/^\[(.+)\]$/);
    if (speakerMatch) {
      // Save previous segment
      if (currentSpeaker && currentText.length > 0) {
        segments.push({
          speaker: currentSpeaker,
          text: currentText.join(" ").trim(),
        });
      }
      currentSpeaker = speakerMatch[1];
      currentText = [];
    } else if (
      currentSpeaker &&
      line.trim() &&
      !line.startsWith("#") &&
      !line.startsWith("---") &&
      !line.startsWith("- ")
    ) {
      currentText.push(line.trim());
    }
  }

  // Save last segment
  if (currentSpeaker && currentText.length > 0) {
    segments.push({
      speaker: currentSpeaker,
      text: currentText.join(" ").trim(),
    });
  }

  return segments;
}

/**
 * Generate TTS for a text segment
 */
async function generateTTS(text, voice) {
  const requestBody = {
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      response_modalities: ["AUDIO"],
      speech_config: {
        voice_config: {
          prebuilt_voice_config: { voice_name: voice },
        },
      },
    },
  };

  const url = `${API_BASE}/models/${TTS_MODEL}:generateContent?key=${API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error(
      "TTS Error:",
      data.error?.message || JSON.stringify(data).slice(0, 200),
    );
    return null;
  }

  const parts = data.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData && part.inlineData.mimeType?.startsWith("audio/")) {
      return {
        data: Buffer.from(part.inlineData.data, "base64"),
        mimeType: part.inlineData.mimeType,
      };
    }
  }

  return null;
}

/**
 * Concatenate audio buffers with a small silence gap
 */
function createSilence(durationMs, sampleRate) {
  const samples = Math.floor((durationMs / 1000) * sampleRate);
  return Buffer.alloc(samples * 2); // 16-bit = 2 bytes per sample
}

/**
 * Process one episode
 */
async function processEpisode(epConfig) {
  const { ep, script, bgm } = epConfig;
  console.log(`\n=== Processing EP.${ep} ===`);

  // Parse script
  const scriptPath = path.join(__dirname, script);
  const segments = parseScript(scriptPath);
  console.log(`Parsed ${segments.length} dialogue segments`);

  // Generate TTS for each segment
  const audioChunks = [];
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const voice = seg.speaker.includes("\u5C0F\u96C5")
      ? VOICE_FEMALE
      : VOICE_MALE;
    console.log(
      `  [${i + 1}/${segments.length}] ${seg.speaker} (${voice}): ${seg.text.substring(0, 40)}...`,
    );

    const audio = await generateTTS(seg.text, voice);
    if (audio) {
      audioChunks.push(audio);
      console.log(`    -> ${(audio.data.length / 1024).toFixed(1)} KB`);
    } else {
      console.warn(`    -> FAILED, skipping`);
    }

    // Rate limit: wait 1s between requests
    if (i < segments.length - 1) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  if (audioChunks.length === 0) {
    console.error(`No audio generated for EP.${ep}`);
    return;
  }

  // Concatenate all voice chunks into one WAV
  // Determine sample rate from first chunk's mime type
  const firstMime = audioChunks[0].mimeType;
  const sampleRate = parseInt(
    (firstMime.match(/rate=(\d+)/) || [])[1] || "24000",
    10,
  );
  console.log(`  Sample rate: ${sampleRate}Hz`);

  const silenceGap = createSilence(400, sampleRate); // 400ms gap between segments
  const allBuffers = [];

  for (let i = 0; i < audioChunks.length; i++) {
    allBuffers.push(audioChunks[i].data);
    if (i < audioChunks.length - 1) {
      allBuffers.push(silenceGap);
    }
  }

  const combinedPCM = Buffer.concat(allBuffers);

  // Write as raw PCM WAV
  const voicePath = path.join(__dirname, "audio", `podcast-ep${ep}-voice.wav`);
  writeWAV(voicePath, combinedPCM, sampleRate, 1, 16);
  console.log(
    `  Voice saved: ${voicePath} (${(fs.statSync(voicePath).size / 1024 / 1024).toFixed(1)} MB)`,
  );

  // Mix voice + BGM using ffmpeg
  const bgmPath = path.join(__dirname, bgm);
  const outputPath = path.join(__dirname, "audio", `podcast-ep${ep}-final.mp3`);

  console.log(`  Mixing with BGM...`);
  const { execSync } = require("child_process");
  try {
    // Mix: voice at full volume, BGM at 15% volume, fade BGM in/out
    execSync(
      `ffmpeg -y -i "${voicePath}" -i "${bgmPath}" -filter_complex "[1:a]volume=0.15,afade=t=in:ss=0:d=2,afade=t=out:st=9999:d=3[bgm];[0:a][bgm]amix=inputs=2:duration=longest:dropout_transition=3[out]" -map "[out]" -ac 2 -ar 44100 -b:a 192k "${outputPath}"`,
      { stdio: "pipe" },
    );
    console.log(
      `  Final: ${outputPath} (${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(1)} MB)`,
    );
  } catch (err) {
    console.warn(`  ffmpeg mixing failed, saving voice-only as final`);
    // Fallback: convert voice WAV to MP3
    try {
      execSync(
        `ffmpeg -y -i "${voicePath}" -ac 2 -ar 44100 -b:a 192k "${outputPath}"`,
        { stdio: "pipe" },
      );
      console.log(`  Final (voice-only): ${outputPath}`);
    } catch (e2) {
      console.error(`  ffmpeg not available. Voice WAV saved at: ${voicePath}`);
    }
  }
}

/**
 * Write a WAV file from raw PCM data
 */
function writeWAV(filepath, pcmData, sampleRate, channels, bitsPerSample) {
  const byteRate = sampleRate * channels * (bitsPerSample / 8);
  const blockAlign = channels * (bitsPerSample / 8);
  const dataSize = pcmData.length;
  const headerSize = 44;
  const fileSize = headerSize + dataSize;

  const header = Buffer.alloc(headerSize);
  header.write("RIFF", 0);
  header.writeUInt32LE(fileSize - 8, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20); // PCM format
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  fs.writeFileSync(filepath, Buffer.concat([header, pcmData]));
}

/**
 * Main
 */
async function main() {
  console.log("=== AI Brain Podcast TTS Generator ===");
  console.log(`Voices: ${VOICE_FEMALE} (小雅), ${VOICE_MALE} (志豪)`);

  for (const ep of EPISODES) {
    await processEpisode(ep);
  }

  console.log("\n=== All episodes processed ===");
}

main().catch(console.error);
