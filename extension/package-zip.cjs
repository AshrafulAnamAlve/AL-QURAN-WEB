/**
 * Al-Quran & Halal Web Shield — Extension Packager
 * Packages the extension folder into a clean .zip ready for Chrome Web Store & Edge Add-ons
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = __dirname;
const distDir = path.join(rootDir, 'dist');
const zipPath = path.join(distDir, 'al-quran-halal-shield-v1.0.0.zip');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

console.log('📦 Packaging Al-Quran Halal Web Shield Extension...');

// Include essential files & folders, exclude dist, package.json, package-zip.cjs, PLAN_EXTENSION.md
const itemsToInclude = [
  'manifest.json',
  'popup',
  'background',
  'content-scripts',
  'blocked',
  'rules',
  'assets',
  'README.md',
];

const pathsToZip = itemsToInclude
  .map((item) => `'${path.join(rootDir, item)}'`)
  .filter((p) => fs.existsSync(p.replace(/'/g, '')))
  .join(', ');

try {
  const psCommand = `Compress-Archive -Path ${pathsToZip} -DestinationPath '${zipPath}' -Force`;
  execSync(`powershell -NoProfile -Command "${psCommand}"`, { stdio: 'inherit' });
  console.log(`✅ Extension packaged successfully to: ${zipPath}`);
} catch (err) {
  console.error('❌ Failed to create zip archive:', err.message);
  process.exit(1);
}
