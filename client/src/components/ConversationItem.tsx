import { format } from 'date-fns';
import type { Conversation } from '@shared/schema';
import { UserAvatar } from './UserAvatar';
import { Badge } from '@/components/ui/badge';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  otherUserName?: string;
  otherUserId?: string;
  otherUserAvatar?: string;
  unreadCount?: number;
}

export function ConversationItem({
  conversation,
  isActive,
  onClick,
  otherUserName = 'Unknown',
  otherUserId = '',
  otherUserAvatar,
  unreadCount = 0,
}: ConversationItemProps) {
  const displayName = conversation.type === 'group' ? conversation.name : otherUserName;

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover-elevate active-elevate-2 ${
        isActive ? 'bg-sidebar-accent' : ''
      }`}
      onClick={onClick}
      data-testid={`conversation-${conversation.id}`}
    >
      <UserAvatar
        userId={otherUserId}
        username={otherUserName}
        avatarUrl={otherUserAvatar}
        size="md"
        showStatus={conversation.type === 'direct'}
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-sm text-foreground truncate" data-testid="text-conversation-name">
            {displayName}
          </h3>
          {conversation.lastMessageTimestamp && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {format(conversation.lastMessageTimestamp, 'HH:mm')}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground truncate" data-testid="text-last-message">
            {conversation.lastMessageText || 'No messages yet'}
          </p>
          {unreadCount > 0 && (
            <Badge className="bg-ring text-primary-foreground rounded-full min-w-[20px] h-5 flex items-center justify-center text-xs" data-testid="badge-unread-count">
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
