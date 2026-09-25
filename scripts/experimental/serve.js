'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '../..');
const files = new Set(['experimental_word_learning.html', 'experimental_word_learning.css',
    'experimental_word_island.html', 'experimental_word_island_boot.js', 'experimental_word_island_view.js',
    'experimental_word_island_navigation.js', 'data.js', 'island_shared.js', 'view_renderer.js',
    'experimental_word_careers.js',
    'experimental_word_learning_notebook.js',
    'experimental_word_learning_report.js',
    'experimental_word_learning_ui.js', 'experimental_word_learning_core.js',
    'experimental_word_learning_catalog.json', 'localization_core.js', 'localization_catalog.js',
    'experimental_word_learning_world.js', 'experimental_word_learning_view.js', 'experimental_word_learning_visuals.json',
    'robot.png', 'spirit.png', 'seed.png', 'field_2.png']);
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.mp3': 'audio/mpeg' };
function createServer() {
    return http.createServer((request, response) => {
        let name;
        try { name = decodeURIComponent(new URL(request.url, 'http://localhost').pathname).slice(1) || 'experimental_word_island.html'; }
        catch (_) { response.writeHead(400).end(); return; }
        const sharedAsset = /^[a-zA-Z0-9_-]+\.png$/.test(name) || /^bgm_(robot|spirit|seed)\.mp3$/.test(name);
        if (!['GET', 'HEAD'].includes(request.method) || (!files.has(name) && !sharedAsset)) {
            response.writeHead(404).end(); return;
        }
        fs.stat(path.join(ROOT, name), (error, stat) => {
            if (error || !stat.isFile()) { response.writeHead(404).end(); return; }
            const headers = { 'Content-Type': mime[path.extname(name)], 'Cache-Control': 'no-store',
                'X-Content-Type-Options': 'nosniff', 'Accept-Ranges': 'bytes' };
            let start = 0, end = stat.size - 1, status = 200;
            if (request.headers.range) {
                const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range);
                if (range && (range[1] || range[2])) {
                    start = range[1] ? Number(range[1]) : Math.max(0, stat.size - Number(range[2]));
                    end = range[1] && range[2] ? Math.min(Number(range[2]), end) : end;
                } else start = stat.size;
                if (start > end || start >= stat.size) {
                    response.writeHead(416, { 'Content-Range': `bytes */${stat.size}` }).end(); return;
                }
                headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`; status = 206;
            }
            headers['Content-Length'] = Math.max(0, end - start + 1);
            response.writeHead(status, headers);
            if (request.method === 'HEAD' || stat.size === 0) { response.end(); return; }
            const stream = fs.createReadStream(path.join(ROOT, name), { start, end });
            stream.on('error', () => response.destroy());
            response.on('close', () => stream.destroy());
            stream.pipe(response);
        });
    });
}
if (require.main === module) {
    const server = createServer();
    const argument = process.argv.find(arg => arg.startsWith('--port='));
    const port = argument ? Number(argument.slice(7)) : 4175;
    if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid port');
    server.on('error', error => {
        console.error(error.code === 'EADDRINUSE'
            ? `Web preview port ${port} is busy. For the desktop app use npm run start:words. For another web port use npm run start:web:words -- --port=4176.`
            : error.message);
        process.exitCode = 1;
    });
    server.listen(port, '127.0.0.1', () => console.log(`Word learning web preview: http://127.0.0.1:${server.address().port}/`));
    for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
        server.closeAllConnections(); server.close();
    });
}
module.exports = { createServer };
