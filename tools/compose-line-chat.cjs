const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// LINE chat mockup as SVG with embedded styles
const svgChat = `
<svg width="280" height="500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;600&amp;display=swap');
      text, tspan { font-family: 'Noto Sans TC', 'Microsoft JhengHei', sans-serif; }
    </style>
  </defs>

  <!-- Background -->
  <rect width="280" height="500" fill="#7494C0"/>

  <!-- Header -->
  <rect width="280" height="52" fill="#06C755"/>
  <text x="14" y="32" fill="white" font-size="18">‹</text>
  <!-- Avatar circle -->
  <circle cx="50" cy="26" r="16" fill="white"/>
  <text x="44" y="31" font-size="14">🤖</text>
  <text x="74" y="32" fill="white" font-size="14" font-weight="600">AI 智能客服</text>

  <!-- Date divider -->
  <text x="140" y="78" fill="rgba(255,255,255,0.75)" font-size="10" text-anchor="middle">今天 凌晨 2:47</text>

  <!-- Sent message 1: 半夜了還能下單嗎？ -->
  <text x="152" y="103" fill="rgba(255,255,255,0.6)" font-size="8">已讀</text>
  <text x="155" y="115" fill="rgba(255,255,255,0.6)" font-size="9">2:47</text>
  <rect x="172" y="90" width="96" height="32" rx="16" fill="#06C755"/>
  <text x="182" y="111" fill="white" font-size="12">半夜了還能下單嗎？</text>

  <!-- Received message 1 -->
  <circle cx="22" cy="152" r="14" fill="white"/>
  <text x="16" y="157" font-size="12">🤖</text>
  <rect x="42" y="130" width="170" height="48" rx="16" fill="white"/>
  <text x="54" y="150" fill="#333" font-size="11">當然可以！我 24 小時在線</text>
  <text x="54" y="166" fill="#333" font-size="11">😊 請問您想看哪款商品呢？</text>
  <text x="216" y="174" fill="rgba(255,255,255,0.6)" font-size="9">2:47</text>

  <!-- Sent message 2 -->
  <text x="108" y="203" fill="rgba(255,255,255,0.6)" font-size="8">已讀</text>
  <text x="111" y="215" fill="rgba(255,255,255,0.6)" font-size="9">2:48</text>
  <rect x="128" y="192" width="140" height="32" rx="16" fill="#06C755"/>
  <text x="138" y="213" fill="white" font-size="12">上次看的那個禮盒組還有嗎</text>

  <!-- Received message 2 -->
  <circle cx="22" cy="258" r="14" fill="white"/>
  <text x="16" y="263" font-size="12">🤖</text>
  <rect x="42" y="234" width="175" height="48" rx="16" fill="white"/>
  <text x="54" y="254" fill="#333" font-size="11">有的！經典禮盒組目前庫存充</text>
  <text x="54" y="270" fill="#333" font-size="11">足，需要幫您直接下單嗎？</text>
  <text x="221" y="278" fill="rgba(255,255,255,0.6)" font-size="9">2:48</text>

  <!-- Input bar -->
  <rect y="452" width="280" height="48" fill="#F7F7F7"/>
  <line x1="0" y1="452" x2="280" y2="452" stroke="#E0E0E0"/>
  <circle cx="22" cy="476" r="14" fill="#BDBDBD"/>
  <text x="17" y="481" fill="white" font-size="16">+</text>
  <rect x="44" y="460" width="190" height="32" rx="16" fill="white" stroke="#DCDCDC"/>
  <text x="248" y="481" font-size="16" fill="#757575">🎤</text>
</svg>`;

async function compose() {
  const originalPath = path.join(__dirname, '..', 'images', 'portfolio', 'line-ai.jpg');
  const outputPath = path.join(__dirname, '..', 'images', 'portfolio', 'line-ai-composed.jpg');

  // Create LINE chat screenshot from SVG
  const chatPng = await sharp(Buffer.from(svgChat))
    .png()
    .toBuffer();

  // Save for debug
  fs.writeFileSync(path.join(__dirname, 'line-chat-debug.png'), chatPng);
  console.log('Chat PNG saved for debug');

  // Get original image info
  const originalMeta = await sharp(originalPath).metadata();
  console.log('Original:', originalMeta.width, 'x', originalMeta.height);

  // Phone screen area in the original image (approximate coordinates)
  // The phone is roughly in the center-left, screen area needs manual identification
  // From the image: phone screen is approximately at x:440-640, y:80-580 in 1312x816
  // Let's resize chat to fit phone screen and composite

  const screenWidth = 190;
  const screenHeight = 340;
  const screenX = 455;
  const screenY = 100;

  const resizedChat = await sharp(chatPng)
    .resize(screenWidth, screenHeight, { fit: 'fill' })
    .toBuffer();

  // Composite onto original
  await sharp(originalPath)
    .composite([{
      input: resizedChat,
      left: screenX,
      top: screenY,
    }])
    .jpeg({ quality: 92 })
    .toFile(outputPath);

  console.log('Composed image saved to:', outputPath);
}

compose().catch(e => console.error(e));
