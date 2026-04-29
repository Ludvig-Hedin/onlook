import { useState } from 'react';
import { CHAT_MODEL_OPTIONS, OPENROUTER_MODELS, type ChatMessage, type ChatModel } from '@onlook/models';
import { useChat } from '../../../../_hooks/use-chat';
import { ChatInput } from '../chat-input';
import { ChatMessages } from '../chat-messages';
import { ErrorSection } from '../error';

interface ChatTabContentProps {
    conversationId: string;
    projectId: string;
    initialMessages: ChatMessage[];
}

export const ChatTabContent = ({
    conversationId,
    projectId,
    initialMessages,
}: ChatTabContentProps) => {
    const [model, setModel] = useState<ChatModel>(OPENROUTER_MODELS.KIMI_K2_6);
    const { isStreaming, sendMessage, editMessage, messages, error, stop, queuedMessages, removeFromQueue } = useChat({
        conversationId,
        projectId,
        initialMessages,
        model,
    });

    return (
        <div className="flex flex-col h-full justify-end gap-2 pt-2">
            <ChatMessages
                messages={messages}
                isStreaming={isStreaming}
                error={error}
                onEditMessage={editMessage}
            />
            <ErrorSection isStreaming={isStreaming} onSendMessage={sendMessage} />
            <ChatInput
                messages={messages}
                isStreaming={isStreaming}
                onStop={stop}
                onSendMessage={sendMessage}
                queuedMessages={queuedMessages}
                removeFromQueue={removeFromQueue}
                model={model}
                onModelChange={setModel}
            />
        </div>
    );
};
