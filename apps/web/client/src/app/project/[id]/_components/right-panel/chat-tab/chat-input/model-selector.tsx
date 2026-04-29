'use client';

import { useEffect, useState } from 'react';

import type { ChatModel } from '@onlook/models';
import { CHAT_MODEL_OPTIONS } from '@onlook/models';
import { Button } from '@onlook/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@onlook/ui/dropdown-menu';
import { Icons } from '@onlook/ui/icons';
import { cn } from '@onlook/ui/utils';

export const ModelSelector = ({
    value,
    onChange,
}: {
    value: ChatModel;
    onChange: (model: ChatModel) => void;
}) => {
    const current =
        CHAT_MODEL_OPTIONS.find((option) => option.model === value) ?? CHAT_MODEL_OPTIONS[0];
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-model-selector', handleOpen);
        return () => window.removeEventListener('open-model-selector', handleOpen);
    }, []);

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-foreground-secondary hover:bg-background-secondary hover:text-foreground-primary h-8 gap-1.5 px-2 text-xs"
                >
                    <Icons.ChevronDown className="h-3.5 w-3.5 shrink-0" />
                    <span className="@[260px]:inline hidden max-w-[160px] truncate">{current?.label ?? 'Model'}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
                {CHAT_MODEL_OPTIONS.map((option) => (
                    <DropdownMenuItem
                        key={option.model}
                        onClick={() => onChange(option.model)}
                        className={cn(
                            'flex flex-col items-start gap-0.5 px-3 py-2',
                            option.model === value && 'bg-background-onlook',
                        )}
                    >
                        <span className="text-sm font-medium">{option.label}</span>
                        <span className="text-foreground-tertiary text-xs">{option.model}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
