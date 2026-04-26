/**
 * 最佳實踐：原始格 + 切割結果同時送 Gemini 做視覺對比
 * Gemini 看差距 → 給出修正 Y → 迭代直到通過
 */
const { GoogleGenAI } = require("@google/genai");
const { createCanvas, loadImage } = require("canvas");
const fs   = require("fs");
const path = require("path");

const API_KEY = "AIzaSyCPMxrNPNnnwFjGt--lyeMcHdbJxY357cc";
const SRC     = "C:\\Users\\user\\Desktop\\9d43f8c.png";
const OUT_DIR = path.join(__dirname, "images", "series-icons");
const COLS = 4, ROWS = 3, OUT_W = 200;

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// 切割單張，回傳 canvas buffer
function cropOneCell(img, cellW, cellH, col, row, cropTop, cropBottom) {
  const cropH = cropBottom - cropTop;
  const outH  = Math.round(OUT_W * cropH / cellW);
  const canvas = createCanvas(OUT_W, outH);
  canvas.getContext("2d").drawImage(
    img, col * cellW, row * cellH + cropTop, cellW, cropH, 0, 0, OUT_W, outH
  );
  return { buf: canvas.toBuffer("image/png"), outH };
}

// 取原始格的 buffer（不縮放，原始尺寸）
function getRawCell(img, cellW, cellH, col, row) {
  const canvas = createCanvas(cellW, cellH);
  canvas.getContext("2d").drawImage(img, col * cellW, row * cellH, cellW, cellH, 0, 0, cellW, cellH);
  return canvas.toBuffer("image/png");
}

/**
 * 核心：把「原始格」和「目前切割結果」一起送 Gemini
 * 讓它告訴我：切割結果底部有沒有多餘文字、差距幾個像素
 * 回傳：{ clean: bool, adjustPx: number }
 * adjustPx > 0 = 底部需往上移幾 px（以原始格為基準）
 */
async function compareAndJudge(client, rawCellBuf, croppedBuf, cellH, cropTop, cropBottom) {
  const rawB64 = rawCellBuf.toString("base64");
  const cropB64 = croppedBuf.toString("base64");

  const prompt = `I am cropping badge icons. I will show you TWO images:
Image 1: The ORIGINAL full cell (${cellH}px tall). It contains:
  - A small number at top
  - A decorative badge/medal artwork in the middle
  - A plain Chinese text label at the BOTTOM (like "曝光" "加購升單")

Image 2: My CURRENT CROP (cut from y=${cropTop} to y=${cropBottom} of the original).

Your job: Look at Image 2. Does it still show any plain Chinese label text at the bottom?

If YES (text still visible):
  - Estimate how many pixels of the original cell I need to remove from the bottom to eliminate all text
  - Reply: clean=no adjust_px=NUMBER  (NUMBER = how many more pixels to cut from bottom in original scale)

If NO (crop is clean — only badge artwork visible):
  - Reply: clean=yes adjust_px=0`;

  const res = await client.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{
      parts: [
        { text: prompt },
        { text: "Image 1 (original cell):" },
        { inlineData: { mimeType: "image/png", data: rawB64 } },
        { text: "Image 2 (current crop):" },
        { inlineData: { mimeType: "image/png", data: cropB64 } }
      ]
    }]
  });

  const answer = res.candidates[0].content.parts[0].text.trim();
  console.log(`    Gemini: ${answer}`);

  const clean   = /clean=yes/.test(answer);
  const adjMatch = answer.match(/adjust_px=(\d+)/);
  const adjustPx = adjMatch ? parseInt(adjMatch[1]) : 20;

  return { clean, adjustPx };
}

// 切所有 12 張並存檔
function cropAll(img, cellW, cellH, cropTop, cropBottom) {
  const cropH = cropBottom - cropTop;
  const outH  = Math.round(OUT_W * cropH / cellW);
  const results = [];
  for (let idx = 0; idx < 12; idx++) {
    const col = idx % COLS, row = Math.floor(idx / COLS);
    const canvas = createCanvas(OUT_W, outH);
    canvas.getContext("2d").drawImage(
      img, col * cellW, row * cellH + cropTop, cellW, cropH, 0, 0, OUT_W, outH
    );
    const buf     = canvas.toBuffer("image/png");
    const outName = `grid-icon-${String(idx + 1).padStart(2, "0")}.png`;
    fs.writeFileSync(path.join(OUT_DIR, outName), buf);
    results.push({ idx: idx + 1, col, row, buf, outH });
  }
  return results;
}

async function main() {
  const client = new GoogleGenAI({ apiKey: API_KEY });
  if (!fs.existsSync(SRC)) throw new Error(`找不到: ${SRC}`);
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const img   = await loadImage(SRC);
  const cellW = Math.floor(img.width  / COLS);
  const cellH = Math.floor(img.height / ROWS);
  console.log(`\n來源: ${img.width}×${img.height}，每格: ${cellW}×${cellH}\n`);

  let cropTop    = 30;  // 跳過頂部小數字
  let cropBottom = Math.floor(cellH * 0.76); // 初始值 76%
  const MIN_BOTTOM = Math.floor(cellH * 0.48);

  let round = 0;
  while (cropBottom >= MIN_BOTTOM) {
    round++;
    const outH = Math.round(OUT_W * (cropBottom - cropTop) / cellW);
    console.log(`\n═══ Round ${round}: top=${cropTop} bottom=${cropBottom} → ${OUT_W}×${outH} ═══`);

    // 用三個不同列/欄的格做視覺對比（row0col0, row1col2, row2col3）
    const testCells = [
      { col: 0, row: 0 }, // 左上
      { col: 2, row: 1 }, // 中間
      { col: 3, row: 2 }, // 右下（最容易出問題的位置）
    ];

    let maxAdjust = 0;
    let allClean  = true;

    for (const cell of testCells) {
      const rawBuf  = getRawCell(img, cellW, cellH, cell.col, cell.row);
      const { buf } = cropOneCell(img, cellW, cellH, cell.col, cell.row, cropTop, cropBottom);

      console.log(`  [對比] 第${cell.row + 1}列第${cell.col + 1}欄：`);
      const { clean, adjustPx } = await compareAndJudge(
        client, rawBuf, buf, cellH, cropTop, cropBottom
      );

      if (!clean) {
        allClean = false;
        maxAdjust = Math.max(maxAdjust, adjustPx);
      }
      await sleep(500);
    }

    if (allClean) {
      // 全部乾淨 → 切所有 12 張存檔
      console.log(`\n✅ 三格對比通過，bottom=${cropBottom} 確認。切割全部 12 張...`);
      cropAll(img, cellW, cellH, cropTop, cropBottom);
      console.log(`\n✅ 完成！12 張存到 ${OUT_DIR}  尺寸 ${OUT_W}×${outH}`);
      return;
    }

    // 有問題 → 依 Gemini 建議縮小，至少縮 10px
    const shrink = Math.max(10, maxAdjust);
    console.log(`  → 最大需縮 ${shrink}px，bottom ${cropBottom} → ${cropBottom - shrink}`);
    cropBottom -= shrink;
  }

  console.error(`\n❌ 已縮到最小 ${MIN_BOTTOM}px 仍不通過，請人工確認`);
  process.exit(1);
}

main().catch(err => { console.error("❌", err.message); process.exit(1); });
