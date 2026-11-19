'use strict';
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');
if (process.argv.includes('--login')) {
    const { configuration, cliEntry } = require('./gemini_reply');
    const directory = path.join(process.env.APPDATA || path.join(os.homedir(), '.config'), 'AIPetGame-WordLearning-Gemini');
    const config = configuration(directory);
    const child = spawn(process.execPath, [cliEntry, '--extensions', 'none', '--admin-policy', config.policy], { cwd: config.cwd, env: config.env, stdio: 'inherit', windowsHide: false });
    child.on('error', () => { process.exitCode = 1; }); child.on('exit', code => { process.exitCode = code || 0; });
} else {
    process.env.WORD_REPLY_MODE = 'gemini-cli';
    require('./launch');
}
