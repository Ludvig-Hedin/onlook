import { readFile, readdir, stat } from 'fs/promises';
import { join } from 'path';
import { spawn } from 'child_process';

async function gitBranch(cwd: string): Promise<string> {
    return new Promise(resolve => {
        const child = spawn('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
            cwd,
            stdio: ['ignore', 'pipe', 'ignore'],
        });
        let out = '';
        child.stdout.on('data', (d: Buffer) => { out += d.toString(); });
        child.on('close', () => resolve(out.trim() || 'unknown'));
        child.on('error', () => resolve('unknown'));
    });
}

async function topLevelFiles(dir: string): Promise<string[]> {
    const entries = await readdir(dir).catch(() => [] as string[]);
    const ignore = new Set(['node_modules', '.git', '.next', 'dist', '.turbo']);
    const results: string[] = [];
    for (const name of entries) {
        if (ignore.has(name) || name.startsWith('.')) continue;
        const s = await stat(join(dir, name)).catch(() => null);
        if (!s) continue;
        results.push(s.isDirectory() ? `${name}/` : name);
    }
    return results.sort();
}

export async function getProjectInfo(projectRoot: string): Promise<string> {
    const [branch, files] = await Promise.all([
        gitBranch(projectRoot),
        topLevelFiles(projectRoot),
    ]);

    let name = 'unknown';
    const pkgPath = join(projectRoot, 'package.json');
    const pkgRaw = await readFile(pkgPath, 'utf8').catch(() => null);
    if (pkgRaw) {
        try {
            name = (JSON.parse(pkgRaw) as { name?: string }).name ?? 'unknown';
        } catch { /* ignore */ }
    }

    return JSON.stringify({
        project: name,
        root: projectRoot,
        branch,
        files,
    }, null, 2);
}
