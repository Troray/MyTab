import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

async function findBrowser() {
  for (const p of chromePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function renderSvgToPng(browserPath, svgPath, outPngPath, size) {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: ${size}px; height: ${size}px; overflow: hidden; background: transparent; }
    img { width: ${size}px; height: ${size}px; display: block; }
  </style>
</head>
<body>
  <img src="file://${svgPath.replace(/\\/g, '/')}" />
</body>
</html>`;

  const tempHtml = path.resolve(rootDir, `.temp-icon-${size}.html`);
  await fs.writeFile(tempHtml, htmlContent, 'utf-8');

  try {
    await execFileAsync(browserPath, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      `--window-size=${size},${size}`,
      '--default-background-color=00000000',
      `--screenshot=${outPngPath}`,
      `file://${tempHtml.replace(/\\/g, '/')}`
    ]);
    console.log(`✅ Generated: ${path.basename(outPngPath)} (${size}x${size})`);
  } finally {
    await fs.remove(tempHtml);
  }
}

async function generateAllIcons() {
  const browserPath = await findBrowser();
  if (!browserPath) {
    console.error('❌ No Chrome / Edge browser found to render icons.');
    process.exit(1);
  }

  const svgPath = path.resolve(rootDir, 'public/icons/icon.svg');
  const iconsDir = path.resolve(rootDir, 'public/icons');
  await fs.ensureDir(iconsDir);

  const sizes = [16, 32, 48, 128, 512];

  for (const size of sizes) {
    const outPng = path.resolve(iconsDir, `icon-${size}.png`);
    await renderSvgToPng(browserPath, svgPath, outPng, size);
  }

  console.log('\n🎉 All icons generated successfully in public/icons/');
}

generateAllIcons().catch((err) => {
  console.error('❌ Error generating icons:', err);
  process.exit(1);
});
