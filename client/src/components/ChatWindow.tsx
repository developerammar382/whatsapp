import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { UserAvatar } from './UserAvatar';
import type { Message } from '@shared/schema';
import { useChatStore } from '@/lib/store';

interface ChatWindowProps {
  conversationId: string;
  messages: Message[];
  conversationName: string;
  otherUserId?: string;
  otherUsername?: string;
  otherUserAvatar?: string;
  onSendMessage: (text: string) => void;
  onTyping: () => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
  getUserInfo: (userId: string) => { username: string; avatarUrl?: string } | null;
}

export function ChatWindow({
  conversationId,
  messages,
  conversationName,
  otherUserId,
  otherUsername,
  otherUserAvatar,
  onSendMessage,
  onTyping,
  onAddReaction,
  onRemoveReaction,
  getUserInfo,
}: ChatWindowProps) {
  const currentUser = useChatStore((state) => state.currentUser);
  const typingUsers = useChatStore((state) => state.typingUsers[conversationId] || []);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingUsers]);

  if (!currentUser) return null;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-background">
        {otherUserId && (
          <UserAvatar
            userId={otherUserId}
            username={otherUsername || 'Unknown'}
            avatarUrl={otherUserAvatar}
            size="md"
            showStatus={true}
          />
        )}
        <div>
          <h2 className="font-semibold text-foreground" data-testid="text-conversation-title">
            {conversationName}
          </h2>
          <p className="text-sm text-muted-foreground">
            {otherUserId && useChatStore.getState().onlineUsers.has(otherUserId) ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="py-4 space-y-1">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center" data-testid="empty-state">
              <p className="text-muted-foreground mb-2">No messages yet</p>
              <p className="text-sm text-muted-foreground">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isOwn = message.senderId === currentUser.id;
              const prevMessage = index > 0 ? messages[index - 1] : null;
              const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId;
              
              const senderInfo = !isOwn ? getUserInfo(message.senderId) : null;

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  senderName={senderInfo?.username || currentUser.displayName}
                  onAddReaction={onAddReaction}
                  onRemoveReaction={onRemoveReaction}
                />
              );
            })
          )}
        </div>
        {typingUsers.length > 0 && <TypingIndicator usernames={typingUsers} />}
      </ScrollArea>

      {/* Input */}
      <ChatInput onSendMessage={onSendMessage} onTyping={onTyping} />
    </div>
  );
}
