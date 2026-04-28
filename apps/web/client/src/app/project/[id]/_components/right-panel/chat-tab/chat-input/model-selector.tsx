'use client';

import { CHAT_MODEL_OPTIONS, type ChatModel } from '@onlook/models';
import { Button } from '@onlook/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@onlook/ui/dropdown-menu';
import { Icons } from '@onlook/ui/icons';
import { cn } from '@onlook/ui/utils';

export const ModelSelector = ({
    value,
    onChange,
}: {
    value: ChatModel;
    onChange: (model: ChatModel) => void;
}) => {
    const current = CHAT_MODEL_OPTIONS.find((option) => option.model === value) ?? CHAT_MODEL_OPTIONS[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 px-2 text-xs text-foreground-secondary hover:bg-background-secondary hover:text-foreground-primary"
                >
                    <Icons.ChevronDown className="h-3.5 w-3.5" />
                    <span className="max-w-[160px] truncate">{current?.label ?? 'Model'}</span>
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
                        <span className="text-xs text-foreground-tertiary">{option.model}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
