import { type NextRequest } from 'next/server';

import { env } from '@/env';
import { getSupabaseUser } from '../chat/helpers';
import { checkTranscribeRateLimit } from './helpers/rate-limit';

// Whisper accepts files up to 25 MB.
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
const ALLOWED_AUDIO_PREFIXES = ['audio/'];

// OpenRouter exposes an OpenAI-compatible audio transcription endpoint.
// If your OpenRouter account doesn't have audio access enabled, swap this URL
// to OpenAI direct (https://api.openai.com/v1/audio/transcriptions) with the
// OPENAI_API_KEY env var.
const OPENROUTER_TRANSCRIPTIONS_URL = 'https://openrouter.ai/api/v1/audio/transcriptions';
const TRANSCRIPTION_MODEL = 'openai/whisper-1';

interface TranscriptionResponse {
    text?: string;
    error?: { message?: string } | string;
}

export async function POST(req: NextRequest) {
    try {
        const user = await getSupabaseUser(req);
        if (!user) {
            return jsonError(401, 'Unauthorized. Please sign in to use voice input.');
        }

        const limit = checkTranscribeRateLimit(user.id);
        if (!limit.allowed) {
            return new Response(
                JSON.stringify({
                    error: 'Too many transcription requests. Please slow down.',
                    retryAfterSeconds: limit.retryAfterSeconds,
                }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'Retry-After': String(limit.retryAfterSeconds),
                    },
                },
            );
        }

        const form = await req.formData();
        const file = form.get('file');
        const language = form.get('language');

        if (!(file instanceof Blob)) {
            return jsonError(400, 'Missing audio file.');
        }
        if (file.size === 0) {
            return jsonError(400, 'Audio file is empty.');
        }
        if (file.size > MAX_AUDIO_BYTES) {
            return jsonError(413, 'Audio file too large (max 25 MB).');
        }
        if (file.type && !ALLOWED_AUDIO_PREFIXES.some((p) => file.type.startsWith(p))) {
            return jsonError(415, `Unsupported audio type: ${file.type}`);
        }

        if (!env.OPENROUTER_API_KEY) {
            return jsonError(500, 'Transcription is not configured on the server.');
        }

        const upstream = new FormData();
        // Whisper infers extension from the filename; preserve it when possible.
        const inputName = file instanceof File && file.name ? file.name : 'audio.webm';
        upstream.append('file', file, inputName);
        upstream.append('model', TRANSCRIPTION_MODEL);
        upstream.append('response_format', 'json');
        // English + Swedish are primary; Whisper auto-detects when no language is set,
        // so we only forward an explicit hint if the client sent one.
        if (typeof language === 'string' && language.length > 0) {
            upstream.append('language', language);
        }

        // Bound the upstream call so a hung Whisper request can't tie up the
        // serverless function for its full timeout window.
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90_000);

        let response: Response;
        try {
            response = await fetch(OPENROUTER_TRANSCRIPTIONS_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
                    'HTTP-Referer': 'https://weblab.build',
                    'X-Title': 'Weblab',
                },
                body: upstream,
                signal: controller.signal,
            });
        } finally {
            clearTimeout(timeoutId);
        }

        if (!response.ok) {
            const message = await safeReadError(response);
            console.error('[transcribe] upstream error', response.status, message);
            return jsonError(
                response.status >= 500 ? 502 : response.status,
                `Transcription failed: ${message}`,
            );
        }

        const data = (await response.json()) as TranscriptionResponse;
        const text = (data?.text ?? '').trim();

        return new Response(JSON.stringify({ text }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: unknown) {
        console.error('[transcribe] error', error);
        if (error instanceof Error && error.name === 'AbortError') {
            return jsonError(504, 'Transcription request timed out.');
        }
        // Don't leak internal error details (paths, stack traces, etc.) to clients.
        return jsonError(500, 'An unexpected error occurred during transcription.');
    }
}

function jsonError(status: number, message: string) {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

async function safeReadError(response: Response): Promise<string> {
    try {
        const data = (await response.json()) as TranscriptionResponse;
        if (typeof data?.error === 'string') return data.error;
        if (data?.error?.message) return data.error.message;
        return `HTTP ${response.status}`;
    } catch {
        return `HTTP ${response.status}`;
    }
}
