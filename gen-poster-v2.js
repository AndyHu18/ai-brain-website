const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const API_KEY = "AIzaSyCTKsiKRWtOk8xNo7xmUDH1m1eZVoFM1nw";
const MODEL = "gemini-3-pro-image-preview";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const OUTPUT_DIR = path.join(__dirname, "assets", "images", "posters");
const REF_IMAGE_PATH = path.join(OUTPUT_DIR, "yoga.jpg");

const STYLE_REF = `Look at the attached reference image. This is the EXACT style I want you to replicate. Key design elements to copy:

1. BACKGROUND: Real scene photo relevant to the business (not gradient, not abstract)
2. PERSON: A person with WHITE OUTLINE BORDER (cutout effect, 5-10px white stroke) positioned at BOTTOM RIGHT, showing an expressive gesture (pointing, surprised, presenting). The person should look excited/amazed.
3. UI MOCKUP: A floating dark UI card/screenshot in the MIDDLE of the image showing the AI feature in action (chat interface, dashboard, notification, etc.)
4. TEXT LAYOUT (top to bottom):
   - LINE 1: HUGE yellow (#FFD600) background block with bold BLACK text (main hook with ? or !)
   - LINE 2: Large text with KEY WORD highlighted in different color/size (emotional emphasis)
   - LINE 3-4: Smaller white text lines (supporting detail)
5. RESULT INDICATOR: Green arrow or +number showing positive results
6. All Chinese text must be perfectly clear, bold sans-serif font, no garbled characters
7. High saturation, vibrant, eye-catching, maximum visual impact`;

// 16:9 橫式的 style guide（service pages & hero）
const STYLE_16x9 = `Look at the attached reference image for style quality reference. Now create a 16:9 HORIZONTAL thumbnail with these rules:
- Premium digital art / cinematic style
- Bold, large Chinese text in solid colored block on the LEFT side
- High contrast, vibrant colors
- All Chinese text must be perfectly clear, bold sans-serif font, no garbled characters
- Eye-catching, maximum visual impact`;

const posters = [
  // === 剩餘 Cases（9:16 直式）— 跳過 yoga/clinic/fashion 已完成 ===
  {
    filename: "bnb.jpg",
    w: 720,
    h: 1280,
    vertical: true,
    prompt: `${STYLE_REF}

Create a NEW thumbnail for a BED & BREAKFAST case study:
- BACKGROUND: Cozy B&B room interior with warm lighting, fluffy bedding, flowers
- PERSON: Warm Taiwanese female B&B host in her 40s at bottom right, white outline border, holding welcome card, caring warm smile
- UI MOCKUP: Dark floating card showing AI welcome message to a guest with weather info and restaurant recommendations
- TEXT:
  Line 1 (yellow block, black text): "客人還沒到？"
  Line 2 (large, "被照顧" highlighted): "就覺得被照顧了！"
  Line 3-4 (white smaller): "AI自動發送入住指南" "每位客人都覺得被記住"
- RESULT: Green "↑回訪率" indicator
- 9:16 vertical`,
  },
  {
    filename: "free-time.jpg",
    w: 720,
    h: 1280,
    vertical: true,
    prompt: `${STYLE_REF}

Create a NEW thumbnail for a PHOTOGRAPHER/FREELANCER case study:
- BACKGROUND: Cozy office/studio with sunset light through window
- PERSON: Relaxed Taiwanese male business owner at bottom right, white outline border, arms behind head, huge relieved smile, eyes slightly closed
- UI MOCKUP: Dark floating card showing AI auto-replying to multiple LINE messages simultaneously
- TEXT:
  Line 1 (yellow block, black text): "三四小時回訊息？"
  Line 2 (large, "AI接" highlighted in blue): "現在AI接！"
  Line 3-4 (white smaller): "把時間還給你" "專注擅長的事"
- RESULT: Green "↓回覆時間" indicator
- 9:16 vertical`,
  },
  {
    filename: "baby-care.jpg",
    w: 720,
    h: 1280,
    vertical: true,
    prompt: `${STYLE_REF}

Create a NEW thumbnail for a BABY CARE SHOP case study:
- BACKGROUND: Pastel baby care store interior with shelves of baby products
- PERSON: Taiwanese female baby care shop owner at bottom right, white outline border, holding baby product, enthusiastic pointing gesture, eyebrows raised
- UI MOCKUP: Dark floating card showing AI chatbot answering detailed baby product questions
- TEXT:
  Line 1 (yellow block, black text): "問什麼？"
  Line 2 (large, "都答得出來" highlighted): "都答得出來！"
  Line 3-4 (white smaller): "AI比你更懂產品" "24小時專業回答"
- RESULT: Green "↑成交率" indicator
- 9:16 vertical`,
  },
  {
    filename: "nail-salon.jpg",
    w: 720,
    h: 1280,
    vertical: true,
    prompt: `${STYLE_REF}

Create a NEW thumbnail for a NAIL SALON case study:
- BACKGROUND: Elegant nail salon interior with pink-lavender decor
- PERSON: Young Taiwanese female nail artist at bottom right, white outline border, looking up from nail work with grateful relieved smile
- UI MOCKUP: Dark floating card showing AI chatbot handling appointment booking in LINE chat
- TEXT:
  Line 1 (yellow block, black text): "手機一直響？"
  Line 2 (large, "AI幫你回" highlighted): "AI幫你回！"
  Line 3-4 (white smaller): "專注手上的客人" "預約AI搞定"
- RESULT: Green "↑預約率" indicator
- 9:16 vertical`,
  },
  {
    filename: "new-orders.jpg",
    w: 720,
    h: 1280,
    vertical: true,
    prompt: `${STYLE_REF}

Create a NEW thumbnail for a LATE-NIGHT ORDERS case study:
- BACKGROUND: Dark bedroom at night with blue-purple ambient light, moonlight
- PERSON: Taiwanese male shop owner in pajamas at bottom right, white outline border, looking at glowing phone with SHOCKED amazed expression, eyes wide, mouth open
- UI MOCKUP: Dark floating card showing order notifications coming in at 1AM, 3AM with amounts
- TEXT:
  Line 1 (dark blue block, yellow text): "半夜睡覺？"
  Line 2 (large, "接單" highlighted in yellow): "AI還在接單！"
  Line 3-4 (white smaller): "你睡覺 AI工作" "24小時不打烊"
- RESULT: Green "+$" indicator
- 9:16 vertical`,
  },
  {
    filename: "handcraft.jpg",
    w: 720,
    h: 1280,
    vertical: true,
    prompt: `${STYLE_REF}

Create a NEW thumbnail for a HANDCRAFT BRAND case study:
- BACKGROUND: Warm wooden handcraft workshop with tools and products
- PERSON: Taiwanese female handcraft artist at bottom right, white outline border, holding handmade piece in one hand and phone in other, proud excited smile
- UI MOCKUP: Dark floating card showing a product photo being uploaded and AI auto-generating product description
- TEXT:
  Line 1 (yellow block, black text): "傳張照片？"
  Line 2 (large, "網站更新" highlighted): "網站就更新了！"
  Line 3-4 (white smaller): "AI寫描述標尺寸" "自動上架"
- RESULT: Green "↑效率" indicator
- 9:16 vertical`,
  },
  {
    filename: "florist.jpg",
    w: 720,
    h: 1280,
    vertical: true,
    prompt: `${STYLE_REF}

Create a NEW thumbnail for a FLORIST case study:
- BACKGROUND: Vibrant flower shop packed with colorful bouquets (pink, red, white roses and carnations)
- PERSON: Busy Taiwanese female florist at bottom right, white outline border, overwhelmed but happy expression, hands raised "can you believe it" gesture
- UI MOCKUP: Dark floating card showing LINE chat with flood of messages and AI auto-replies, message count badge 200+
- TEXT:
  Line 1 (red block, white text): "200則訊息？"
  Line 2 (large, "AI全接了" highlighted): "AI全接了！"
  Line 3-4 (white smaller): "母親節爆單" "成交170筆"
- RESULT: Green "170筆" indicator
- 9:16 vertical`,
  },
  {
    filename: "follow-up.jpg",
    w: 720,
    h: 1280,
    vertical: true,
    prompt: `${STYLE_REF}

Create a NEW thumbnail for a MEETING FOLLOW-UP case study:
- BACKGROUND: Clean modern office meeting room
- PERSON: Professional Taiwanese male office worker at bottom right, white outline border, pointing at organized checklist on tablet, confident OK gesture
- UI MOCKUP: Dark floating card showing AI-generated meeting summary with action items and deadlines
- TEXT:
  Line 1 (dark grey block, white text): "開完會？"
  Line 2 (large, "待辦" highlighted): "待辦自動整理好！"
  Line 3-4 (white smaller): "不用手抄筆記" "AI幫你追進度"
- RESULT: Green "✓整理完成" indicator
- 9:16 vertical`,
  },
  {
    filename: "pricing.jpg",
    w: 720,
    h: 1280,
    vertical: true,
    prompt: `${STYLE_REF}

Create a NEW thumbnail for a PRICING/VALUE case study:
- BACKGROUND: Bright, clean shop interior
- PERSON: Happy Taiwanese female shop owner at bottom right, white outline border, holding piggy bank with one hand, thumbs up with other, big bright smile
- UI MOCKUP: Dark floating card showing cost comparison: crossed-out "工讀生 $28,000/月" vs AI Brain "$4,800/月" with checkmark
- TEXT:
  Line 1 (green block, black text): "比請人便宜？"
  Line 2 (large, "準時" highlighted): "比請人還準時！"
  Line 3-4 (white smaller): "不遲到不請假" "省下來投廣告"
- RESULT: Green "↓50%成本" indicator
- 9:16 vertical`,
  },
  {
    filename: "repurchase.jpg",
    w: 720,
    h: 1280,
    vertical: true,
    prompt: `${STYLE_REF}

Create a NEW thumbnail for a CUSTOMER REPURCHASE case study:
- BACKGROUND: Warm boutique/retail shop interior with golden lighting
- PERSON: Taiwanese female boutique owner at bottom right, white outline border, looking at phone with delighted surprised expression
- UI MOCKUP: Dark floating card showing AI sending personalized re-engagement message to dormant customer, customer replying "好"
- TEXT:
  Line 1 (orange block, black text): "三個月沒來？"
  Line 2 (large, "帶回來" highlighted): "AI自動帶回來！"
  Line 3-4 (white smaller): "記住購買週期" "主動推薦回購"
- RESULT: Green "↑回購率" indicator
- 9:16 vertical`,
  },
  {
    filename: "fitness.jpg",
    w: 720,
    h: 1280,
    vertical: true,
    prompt: `${STYLE_REF}

Create a NEW thumbnail for a FITNESS STUDIO case study:
- BACKGROUND: Modern gym interior with equipment, orange-red accent lighting
- PERSON: Fit Taiwanese male fitness coach in tank top at bottom right, white outline border, flexing one arm, pointing at camera with other hand, big energetic smile
- UI MOCKUP: Dark floating card showing AI chatbot handling class booking inquiries
- TEXT:
  Line 1 (deep orange block, white text): "教練專心教？"
  Line 2 (large, "AI接客" highlighted): "AI幫你接客！"
  Line 3-4 (white smaller): "學員問課表AI回" "你專注教學就好"
- RESULT: Green "↑報名率" indicator
- 9:16 vertical`,
  },
  // === Services（16:9 橫式）===
  {
    filename: "service_chatbot.jpg",
    w: 1280,
    h: 720,
    vertical: false,
    prompt: `${STYLE_16x9}
Create a 16:9 thumbnail for AI CHATBOT SERVICE:
- Futuristic glowing AI chatbot brain hologram with chat bubbles radiating outward
- Deep navy-blue background with electric blue and orange glows
- Large text in orange (#E65100) block with white bold text: "AI智能客服"
- Premium tech digital art style`,
  },
  {
    filename: "service_brand_clone.jpg",
    w: 1280,
    h: 720,
    vertical: false,
    prompt: `${STYLE_16x9}
Create a 16:9 thumbnail for BRAND CLONE SERVICE:
- Business silhouette mirrored by glowing digital twin, connected by golden data streams
- Dark teal background with golden light accents
- Large text in teal (#004D40) block with yellow (#FFD600) bold text: "品牌分身"
- Premium digital art`,
  },
  {
    filename: "service_consultant.jpg",
    w: 1280,
    h: 720,
    vertical: false,
    prompt: `${STYLE_16x9}
Create a 16:9 thumbnail for AI CONSULTANT SERVICE:
- Holographic business dashboard with charts floating in warm amber-dark space
- Golden light particles, premium consulting feel
- Large text in amber (#FFB300) block with black bold text: "AI顧問"
- Cinematic digital art`,
  },
  {
    filename: "service_content_editor.jpg",
    w: 1280,
    h: 720,
    vertical: false,
    prompt: `${STYLE_16x9}
Create a 16:9 thumbnail for AI CONTENT EDITOR SERVICE:
- Creative explosion of photos and social media cards flying from a glowing phone
- Vibrant coral-to-purple gradient space
- Large text in magenta (#AD1457) block with white bold text: "AI內容編輯"
- Creative digital art`,
  },
  {
    filename: "service_meeting_notes.jpg",
    w: 1280,
    h: 720,
    vertical: false,
    prompt: `${STYLE_16x9}
Create a 16:9 thumbnail for AI MEETING NOTES SERVICE:
- Sound waves transforming into organized document pages in cool blue space
- Professional and efficient atmosphere
- Large text in blue (#1565C0) block with white bold text: "AI會議記錄"
- Digital art`,
  },
  {
    filename: "service_voice_receptionist.jpg",
    w: 1280,
    h: 720,
    vertical: false,
    prompt: `${STYLE_16x9}
Create a 16:9 thumbnail for AI VOICE RECEPTIONIST SERVICE:
- Golden sound wave rings radiating from glowing telephone handset
- Deep indigo-to-black gradient with warm orange accents
- Large text in indigo (#311B92) block with yellow (#FFD600) bold text: "AI語音接待"
- Digital art`,
  },
  {
    filename: "hero-video.jpg",
    w: 1280,
    h: 720,
    vertical: false,
    prompt: `Create a cinematic 16:9 horizontal banner. An abstract AI brain made of interconnected golden and electric blue light neurons floating in deep dark space. Business icons (chat, calendar, phone, cart) orbiting like planets. Premium futuristic feel. No text anywhere. High-end digital art.`,
  },
  {
    filename: "ai-solutions-showcase.jpg",
    w: 1280,
    h: 720,
    vertical: false,
    prompt: `${STYLE_16x9}
Create a 16:9 thumbnail for AI SOLUTIONS SHOWCASE:
- Six glowing service cards in radial pattern connected by light trails
- Dark blue-purple gradient background
- Large text in orange (#E65100) block with white bold text: "AI解決方案"
- Premium digital art`,
  },
];

// ============================================================
// API: 直式送參考圖，橫式不送
// ============================================================
async function generatePoster(poster) {
  const url = `${API_URL}?key=${API_KEY}`;

  const parts = [];

  // 直式案例影片：送參考圖
  if (poster.vertical) {
    const refImgBuffer = fs.readFileSync(REF_IMAGE_PATH);
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: refImgBuffer.toString("base64"),
      },
    });
  }

  parts.push({ text: poster.prompt });

  const payload = {
    contents: [{ role: "user", parts }],
    generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (data.error) throw new Error(`API: ${data.error.message}`);

  const resParts = data.candidates?.[0]?.content?.parts || [];
  const imagePart = resParts.find((p) => p.inlineData);
  if (!imagePart) throw new Error("No image in response");

  const imgBuffer = Buffer.from(imagePart.inlineData.data, "base64");
  const finalBuffer = await sharp(imgBuffer)
    .resize(poster.w, poster.h, { fit: "cover" })
    .jpeg({ quality: 90 })
    .toBuffer();

  const outPath = path.join(OUTPUT_DIR, poster.filename);
  fs.writeFileSync(outPath, finalBuffer);
  return finalBuffer.length;
}

// ============================================================
// Main
// ============================================================
async function main() {
  const startIdx = parseInt(process.argv[2]) || 0;
  const endIdx = parseInt(process.argv[3]) || posters.length;

  console.log(
    `\nGenerating posters ${startIdx + 1} to ${endIdx} of ${posters.length}...\n`,
  );

  let success = 0,
    fail = 0;

  for (let i = startIdx; i < endIdx; i++) {
    const p = posters[i];
    console.log(`[${i + 1}/${posters.length}] ${p.filename}`);
    try {
      const size = await generatePoster(p);
      console.log(`  OK (${(size / 1024).toFixed(0)}KB)`);
      success++;
      if (i < endIdx - 1) await new Promise((r) => setTimeout(r, 4000));
    } catch (err) {
      console.log(`  FAIL: ${err.message}`);
      fail++;
    }
  }

  console.log(`\nDone. Success: ${success}, Failed: ${fail}`);
}

main();
