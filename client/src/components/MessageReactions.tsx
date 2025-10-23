import { Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Badge } from '@/components/ui/badge';

interface MessageReactionsProps {
  reactions: Record<string, string[]>;
  currentUserId: string;
  onAddReaction: (emoji: string) => void;
  onRemoveReaction: (emoji: string) => void;
}

export function MessageReactions({
  reactions,
  currentUserId,
  onAddReaction,
  onRemoveReaction,
}: MessageReactionsProps) {
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji;
    const userIds = reactions[emoji] || [];
    
    if (userIds.includes(currentUserId)) {
      onRemoveReaction(emoji);
    } else {
      onAddReaction(emoji);
    }
  };

  const hasReactions = Object.keys(reactions).length > 0;

  return (
    <div className="flex flex-wrap items-center gap-1 mt-1">
      {Object.entries(reactions).map(([emoji, userIds]) => {
        const hasReacted = userIds.includes(currentUserId);
        return (
          <Badge
            key={emoji}
            variant={hasReacted ? 'default' : 'outline'}
            className="cursor-pointer px-2 py-0.5 text-xs hover-elevate active-elevate-2"
            onClick={() => hasReacted ? onRemoveReaction(emoji) : onAddReaction(emoji)}
            data-testid={`reaction-${emoji}`}
          >
            {emoji} {userIds.length}
          </Badge>
        );
      })}
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="w-6 h-6 hover-elevate active-elevate-2"
            data-testid="button-add-reaction"
          >
            <Smile className="w-3.5 h-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-popover-border" side="top">
          <EmojiPicker onEmojiClick={handleEmojiClick} width={320} height={400} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
