import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useChatStore } from '@/lib/store';

interface UserAvatarProps {
  userId: string;
  username: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
}

export function UserAvatar({ userId, username, avatarUrl, size = 'md', showStatus = false }: UserAvatarProps) {
  const onlineUsers = useChatStore((state) => state.onlineUsers);
  const isOnline = onlineUsers.has(userId);
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-24 h-24',
  };

  const initials = username
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative inline-block">
      <Avatar className={sizeClasses[size]} data-testid={`avatar-${username}`}>
        <AvatarImage src={avatarUrl} alt={username} />
        <AvatarFallback className="bg-gradient-to-br from-primary to-ring text-primary-foreground font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>
      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
            isOnline ? 'bg-ring' : 'bg-muted-foreground'
          } ${isOnline ? 'animate-pulse' : ''}`}
          data-testid={`status-${isOnline ? 'online' : 'offline'}`}
        />
      )}
    </div>
  );
}
