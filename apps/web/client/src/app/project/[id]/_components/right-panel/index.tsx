'use client';

import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslations } from 'next-intl';

import { Button } from '@onlook/ui/button';
import { Icons } from '@onlook/ui/icons/index';
import { ResizablePanel } from '@onlook/ui/resizable';
import { cn } from '@onlook/ui/utils';

import { useEditorEngine } from '@/components/store/editor';
import { transKeys } from '@/i18n/keys';
import { ChatTab } from './chat-tab';
import { ChatControls } from './chat-tab/controls';
import { ChatHistory } from './chat-tab/history';
import { ChatPanelDropdown } from './chat-tab/panel-dropdown';

export const RightPanel = observer(() => {
    const editorEngine = useEditorEngine();
    const t = useTranslations();
    const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [panelWidth, setPanelWidth] = useState(352);
    const currentConversation = editorEngine.chat.conversation.current;

    return (
        <div
            className={cn(
                'flex h-full items-start justify-end transition-[width,opacity] duration-200',
                !isCollapsed &&
                    'bg-background/95 group/panel w-full rounded-tl-xl border-[0.5px] shadow backdrop-blur-xl',
            )}
        >
            {isCollapsed ? (
                <div className="mt-3 flex">
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Open AI chat panel"
                        className="border-border bg-background/95 text-foreground-secondary hover:bg-background-secondary hover:text-foreground-primary h-10 w-10 rounded-l-xl rounded-r-none border border-r-0 shadow"
                        onClick={() => setIsCollapsed(false)}
                    >
                        <Icons.ChevronRight className="h-4 w-4 rotate-180" />
                    </Button>
                </div>
            ) : (
                <ResizablePanel
                    side="right"
                    defaultWidth={panelWidth}
                    minWidth={280}
                    maxWidth={560}
                    onWidthChange={setPanelWidth}
                    className="overflow-hidden"
                >
                    <div className="flex h-full flex-col">
                        <div className="border-border flex h-10 w-full flex-row border-b p-1">
                            <ChatPanelDropdown
                                isChatHistoryOpen={isChatHistoryOpen}
                                setIsChatHistoryOpen={setIsChatHistoryOpen}
                            >
                                <div className="group text-foreground-secondary hover:text-foreground-primary flex cursor-pointer items-center gap-1.5 bg-transparent p-1 px-2 text-sm">
                                    <Icons.Sparkles className="mr-0.5 mb-0.5 h-4 w-4" />
                                    {t(transKeys.editor.panels.edit.tabs.chat.name)}
                                    <Icons.ChevronDown className="text-muted-foreground group-hover:text-foreground-primary ml-0.5 h-3 w-3" />
                                </div>
                            </ChatPanelDropdown>
                            <div className="ml-auto flex items-center gap-1">
                                <ChatControls />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Close AI chat panel"
                                    className="text-foreground-secondary hover:bg-background-secondary hover:text-foreground-primary h-8 w-8"
                                    onClick={() => setIsCollapsed(true)}
                                >
                                    <Icons.ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <ChatHistory
                            isOpen={isChatHistoryOpen}
                            onOpenChange={setIsChatHistoryOpen}
                        />

                        <div className="flex-1 overflow-y-auto">
                            {currentConversation && (
                                <ChatTab
                                    conversationId={currentConversation.id}
                                    projectId={editorEngine.projectId}
                                />
                            )}
                        </div>
                    </div>
                </ResizablePanel>
            )}
        </div>
    );
});
