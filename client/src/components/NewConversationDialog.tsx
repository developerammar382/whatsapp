import { useState } from 'react';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserAvatar } from './UserAvatar';
import type { User } from '@shared/schema';

interface NewConversationDialogProps {
  open: boolean;
  onClose: () => void;
  users: User[];
  currentUserId: string;
  onCreateConversation: (otherUserId: string) => void;
}

export function NewConversationDialog({
  open,
  onClose,
  users,
  currentUserId,
  onCreateConversation,
}: NewConversationDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users
    .filter((user) => user.id !== currentUserId)
    .filter((user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="border-card-border" data-testid="dialog-new-conversation">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>Select a user to start chatting with</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-users"
          />
        </div>

        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8" data-testid="text-no-users">
                No users found
              </p>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover-elevate active-elevate-2 cursor-pointer"
                  onClick={() => {
                    onCreateConversation(user.id);
                    onClose();
                  }}
                  data-testid={`user-item-${user.id}`}
                >
                  <UserAvatar
                    userId={user.id}
                    username={user.username}
                    avatarUrl={user.avatarUrl}
                    size="md"
                    showStatus={true}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{user.displayName}</p>
                    <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
