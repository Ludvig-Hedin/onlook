'use client';

import { useEffect, useMemo, useState } from 'react';

import { Icons } from '@onlook/ui/icons';
import { cn } from '@onlook/ui/utils';

import { getDisplayUrl, getFaviconUrl } from './project-card-utils';

interface ProjectPreviewSurfaceProps {
    projectName: string;
    imageUrl: string | null;
    siteUrl: string | null;
    className?: string;
    compact?: boolean;
}

const FallbackPreview = ({ compact = false }: { compact?: boolean }) => {
    return (
        <div className="absolute inset-0 overflow-hidden rounded-[inherit] bg-[#151210]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.12),_transparent_40%),linear-gradient(145deg,_rgba(120,94,72,0.26),_rgba(17,15,14,0.96)_55%)]" />
            <div className="absolute inset-x-0 top-12 bottom-0 p-4">
                <div className="flex h-full flex-col gap-3 rounded-[20px] border border-white/8 bg-black/20 p-3">
                    <div className={cn('rounded-2xl bg-white/10', compact ? 'h-12' : 'h-20')} />
                    <div className="grid flex-1 grid-cols-[1.25fr_0.85fr] gap-3">
                        <div className="rounded-[18px] bg-white/8" />
                        <div className="flex flex-col gap-3">
                            <div className="h-16 rounded-[18px] bg-white/7" />
                            <div className="flex-1 rounded-[18px] bg-white/6" />
                        </div>
                    </div>
                    {!compact && (
                        <div className="grid grid-cols-3 gap-2">
                            <div className="h-8 rounded-full bg-white/8" />
                            <div className="h-8 rounded-full bg-white/7" />
                            <div className="h-8 rounded-full bg-white/6" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const ProjectPreviewSurface = ({
    projectName,
    imageUrl,
    siteUrl,
    className,
    compact = false,
}: ProjectPreviewSurfaceProps) => {
    const [imageFailed, setImageFailed] = useState(false);
    const [faviconFailed, setFaviconFailed] = useState(false);
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [iframeTimedOut, setIframeTimedOut] = useState(false);

    useEffect(() => {
        setImageFailed(false);
        setFaviconFailed(false);
        setIframeLoaded(false);
        setIframeTimedOut(false);
    }, [imageUrl, siteUrl]);

    useEffect(() => {
        if (!siteUrl || imageUrl) {
            return;
        }

        const timeout = window.setTimeout(() => {
            setIframeTimedOut(true);
        }, 3500);

        return () => window.clearTimeout(timeout);
    }, [imageUrl, siteUrl]);

    const displayUrl = useMemo(() => getDisplayUrl(siteUrl) ?? 'Preview unavailable', [siteUrl]);
    const faviconUrl = useMemo(() => getFaviconUrl(siteUrl), [siteUrl]);
    const shouldRenderImage = Boolean(imageUrl && !imageFailed);
    const shouldRenderIframe = Boolean(!shouldRenderImage && siteUrl);

    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-[24px] border border-white/8 bg-[#151210] shadow-[0_20px_60px_rgba(0,0,0,0.32)]',
                className,
            )}
        >
            <FallbackPreview compact={compact} />

            {shouldRenderImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={imageUrl ?? undefined}
                    alt={projectName}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    onError={() => setImageFailed(true)}
                />
            )}

            {shouldRenderIframe && (
                <div className="absolute inset-x-0 top-11 bottom-0 overflow-hidden">
                    <iframe
                        src={siteUrl ?? undefined}
                        title={`${projectName} live preview`}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="pointer-events-none absolute top-0 left-0 h-[128%] w-[128%] origin-top-left scale-[0.78] border-0 bg-white"
                        onLoad={() => setIframeLoaded(true)}
                    />
                </div>
            )}

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18),rgba(0,0,0,0.02)_35%,rgba(0,0,0,0.38))]" />

            <div className="absolute inset-x-0 top-0 flex h-11 items-center gap-2 border-b border-white/8 bg-black/42 px-3 backdrop-blur-xl">
                <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-white/28" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/16" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/12" />
                </div>
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-white/8 bg-white/7 px-2.5 py-1.5 text-[11px] text-white/72">
                    {faviconUrl && !faviconFailed ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={faviconUrl}
                            alt=""
                            className="h-3.5 w-3.5 rounded-[3px] object-cover"
                            loading="lazy"
                            onError={() => setFaviconFailed(true)}
                        />
                    ) : (
                        <Icons.Globe className="h-3.5 w-3.5 shrink-0 text-white/55" />
                    )}
                    <span className="truncate">{displayUrl}</span>
                </div>
            </div>

            {shouldRenderIframe && !iframeLoaded && iframeTimedOut && (
                <div className="absolute inset-x-4 bottom-4 rounded-full border border-white/10 bg-black/58 px-3 py-2 text-center text-[11px] text-white/65 backdrop-blur-md">
                    Live preview unavailable, showing fallback layout
                </div>
            )}
        </div>
    );
};
