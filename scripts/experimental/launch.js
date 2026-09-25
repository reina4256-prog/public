'use strict';
const { spawn } = require('node:child_process');
const path = require('node:path');
const environment = { ...process.env };
// Some development hosts use Electron as Node; this entry always launches the GUI.
delete environment.ELECTRON_RUN_AS_NODE;
const child = spawn(require('electron'), [path.join(__dirname, 'electron.js')], {
    env: environment, stdio: 'inherit', windowsHide: false
});
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code || 0; });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { if (!child.killed) child.kill(); });
