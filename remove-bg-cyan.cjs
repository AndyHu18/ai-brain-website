const sharp = require('sharp');
const path = require('path');

const input = path.join(__dirname, 'images', 'portfolio', 'brain-cyan-raw.jpg');
const output = path.join(__dirname, 'images', 'portfolio', 'brain-cyan.png');

async function removeBg() {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const threshold = 55;
  const fadeRange = 30;

  for (let i = 0; i < width * height; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];
    const brightness = (r + g + b) / 3;

    if (brightness < threshold) {
      data[i * channels + 3] = 0;
    } else if (brightness < threshold + fadeRange) {
      data[i * channels + 3] = Math.round(((brightness - threshold) / fadeRange) * 255);
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .png()
    .toFile(output);

  console.log('Done: ' + output);
}

removeBg();
