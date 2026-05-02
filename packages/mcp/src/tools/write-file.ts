import { mkdir, writeFile } from 'fs/promises';
import { dirname, isAbsolute, normalize, relative, resolve } from 'path';
import { z } from 'zod';

export const writeFileSchema = z.object({
    file_path: z
        .string()
        .min(1)
        .refine((p) => isAbsolute(p) && !normalize(p).split(/[/\\]/).includes('..'), {
            message: 'file_path must be an absolute path without traversal sequences',
        })
        .describe('Absolute path to write to'),
    content: z.string().describe('Content to write'),
});

export async function handleWriteFile(
    args: z.infer<typeof writeFileSchema>,
    projectRoot?: string,
): Promise<string> {
    if (projectRoot) {
        const resolved = resolve(args.file_path);
        const root = resolve(projectRoot);
        const rel = relative(root, resolved);
        if (rel.startsWith('..') || isAbsolute(rel)) {
            throw new Error('file_path must be within the project root');
        }
    }
    await mkdir(dirname(args.file_path), { recursive: true });
    await writeFile(args.file_path, args.content, 'utf8');
    return `Written: ${args.file_path}`;
}
