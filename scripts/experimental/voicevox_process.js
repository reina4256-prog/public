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

function stopProcessTree(child, platform = process.platform) {
    if (platform === 'win32') cp.execFileSync('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'],
        { windowsHide: true, stdio: 'ignore', timeout: 5000 });
    else child.kill();
}

function createVoicevoxProcess(options = {}) {
    const platform = options.platform || process.platform;
    const executable = options.executable || path.resolve(__dirname, '../../../voicevox_engine/run.exe');
    const probe = options.probe || isRunning;
    const exists = options.exists || fs.existsSync;
    const spawn = options.spawn || cp.spawn;
    const log = options.log || (message => console.log('[VOICEVOX] ' + message));
    const terminate = options.terminate || (child => stopProcessTree(child, platform));
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
                    cwd: path.dirname(executable), windowsHide: true, stdio: 'inherit', shell: false
                });
                const owned = child;
                child.on('error', error => { if (child === owned) child = null; log('Could not start the engine: ' + error.message); });
                child.on('exit', code => { if (child === owned) child = null; if (!stopped) log('Engine exited (' + code + '). The game remains available.'); });
                log('Starting the engine in the background. Connect in the voice settings after startup completes.');
            } catch (error) { log('Engine startup failed: ' + error.message + '. Continuing with the game.'); }
        },
        stop() {
            stopped = true;
            if (!child || !child.pid || child.exitCode != null || child.signalCode != null) return;
            try { terminate(child); }
            catch (error) { log('Could not stop the engine started by this game: ' + error.message); }
            child = null;
        }
    };
}
module.exports = { createVoicevoxProcess, isRunning, stopProcessTree };
