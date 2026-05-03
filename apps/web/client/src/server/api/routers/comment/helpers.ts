/**
 * Sanitise user-supplied display names before persisting them.
 * Strips C0/C1 control characters that could break layouts, trims whitespace,
 * and caps length so the field cannot be used for oversized display values.
 *
 * @param raw  Raw value from Supabase user_metadata (user-controllable).
 * @returns    Printable, trimmed, length-capped string (empty string if falsy).
 */
export function sanitiseAuthorName(raw: string | undefined | null): string {
    if (!raw) return '';
    const stripped = Array.from(raw)
        .filter((ch) => {
            const cp = ch.codePointAt(0) ?? 0;
            // Keep printable + supplementary; reject C0 (0–31), DEL (127), C1 (128–159)
            return cp >= 32 && cp !== 127 && !(cp >= 128 && cp <= 159);
        })
        .join('');
    return stripped.trim().slice(0, 100);
}
