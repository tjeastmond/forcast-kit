#!/usr/bin/env bun
import { spawn } from 'node:child_process';
import { cleanNextDir, DEFAULT_UI_PORT, killPort, sleep, UI_DIR } from './dev-ports';

killPort(DEFAULT_UI_PORT);
await sleep(300);
cleanNextDir();

const child = spawn('bun', ['x', 'next', 'dev', '--port', String(DEFAULT_UI_PORT)], {
  cwd: UI_DIR,
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  process.exit(code ?? (signal ? 1 : 0));
});
