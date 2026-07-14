const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname);
const args = process.argv.slice(2);

function readArg(name, fallback) {
  const inline = args.find(arg => arg.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

const host = readArg('--host', process.env.HOST || '127.0.0.1');
const port = Number(readArg('--port', process.env.PORT || '4173'));

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function sendText(response, status, text) {
  response.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  response.end(text);
}

function streamFile(request, response, filePath, stat) {
  const contentType = mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
  const range = request.headers.range;
  const headers = {
    'Content-Type': contentType,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'no-store'
  };

  if (range) {
    const match = range.match(/^bytes=(\d*)-(\d*)$/);
    if (!match) return sendText(response, 416, 'Invalid range');
    const start = match[1] ? Number(match[1]) : 0;
    const end = match[2] ? Number(match[2]) : stat.size - 1;
    if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end < start || end >= stat.size) {
      response.writeHead(416, { 'Content-Range': `bytes */${stat.size}` });
      return response.end();
    }
    headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`;
    headers['Content-Length'] = end - start + 1;
    response.writeHead(206, headers);
    if (request.method === 'HEAD') return response.end();
    return fs.createReadStream(filePath, { start, end }).pipe(response);
  }

  headers['Content-Length'] = stat.size;
  response.writeHead(200, headers);
  if (request.method === 'HEAD') return response.end();
  fs.createReadStream(filePath).pipe(response);
}

const server = http.createServer((request, response) => {
  if (!['GET', 'HEAD'].includes(request.method || '')) return sendText(response, 405, 'Method not allowed');

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);
  } catch (error) {
    return sendText(response, 400, 'Bad request');
  }

  const relativePath = pathname.replace(/^[/\\]+/, '') || 'index.html';
  const segments = relativePath.split(/[\\/]+/);
  if (segments.includes('node_modules') || segments.includes('.git')) return sendText(response, 404, 'Not found');

  let filePath = path.resolve(ROOT, relativePath);
  if (filePath !== ROOT && !filePath.startsWith(`${ROOT}${path.sep}`)) return sendText(response, 403, 'Forbidden');

  fs.stat(filePath, (error, stat) => {
    if (error) return sendText(response, 404, 'Not found');
    if (stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      return fs.stat(filePath, (indexError, indexStat) => {
        if (indexError || !indexStat.isFile()) return sendText(response, 404, 'Not found');
        streamFile(request, response, filePath, indexStat);
      });
    }
    if (!stat.isFile()) return sendText(response, 404, 'Not found');
    streamFile(request, response, filePath, stat);
  });
});

server.listen(port, host, () => {
  const displayHost = host === '0.0.0.0' ? 'localhost' : host;
  console.log(`AI Pet Game browser build: http://${displayHost}:${port}/`);
  if (host === '0.0.0.0') console.log('LAN access is enabled. Use this computer\'s LAN IP from another device.');
});

server.on('error', error => {
  console.error(`Browser server failed: ${error.message}`);
  process.exitCode = 1;
});
