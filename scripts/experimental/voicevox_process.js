'use strict';
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const cp = require('node:child_process');

// Check locally without sending player text or changing engine permissions.
function isRunning() {
    return new Promise(resolve => {
        let done = false;
        const finish = value => { if (!done) { done = true; resolve(value); } };
        const request = http.get('http://127.0.0.1:50021/version', response => {
            let body = '';
            response.setEncoding('utf8');
            response.on('data', part => {
                body += part;
                if (body.length > 1024) { response.destroy(); finish(false); }
            });
            response.on('error', () => finish(false));
            response.on('end', () => {
                try { finish(response.statusCode === 200 && typeof JSON.parse(body) === 'string'); }
                catch { finish(false); }
            });
        });
        const timer = setTimeout(() => { request.destroy(); finish(false); }, 1000);
        request.on('error', () => finish(false));
        request.on('close', () => { clearTimeout(timer); finish(false); });
    });
}

function createVoicevoxProcess(options = {}) {
    const platform = options.platform || process.platform;
    const executable = options.executable || path.resolve(__dirname, '../../../voicevox_engine/run.exe');
    const probe = options.probe || isRunning;
    const exists = options.exists || fs.existsSync;
    const spawn = options.spawn || cp.spawn;
    const log = options.log || (message => console.log('[VOICEVOX] ' + message));
    let child = null;
    let stopped = false;
    let started = false;
    return {
        async start() {
            if (started || stopped) return;
            started = true;
            try {
                if (await probe()) { if (!stopped) log('Using the running engine at 127.0.0.1:50021.'); return; }
                if (stopped || platform !== 'win32') return;
                if (!exists(executable)) { log('Engine not found: ' + executable + '. Continuing with the game.'); return; }
                child = spawn(executable, ['--host', '127.0.0.1', '--port', '50021'], {
                    cwd: path.dirname(executable), windowsHide: true, stdio: 'ignore', shell: false, detached: true
                });
                const owned = child;
                child.on('error', error => { if (child === owned) child = null; log('Could not start the engine: ' + error.message); });
                child.on('exit', code => { if (child === owned) child = null; if (!stopped) log('Engine exited (' + code + '). The game remains available.'); });
                child.unref();
                log('Starting the engine in the background. It stays running for the next game session.');
            } catch (error) { log('Engine startup failed: ' + error.message + '. Continuing with the game.'); }
        },
        stop() {
            // Release ownership only. Never kill a PID or an OS process tree on quit.
            stopped = true;
            child = null;
        }
    };
}
module.exports = { createVoicevoxProcess, isRunning };
