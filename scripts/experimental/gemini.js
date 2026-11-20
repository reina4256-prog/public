'use strict';
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');
if (process.argv.includes('--login')) {
    const { configuration } = require('./gemini_reply');
    const { install } = require('./antigravity_install');
    const directory = path.join(process.env.APPDATA || path.join(os.homedir(), '.config'), 'AIPetGame-WordLearning-Gemini');
    const config = configuration(directory);
    void install().then(executable => {
        const child = spawn(executable, ['--settings', config.session], { cwd: config.cwd, env: config.env, stdio: 'inherit', windowsHide: false });
        child.on('error', () => { process.exitCode = 1; }); child.on('exit', code => { process.exitCode = code || 0; });
    }).catch(() => { console.error('Antigravity CLI setup failed. Check the download connection and retry.'); process.exitCode = 1; });
} else {
    process.env.WORD_REPLY_MODE = 'gemini-cli';
    if (process.argv.includes('--text-only')) process.env.WORD_TEXT_ONLY = '1';
    require('./launch');
}
