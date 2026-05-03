import { spawn } from 'child_process';
import { isAbsolute, resolve as pathResolve, relative } from 'path';
import { z } from 'zod';

const MAX_OUTPUT_BYTES = 1024 * 1024; // 1 MB cap per stream

export const bashSchema = z.object({
    command: z.string().min(1).describe('Shell command to execute'),
    cwd: z.string().optional().describe('Working directory (defaults to project root)'),
    timeout_ms: z
        .number()
        .optional()
        .default(30000)
        .describe('Timeout in milliseconds (default 30s)'),
});

export async function handleBash(
    args: z.infer<typeof bashSchema>,
    projectRoot: string,
): Promise<string> {
    return new Promise((resolveFn, rejectFn) => {
        const root = pathResolve(projectRoot);
        const cwd = args.cwd ? pathResolve(root, args.cwd) : root;
        const rel = relative(root, cwd);
        if (rel.startsWith('..') || isAbsolute(rel)) {
            rejectFn(new Error('cwd must be within the project root'));
            return;
        }

        const child = spawn('bash', ['-c', args.command], {
            cwd,
            env: process.env,
            stdio: ['ignore', 'pipe', 'pipe'],
        });

        let settled = false;
        let stdout = '';
        let stderr = '';
        let stdoutTruncated = false;
        let stderrTruncated = false;

        child.stdout.on('data', (d: Buffer) => {
            if (stdout.length >= MAX_OUTPUT_BYTES) {
                stdoutTruncated = true;
                return;
            }
            const remaining = MAX_OUTPUT_BYTES - stdout.length;
            const chunk = d.toString();
            if (chunk.length > remaining) {
                stdout += chunk.slice(0, remaining);
                stdoutTruncated = true;
            } else {
                stdout += chunk;
            }
        });
        child.stderr.on('data', (d: Buffer) => {
            if (stderr.length >= MAX_OUTPUT_BYTES) {
                stderrTruncated = true;
                return;
            }
            const remaining = MAX_OUTPUT_BYTES - stderr.length;
            const chunk = d.toString();
            if (chunk.length > remaining) {
                stderr += chunk.slice(0, remaining);
                stderrTruncated = true;
            } else {
                stderr += chunk;
            }
        });

        const timeoutMs = args.timeout_ms ?? 30000;
        const timer = setTimeout(() => {
            if (settled) return;
            settled = true;
            child.kill('SIGTERM');
            rejectFn(new Error(`Command timed out after ${timeoutMs}ms`));
        }, timeoutMs);

        child.on('close', (code) => {
            clearTimeout(timer);
            if (settled) return;
            settled = true;
            if (stdoutTruncated) stdout += '\n[stdout truncated]';
            if (stderrTruncated) stderr += '\n[stderr truncated]';
            const out = [stdout, stderr].filter(Boolean).join('\n--- stderr ---\n');
            resolveFn(`exit ${code}\n${out}`.trim());
        });

        child.on('error', (err) => {
            clearTimeout(timer);
            if (settled) return;
            settled = true;
            rejectFn(new Error(`Failed to spawn: ${err.message}`));
        });
    });
}
