import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { build as viteBuild } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const targetArg = args.find((a) => a.startsWith('--target='));
const selectedTarget = targetArg ? targetArg.split('=')[1] : 'all';

async function buildExtension() {
  console.log('🚀 Starting MyTab Extension Build Process...');

  const distBase = path.resolve(rootDir, 'dist');
  const tempBuildDir = path.resolve(distBase, '.temp');

  await fs.remove(tempBuildDir);
  await fs.ensureDir(tempBuildDir);

  // 1. Run Vite Build
  console.log('📦 Compiling TypeScript & React assets with Vite...');
  await viteBuild({
    root: rootDir,
    base: './',
    build: {
      outDir: tempBuildDir,
      emptyOutDir: true,
    },
  });

  const targets = selectedTarget === 'all' ? ['chrome', 'firefox'] : [selectedTarget];

  for (const target of targets) {
    console.log(`\n⚙️ Generating target: [${target.toUpperCase()}]...`);
    const targetDir = path.resolve(distBase, target);
    await fs.remove(targetDir);
    await fs.copy(tempBuildDir, targetDir);

    // Copy public icons
    const iconsSrc = path.resolve(rootDir, 'public/icons');
    const iconsDest = path.resolve(targetDir, 'icons');
    if (fs.existsSync(iconsSrc)) {
      await fs.copy(iconsSrc, iconsDest);
    }

    // Copy public wallpapers
    const wallpapersSrc = path.resolve(rootDir, 'public/wallpapers');
    const wallpapersDest = path.resolve(targetDir, 'wallpapers');
    if (fs.existsSync(wallpapersSrc)) {
      await fs.copy(wallpapersSrc, wallpapersDest);
    }

    // Copy public _locales
    const localesSrc = path.resolve(rootDir, 'public/_locales');
    const localesDest = path.resolve(targetDir, '_locales');
    if (fs.existsSync(localesSrc)) {
      await fs.copy(localesSrc, localesDest);
    }

    // Rename index.html or mytab.html to newtab.html if needed
    const indexHtml = path.resolve(targetDir, 'index.html');
    const mytabHtml = path.resolve(targetDir, 'mytab.html');
    const newtabHtml = path.resolve(targetDir, 'newtab.html');
    if (fs.existsSync(indexHtml)) {
      await fs.move(indexHtml, newtabHtml, { overwrite: true });
    }
    if (fs.existsSync(mytabHtml)) {
      await fs.move(mytabHtml, newtabHtml, { overwrite: true });
    }

    // Clean up any remaining src folder
    const srcInTarget = path.resolve(targetDir, 'src');
    if (fs.existsSync(srcInTarget)) {
      await fs.remove(srcInTarget);
    }

    const pkgJson = await fs.readJson(path.resolve(rootDir, 'package.json'));
    const manifest = {
      manifest_version: 3,
      name: '__MSG_extensionName__',
      description: '__MSG_extensionDescription__',
      default_locale: 'zh_CN',
      version: pkgJson.version || '1.0.1',
      author: 'Troray',
      homepage_url: 'https://github.com/Troray/MyTab',
      icons: {
        '16': 'icons/icon-16.png',
        '32': 'icons/icon-32.png',
        '48': 'icons/icon-48.png',
        '128': 'icons/icon-128.png',
        '512': 'icons/icon-512.png',
      },
      action: {
        default_title: '__MSG_extensionName__',
        default_popup: 'popup.html',
        default_icon: {
          '16': 'icons/icon-16.png',
          '32': 'icons/icon-32.png',
          '48': 'icons/icon-48.png',
        },
      },
      chrome_url_overrides: {
        newtab: 'newtab.html',
      },
      permissions: ['storage', 'alarms', 'unlimitedStorage'],
      host_permissions: ['https://*/*', 'http://*/*'],
    };

    if (target === 'chrome') {
      manifest.background = {
        service_worker: 'background.js',
        type: 'module',
      };
    } else if (target === 'firefox') {
      manifest.background = {
        scripts: ['background.js'],
        type: 'module',
      };
      manifest.chrome_settings_overrides = {
        homepage: 'newtab.html',
      };
      manifest.browser_specific_settings = {
        gecko: {
          id: 'mytab@addon.local',
          strict_min_version: '109.0',
        },
      };
    }

    await fs.writeJson(path.resolve(targetDir, 'manifest.json'), manifest, { spaces: 2 });
    console.log(`✅ ${target.toUpperCase()} extension generated at: ${targetDir}`);
  }

  // Clean temp
  await fs.remove(tempBuildDir);
  console.log('\n✨ All extension builds finished successfully!');
}

buildExtension().catch((err) => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
