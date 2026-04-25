const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const API_KEY = "AIzaSyCTKsiKRWtOk8xNo7xmUDH1m1eZVoFM1nw";
const MODEL = "gemini-3-pro-image-preview";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const OUTPUT_DIR = path.join(__dirname, "assets", "images", "posters");

// ============================================================
// 一次生成完整 YouTube 封面圖（含人物 + 文字 + 構圖）
// Gemini 直接處理所有元素，不再分步
// ============================================================

const STYLE_GUIDE = `YouTube thumbnail design rules:
- ONE person with exaggerated facial expression (surprised, excited, amazed) looking directly at camera, positioned on the RIGHT 40% of frame
- Bold headline text on the LEFT side in solid colored blocks (yellow #FFD600 or orange #FF6D00), black bold sans-serif text inside the blocks
- Text must be HUGE, taking up 30-40% of the image width
- High color saturation, warm tones (orange, coral, gold)
- Complementary color contrast between background and text blocks
- Clean composition with breathing room, not cluttered
- Small arrow symbols (▶▶) below the text blocks in the same color
- Professional portrait photography style with shallow depth of field
- All Chinese text must be perfectly clear, accurate, bold sans-serif font, no garbled characters`;

const videos = [
  // === Cases（9:16 直式）===
  {
    filename: "yoga.jpg",
    w: 720,
    h: 1280,
    prompt: `${STYLE_GUIDE}
Create a 9:16 vertical YouTube thumbnail. Person: A cheerful young Taiwanese female yoga instructor in coral yoga top, RIGHT side, excited surprised expression. Text on LEFT in yellow (#FFD600) blocks with black bold text: line 1 "AI自己發文" line 2 "帶來新學員". Background: warm peach-orange gradient. Yellow ▶▶ arrows below text.`,
  },
  {
    filename: "clinic.jpg",
    w: 720,
    h: 1280,
    prompt: `${STYLE_GUIDE}
Create a 9:16 vertical YouTube thumbnail. Person: A Taiwanese male dentist in white coat, RIGHT side, confident thumbs-up, big smile. Text on LEFT in red (#E53935) blocks with white bold text: line 1 "爽約率" line 2 "降了七成". Background: teal-blue to white gradient. Red ▶▶ arrows below text.`,
  },
  {
    filename: "fashion.jpg",
    w: 720,
    h: 1280,
    prompt: `${STYLE_GUIDE}
Create a 9:16 vertical YouTube thumbnail. Person: A stylish young Taiwanese female boutique owner, RIGHT side, knowing smirk holding phone. Text on LEFT in hot pink (#FF80AB) blocks with black bold text: line 1 "AI自動追蹤" line 2 "競品動態". Background: coral-pink gradient. Pink ▶▶ arrows below text.`,
  },
  {
    filename: "bnb.jpg",
    w: 720,
    h: 1280,
    prompt: `${STYLE_GUIDE}
Create a 9:16 vertical YouTube thumbnail. Person: A warm Taiwanese female B&B host in her 40s, RIGHT side, holding welcome card, caring smile. Text on LEFT in yellow (#FFD600) blocks with black bold text: line 1 "客人還沒到" line 2 "就被照顧了". Background: warm amber gradient. Yellow ▶▶ arrows below text.`,
  },
  {
    filename: "free-time.jpg",
    w: 720,
    h: 1280,
    prompt: `${STYLE_GUIDE}
Create a 9:16 vertical YouTube thumbnail. Person: A relaxed Taiwanese male business owner, RIGHT side, arms behind head, huge relieved smile. Text on LEFT in blue (#1565C0) blocks with white bold text: line 1 "三四小時回訊息" line 2 "現在AI接". Background: sunset golden-blue gradient. Blue ▶▶ arrows below text.`,
  },
  {
    filename: "baby-care.jpg",
    w: 720,
    h: 1280,
    prompt: `${STYLE_GUIDE}
Create a 9:16 vertical YouTube thumbnail. Person: A Taiwanese female baby care shop owner, RIGHT side, holding baby product, enthusiastic pointing gesture. Text on LEFT in purple (#CE93D8) blocks with black bold text: line 1 "問什麼" line 2 "都答得出來". Background: soft pastel pink-lavender. Purple ▶▶ arrows below text.`,
  },
  {
    filename: "nail-salon.jpg",
    w: 720,
    h: 1280,
    prompt: `${STYLE_GUIDE}
Create a 9:16 vertical YouTube thumbnail. Person: A young Taiwanese female nail artist, RIGHT side, looking up from work with grateful relieved smile. Text on LEFT in yellow (#FFD600) blocks with black bold text: line 1 "手機一直響" line 2 "AI幫你回". Background: elegant pink-lavender salon. Yellow ▶▶ arrows below text.`,
  },
  {
    filename: "new-orders.jpg",
    w: 720,
    h: 1280,
    prompt: `${STYLE_GUIDE}
Create a 9:16 vertical YouTube thumbnail. Person: A Taiwanese male in pajamas, RIGHT side, looking at glowing phone in dark room with shocked amazed expression, eyes wide, mouth open. Text on LEFT in dark blue (#1A237E) blocks with yellow (#FFD600) bold text: line 1 "半夜" line 2 "也在接單". Background: dark blue-purple night atmosphere. Dark blue ▶▶ arrows below text.`,
  },
  {
    filename: "handcraft.jpg",
    w: 720,
    h: 1280,
    prompt: `${STYLE_GUIDE}
Create a 9:16 vertical YouTube thumbnail. Person: A Taiwanese female handcraft artist, RIGHT side, holding handmade piece and phone, proud excited smile. Text on LEFT in yellow (#FFD600) blocks with black bold text: line 1 "傳張照片" line 2 "網站就更新". Background: warm wooden workshop. Yellow ▶▶ arrows below text.`,
  },
  {
    filename: "florist.jpg",
    w: 720,
    h: 1280,
    prompt: `${STYLE_GUIDE}
Create a 9:16 vertical YouTube thumbnail. Person: A busy Taiwanese female florist, RIGHT side, surrounded by flowers, overwhelmed happy expression, hands raised. Text on LEFT in red (#C62828) blocks with white bold text: line 1 "200則訊息" line 2 "AI全接了". Background: vibrant flower shop. Red ▶▶ arrows below text.`,
  },
  {
    filename: "follow-up.jpg",
    w: 720,
    h: 1280,
    prompt: `${STYLE_GUIDE}
Create a 9:16 vertical YouTube thumbnail. Person: A professional Taiwanese male office worker, RIGHT side, pointing at tablet checklist, confident smile. Text on LEFT in dark grey (#37474F) blocks with white bold text: line 1 "開完會" line 2 "待辦整理好". Background: clean modern office. Dark grey ▶▶ arrows below text.`,
  },
  {
    filename: "pricing.jpg",
    w: 720,
    h: 1280,
    prompt: `${STYLE_GUIDE}
Create a 9:16 vertical YouTube thumbnail. Person: A happy Taiwanese female shop owner, RIGHT side, holding piggy bank, thumbs up, bright smile. Text on LEFT in green (#00C853) blocks with black bold text: line 1 "比請人便宜" line 2 "比請人準時". Background: bright green-white gradient. Green ▶▶ arrows below text.`,
  },
  {
    filename: "repurchase.jpg",
    w: 720,
    h: 1280,
    prompt: `${STYLE_GUIDE}
Create a 9:16 vertical YouTube thumbnail. Person: A Taiwanese female boutique owner, RIGHT side, looking at phone with delighted surprised expression. Text on LEFT in orange (#FFB300) blocks with black bold text: line 1 "沉睡客人" line 2 "AI帶回來". Background: warm sunset orange-gold. Orange ▶▶ arrows below text.`,
  },
  {
    filename: "fitness.jpg",
    w: 720,
    h: 1280,
    prompt: `${STYLE_GUIDE}
Create a 9:16 vertical YouTube thumbnail. Person: A fit Taiwanese male fitness coach in tank top, RIGHT side, flexing arm and pointing at camera, big energetic smile. Text on LEFT in deep orange (#D84315) blocks with white bold text: line 1 "教練專心教" line 2 "AI幫接客". Background: modern gym with orange-red lighting. Orange ▶▶ arrows below text.`,
  },
  // === Services（16:9 橫式）===
  {
    filename: "service_chatbot.jpg",
    w: 1280,
    h: 720,
    prompt: `${STYLE_GUIDE}
Create a 16:9 horizontal YouTube thumbnail. No person. A futuristic glowing AI chatbot brain hologram with multiple chat bubbles radiating outward. Deep navy-blue background with electric blue and orange glows. Text on LEFT in orange (#E65100) block with white bold text: "AI智能客服". Premium tech digital art style.`,
  },
  {
    filename: "service_brand_clone.jpg",
    w: 1280,
    h: 720,
    prompt: `${STYLE_GUIDE}
Create a 16:9 horizontal YouTube thumbnail. No person. A business silhouette mirrored by a glowing digital twin, connected by golden data streams. Dark teal background. Text on LEFT in teal (#004D40) block with yellow (#FFD600) bold text: "品牌分身". Premium digital art.`,
  },
  {
    filename: "service_consultant.jpg",
    w: 1280,
    h: 720,
    prompt: `${STYLE_GUIDE}
Create a 16:9 horizontal YouTube thumbnail. No person. Holographic business dashboard with charts floating in warm amber-dark space. Text on LEFT in amber (#FFB300) block with black bold text: "AI顧問". Cinematic digital art.`,
  },
  {
    filename: "service_content_editor.jpg",
    w: 1280,
    h: 720,
    prompt: `${STYLE_GUIDE}
Create a 16:9 horizontal YouTube thumbnail. No person. Creative explosion of photos and social media cards flying from a glowing phone. Vibrant coral-to-purple gradient. Text on LEFT in magenta (#AD1457) block with white bold text: "AI內容編輯". Digital art.`,
  },
  {
    filename: "service_meeting_notes.jpg",
    w: 1280,
    h: 720,
    prompt: `${STYLE_GUIDE}
Create a 16:9 horizontal YouTube thumbnail. No person. Sound waves transforming into organized documents in cool blue space. Text on LEFT in blue (#1565C0) block with white bold text: "AI會議記錄". Digital art.`,
  },
  {
    filename: "service_voice_receptionist.jpg",
    w: 1280,
    h: 720,
    prompt: `${STYLE_GUIDE}
Create a 16:9 horizontal YouTube thumbnail. No person. Golden sound wave rings from a glowing telephone. Deep indigo-black background with orange accents. Text on LEFT in indigo (#311B92) block with yellow (#FFD600) bold text: "AI語音接待". Digital art.`,
  },
  {
    filename: "hero-video.jpg",
    w: 1280,
    h: 720,
    prompt: `Create a cinematic 16:9 horizontal banner. An abstract AI brain made of interconnected golden and electric blue light neurons floating in deep dark space. Business icons (chat, calendar, phone, cart) orbiting like planets. Premium futuristic feel. No text anywhere. High-end digital art.`,
  },
  {
    filename: "ai-solutions-showcase.jpg",
    w: 1280,
    h: 720,
    prompt: `${STYLE_GUIDE}
Create a 16:9 horizontal YouTube thumbnail. No person. Six glowing service cards in a radial pattern connected by light trails. Dark blue-purple gradient. Text on LEFT in orange (#E65100) block with white bold text: "AI解決方案". Premium digital art.`,
  },
];

// ============================================================
// API call
// ============================================================
async function generateImage(video) {
  const url = `${API_URL}?key=${API_KEY}`;
  const payload = {
    contents: [{ role: "user", parts: [{ text: video.prompt }] }],
    generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (data.error) throw new Error(`API: ${data.error.message}`);

  const parts = data.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((p) => p.inlineData);
  if (!imagePart) throw new Error("No image in response");

  const imgBuffer = Buffer.from(imagePart.inlineData.data, "base64");

  // Resize to exact video dimensions
  const finalBuffer = await sharp(imgBuffer)
    .resize(video.w, video.h, { fit: "cover" })
    .jpeg({ quality: 90 })
    .toBuffer();

  const outPath = path.join(OUTPUT_DIR, video.filename);
  fs.writeFileSync(outPath, finalBuffer);
  return finalBuffer.length;
}

// ============================================================
// Main
// ============================================================
async function main() {
  const startIdx = parseInt(process.argv[2]) || 0;
  const endIdx = parseInt(process.argv[3]) || videos.length;

  console.log(
    `\nGenerating ${endIdx - startIdx} posters (${startIdx + 1} to ${endIdx} of ${videos.length})...\n`,
  );

  let success = 0,
    fail = 0;

  for (let i = startIdx; i < endIdx; i++) {
    const v = videos[i];
    console.log(`[${i + 1}/${videos.length}] ${v.filename}`);
    try {
      const size = await generateImage(v);
      console.log(`  OK (${(size / 1024).toFixed(0)}KB)`);
      success++;
      if (i < endIdx - 1) await new Promise((r) => setTimeout(r, 3000));
    } catch (err) {
      console.log(`  FAIL: ${err.message}`);
      fail++;
    }
  }

  console.log(`\nDone. Success: ${success}, Failed: ${fail}`);
}

main();
