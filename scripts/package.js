import fs from 'fs-extra';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distBase = path.resolve(rootDir, 'dist');

async function zipDirectory(sourceDir, outPath) {
  const archive = archiver('zip', { zlib: { level: 9 } });
  const stream = fs.createWriteStream(outPath);

  return new Promise((resolve, reject) => {
    archive
      .directory(sourceDir, false)
      .on('error', (err) => reject(err))
      .pipe(stream);

    stream.on('close', () => {
      const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
      console.log(`📦 Created ${path.basename(outPath)} (${sizeMB} MB / ${archive.pointer()} bytes)`);
      resolve();
    });

    archive.finalize();
  });
}

async function packageExtensions() {
  console.log('🗜️ Starting packaging of MyTab release zip files...');

  const chromeDir = path.resolve(distBase, 'chrome');
  const firefoxDir = path.resolve(distBase, 'firefox');

  if (!fs.existsSync(chromeDir) || !fs.existsSync(firefoxDir)) {
    console.error('❌ Build output directories not found. Please run "npm run build" first.');
    process.exit(1);
  }

  const chromeZip = path.resolve(distBase, 'mytab-chrome.zip');
  const firefoxZip = path.resolve(distBase, 'mytab-firefox.zip');
  const sourceZip = path.resolve(distBase, 'mytab-source.zip');

  await zipDirectory(chromeDir, chromeZip);
  await zipDirectory(firefoxDir, firefoxZip);

  // Package clean source code for AMO review
  const sourceArchive = archiver('zip', { zlib: { level: 9 } });
  const sourceStream = fs.createWriteStream(sourceZip);
  await new Promise((resolve, reject) => {
    sourceArchive
      .glob('**/*', {
        cwd: rootDir,
        ignore: ['node_modules/**', 'dist/**', '.git/**', '.temp/**', '*.zip'],
        dot: true,
      })
      .on('error', reject)
      .pipe(sourceStream);

    sourceStream.on('close', () => {
      const sizeMB = (sourceArchive.pointer() / 1024 / 1024).toFixed(2);
      console.log(`📦 Created ${path.basename(sourceZip)} (${sizeMB} MB / ${sourceArchive.pointer()} bytes)`);
      resolve();
    });

    sourceArchive.finalize();
  });

  console.log('\n🎉 All packages created successfully in "dist/" folder!');
  console.log(`- Chrome Extension:  ${chromeZip}`);
  console.log(`- Firefox Extension: ${firefoxZip}`);
  console.log(`- Source Code (AMO): ${sourceZip}`);
}

packageExtensions().catch((err) => {
  console.error('❌ Packaging failed:', err);
  process.exit(1);
});
