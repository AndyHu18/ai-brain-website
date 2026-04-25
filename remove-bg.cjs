const sharp = require('sharp');
const path = require('path');

const input = path.join(__dirname, 'images', 'portfolio', 'brain-ai.jpg');
const output = path.join(__dirname, 'images', 'portfolio', 'brain-ai.png');

async function removeBg() {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const threshold = 85; // pixels darker than this become transparent

  for (let i = 0; i < width * height; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];

    // Calculate brightness
    const brightness = (r + g + b) / 3;

    if (brightness < threshold) {
      // Dark pixel -> fully transparent
      data[i * channels + 3] = 0;
    } else if (brightness < threshold + 30) {
      // Semi-dark -> fade out gradually
      const alpha = Math.round(((brightness - threshold) / 30) * 255);
      data[i * channels + 3] = alpha;
    }
    // Bright pixels keep full opacity
  }

  await sharp(data, { raw: { width, height, channels } })
    .png()
    .toFile(output);

  console.log('Done: ' + output);
}

removeBg();
