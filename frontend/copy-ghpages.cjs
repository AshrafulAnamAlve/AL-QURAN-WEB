const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'dist', 'frontend', 'browser');

if (fs.existsSync(targetDir)) {
  const indexPath = path.join(targetDir, 'index.html');
  const notFoundPath = path.join(targetDir, '404.html');
  const noJekyllPath = path.join(targetDir, '.nojekyll');

  if (fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, notFoundPath);
    console.log('✓ Copied index.html to 404.html for SPA GitHub Pages fallback');
  }

  fs.writeFileSync(noJekyllPath, '', 'utf8');
  console.log('✓ Created .nojekyll file to prevent Jekyll processing');
} else {
  console.warn(`Target build directory does not exist: ${targetDir}`);
}
