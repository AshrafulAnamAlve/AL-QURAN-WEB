import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../frontend/dist/frontend/browser');
const PORT = 4200;

if (!fs.existsSync(distDir)) {
  console.error(`Dist directory not found at: ${distDir}`);
  process.exit(1);
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];

  // Strip GitHub Pages prefix if present so all routes & assets map to root
  if (urlPath.startsWith('/AL-QURAN-WEB')) {
    urlPath = urlPath.slice('/AL-QURAN-WEB'.length) || '/';
  }

  let safePath = path.normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(distDir, safePath);

  // If path is a directory or points to root, serve index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // SPA fallback: if file does not exist, serve index.html for Angular routing
  if (!fs.existsSync(filePath)) {
    filePath = path.join(distDir, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Internal Server Error: ${err.message}`);
    } else {
      if (ext === '.html') {
        // Ensure base href is always '/' for local mobile app preview
        let html = content.toString('utf-8');
        html = html.replace(/<base\s+href="[^"]*"/i, '<base href="/"');
        content = Buffer.from(html, 'utf-8');
      }

      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': ext === '.html' ? 'no-cache, no-store, must-revalidate' : 'public, max-age=3600'
      });
      res.end(content);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`  AL-QURAN MOBILE APP IS LIVE ON YOUR LAPTOP!`);
  console.log(`  -> Open in Browser: http://localhost:${PORT}`);
  console.log(`  -> IP Access:       http://127.0.0.1:${PORT}`);
  console.log(`======================================================\n`);
});
