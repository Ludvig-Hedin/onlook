import { spawn } from 'child_process';
import { isAbsolute, resolve as pathResolve, relative } from 'path';
import { z } from 'zod';

export const typecheckSchema = z.object({
    cwd: z.string().optional().describe('Directory to run typecheck in (defaults to project root)'),
});

export async function handleTypecheck(
    args: z.infer<typeof typecheckSchema>,
    projectRoot: string,
): Promise<string> {
    return new Promise((resolveFn) => {
        const root = pathResolve(projectRoot);
        const cwd = args.cwd ? pathResolve(root, args.cwd) : root;
        const rel = relative(root, cwd);
        if (rel.startsWith('..') || isAbsolute(rel)) {
            resolveFn('✗ Error: cwd must be within the project root');
            return;
        }

        let settled = false;
        const settle = (value: string) => {
            if (settled) return;
            settled = true;
            resolveFn(value);
        };

        const child = spawn('bun', ['typecheck'], {
            cwd,
            env: process.env,
            stdio: ['ignore', 'pipe', 'pipe'],
        });

        let stdout = '';
        let stderr = '';
        child.stdout.on('data', (d: Buffer) => {
            stdout += d.toString();
        });
        child.stderr.on('data', (d: Buffer) => {
            stderr += d.toString();
        });

        const timer = setTimeout(() => {
            child.kill('SIGTERM');
            settle('Typecheck timed out after 60s');
        }, 60000);

        child.on('close', (code) => {
            clearTimeout(timer);
            const output = [stdout, stderr].filter(Boolean).join('\n');
            settle(
                code === 0
                    ? `✓ No type errors\n${output}`.trim()
                    : `✗ Type errors found\n${output}`.trim(),
            );
        });

        child.on('error', () => {
            clearTimeout(timer);
            // Fallback to tsc if bun typecheck not available
            const tsc = spawn('npx', ['tsc', '--noEmit'], {
                cwd,
                env: process.env,
                stdio: ['ignore', 'pipe', 'pipe'],
            });
            let o = '';
            tsc.stdout.on('data', (d: Buffer) => {
                o += d.toString();
            });
            tsc.stderr.on('data', (d: Buffer) => {
                o += d.toString();
            });

            const tscTimer = setTimeout(() => {
                tsc.kill('SIGTERM');
                settle('Typecheck (tsc) timed out after 60s');
            }, 60000);

            tsc.on('close', (c) => {
                clearTimeout(tscTimer);
                settle(c === 0 ? `✓ No type errors` : `✗ Type errors\n${o}`.trim());
            });

            tsc.on('error', (err) => {
                clearTimeout(tscTimer);
                settle(`✗ Failed to run typecheck: ${err.message}`);
            });
        });
    });
}
