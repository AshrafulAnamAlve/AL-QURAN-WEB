const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../frontend/dist/frontend/browser');
const dest = path.resolve(__dirname, 'dist/frontend/browser');

if (!fs.existsSync(src)) {
  console.error('[copy-frontend] Source directory does not exist:', src);
  process.exit(1);
}

if (fs.existsSync(dest)) {
  fs.rmSync(dest, { recursive: true, force: true });
}

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.cpSync(src, dest, { recursive: true });
console.log('[copy-frontend] Successfully synced frontend to desktop/dist/frontend/browser');
