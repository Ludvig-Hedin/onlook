import { updateSession } from '@/utils/supabase/middleware';
import { type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
    // update user's auth session
    return await updateSession(request);
}

export const config = {
    matcher: [
        '/projects/:path*',
        '/project/:path*',
        '/invitation/:path*',
        '/auth/callback',
    ],
};
