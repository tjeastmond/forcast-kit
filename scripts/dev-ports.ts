import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

export const UI_DIR = path.join(ROOT, 'apps/ui');
export const NEXT_DIR = path.join(UI_DIR, '.next');

export const DEFAULT_API_PORT = 3847;
export const DEFAULT_UI_PORT = 3848;

function listPortPids(port: number): number[] {
  if (process.platform === 'win32') {
    return [];
  }

  try {
    const output = execSync(`lsof -ti :${port}`, { encoding: 'utf8' }).trim();
    if (!output) {
      return [];
    }

    return output
      .split('\n')
      .map((value) => Number.parseInt(value, 10))
      .filter((pid) => Number.isFinite(pid) && pid !== process.pid);
  } catch {
    return [];
  }
}

function listChildPids(pid: number): number[] {
  if (process.platform === 'win32') {
    return [];
  }

  try {
    const output = execSync(`pgrep -P ${pid}`, { encoding: 'utf8' }).trim();
    if (!output) {
      return [];
    }

    return output
      .split('\n')
      .map((value) => Number.parseInt(value, 10))
      .filter(Number.isFinite);
  } catch {
    return [];
  }
}

function killProcessTree(pid: number, signal: NodeJS.Signals): void {
  for (const childPid of listChildPids(pid)) {
    killProcessTree(childPid, signal);
  }

  try {
    process.kill(pid, signal);
  } catch {
    // process already exited
  }
}

/** Stop processes listening on `port` so a fresh Next/API dev server can bind. */
export function killPort(port: number): void {
  const pids = listPortPids(port);
  if (pids.length === 0) {
    return;
  }

  for (const pid of pids) {
    killProcessTree(pid, 'SIGTERM');
  }
}

export function killExplorerPorts(apiPort = DEFAULT_API_PORT, uiPort = DEFAULT_UI_PORT): void {
  killPort(apiPort);
  killPort(uiPort);
}

export function cleanNextDir(nextDir = NEXT_DIR): void {
  if (!existsSync(nextDir)) {
    return;
  }

  rmSync(nextDir, { recursive: true, force: true });
  console.log('Removed apps/ui/.next');
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
