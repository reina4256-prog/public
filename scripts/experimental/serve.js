'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '../..');
const files = new Set(['experimental_word_learning.html', 'experimental_word_learning.css',
    'experimental_word_constellation.html', 'experimental_word_constellation.css', 'experimental_word_constellation.js',
    'assets/fonts/diary/Yomogi-Regular.ttf', 'assets/fonts/diary/LXGWWenKai-Regular.ttf', 'assets/fonts/diary/Caveat.ttf',
    'experimental_word_diary.html', 'experimental_word_diary.css', 'experimental_word_diary.js',
    'experimental_word_island.html', 'experimental_word_island_boot.js', 'experimental_word_island_view.js',
    'experimental_word_island_navigation.js', 'data.js', 'island_shared.js', 'view_renderer.js',
    'experimental_word_careers.js', 'experimental_word_life_learning.js', 'experimental_word_relation_learning.js', 'experimental_word_feeling_learning.js',
    'experimental_word_learning_notebook.js',
    'experimental_word_learning_report.js',
    'experimental_word_learning_ui.js', 'experimental_word_start_questions.js', 'experimental_word_learning_core.js',
    'experimental_word_learning_catalog.json', 'localization_core.js', 'localization_catalog.js',
    'experimental_word_learning_world.js', 'experimental_word_learning_view.js', 'experimental_word_learning_visuals.json',
    'robot.png', 'spirit.png', 'seed.png', 'field_2.png']);
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.ttf': 'font/ttf', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4' };
const encounterVideos = new Set(Object.values(require('../../experimental_word_careers').VIDEOS));
function createServer(options = {}) {
    return http.createServer((request, response) => {
        let name;
        try { name = decodeURIComponent(new URL(request.url, 'http://localhost').pathname).slice(1) || 'experimental_word_island.html'; }
        catch (_) { response.writeHead(400).end(); return; }
        if (name === 'experimental_word_encounter_videos.json' && ['GET', 'HEAD'].includes(request.method)) {
            const available = options.encounterVideos === false ? [] : [...encounterVideos].filter(file => fs.existsSync(path.join(ROOT, file)));
            const body = JSON.stringify(available);
            response.writeHead(200, { 'Content-Type': mime['.json'], 'Cache-Control': 'no-store' });
            response.end(request.method === 'HEAD' ? undefined : body); return;
        }
        const sharedAsset = /^[a-zA-Z0-9_-]+\.png$/.test(name) || /^bgm_(robot|spirit|seed|ghost|stone|magician|beetle|balloon|bird|machine|dragon|title_main|personality)\.mp3$/.test(name);
        if (!['GET', 'HEAD'].includes(request.method) || (!files.has(name) && !sharedAsset && !(encounterVideos.has(name) && options.encounterVideos !== false))) {
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
