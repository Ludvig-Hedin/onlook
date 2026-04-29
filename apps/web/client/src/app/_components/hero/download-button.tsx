'use client';

import { ExternalRoutes } from '@/utils/constants';
import { Button } from '@onlook/ui/button';
import { Icons } from '@onlook/ui/icons';
import { useEffect, useState } from 'react';

type Platform = 'mac' | 'win' | 'linux' | 'other';

function detectPlatform(): Platform {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('macintosh') || ua.includes('mac os x')) return 'mac';
    if (ua.includes('windows')) return 'win';
    if (ua.includes('linux') && !ua.includes('android')) return 'linux';
    return 'other';
}

const PLATFORM_LABELS: Record<Platform, string> = {
    mac: 'Download for Mac',
    win: 'Download for Windows',
    linux: 'Download for Linux',
    other: 'Download',
};

const PLATFORM_URLS: Record<Platform, string> = {
    mac: ExternalRoutes.DOWNLOAD_MAC,
    win: ExternalRoutes.DOWNLOAD_WIN,
    linux: ExternalRoutes.DOWNLOAD_LINUX,
    other: ExternalRoutes.DOWNLOAD_PAGE,
};

export function DownloadButton() {
    const [platform, setPlatform] = useState<Platform>('other');

    useEffect(() => {
        setPlatform(detectPlatform());
    }, []);

    return (
        <Button asChild variant="outline" className="border-foreground-secondary/30 text-foreground-primary hover:bg-foreground-secondary/10">
            <a
                href={PLATFORM_URLS[platform]}
                target="_blank"
                rel="noopener noreferrer"
            >
                <Icons.Download className="h-4 w-4" />
                {PLATFORM_LABELS[platform]}
            </a>
        </Button>
    );
}
