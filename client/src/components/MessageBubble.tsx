import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import type { Message } from '@shared/schema';
import { MessageReactions } from './MessageReactions';
import { useChatStore } from '@/lib/store';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  senderName?: string;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
}

export function MessageBubble({
  message,
  isOwn,
  showAvatar = true,
  senderName = 'Unknown',
  onAddReaction,
  onRemoveReaction,
}: MessageBubbleProps) {
  const currentUser = useChatStore((state) => state.currentUser);
  const isRead = message.readBy.length > 1; // More than just the sender

  return (
    <div
      className={`flex gap-3 px-4 py-2 group ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
      data-testid={`message-${message.id}`}
    >
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-md`}>
        {!isOwn && showAvatar && (
          <span className="text-xs font-medium text-foreground mb-1" data-testid="text-sender-name">
            {senderName}
          </span>
        )}
        
        <div
          className={`rounded-2xl px-4 py-2 ${
            isOwn
              ? 'bg-primary text-primary-foreground'
              : 'bg-card text-card-foreground border border-card-border'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words" data-testid="text-message-content">
            {message.text}
          </p>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground" data-testid="text-timestamp">
            {format(message.timestamp, 'HH:mm')}
          </span>
          
          {isOwn && (
            <span className="text-ring" data-testid="icon-read-status">
              {isRead ? <CheckCheck className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
            </span>
          )}
        </div>

        {currentUser && (
          <MessageReactions
            reactions={message.reactions}
            currentUserId={currentUser.id}
            onAddReaction={(emoji) => onAddReaction(message.id, emoji)}
            onRemoveReaction={(emoji) => onRemoveReaction(message.id, emoji)}
          />
        )}
      </div>
    </div>
  );
}
