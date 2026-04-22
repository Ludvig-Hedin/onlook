'use client';

import { LocalForageKeys, Routes } from '@/utils/constants';
import { sanitizeReturnUrl } from '@/utils/url';
import localforage from 'localforage';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthRedirect() {
    const router = useRouter();

    useEffect(() => {
        const handleRedirect = async () => {
            const returnUrl = await localforage.getItem<string>(LocalForageKeys.RETURN_URL);
            await localforage.removeItem(LocalForageKeys.RETURN_URL);

            // Redirect to the intended destination, defaulting to the projects page.
            const sanitizedUrl = sanitizeReturnUrl(returnUrl);
            router.replace(sanitizedUrl === Routes.HOME ? Routes.PROJECTS : sanitizedUrl);
        };
        handleRedirect();
    }, [router]);

    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-semibold mb-4">Redirecting...</h1>
                <p className="text-foreground-secondary">Please wait while we redirect you back.</p>
            </div>
        </div>
    );
} 
