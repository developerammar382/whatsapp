import { useState } from 'react';
import { Search, UserPlus, Settings, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ConversationItem } from './ConversationItem';
import { UserAvatar } from './UserAvatar';
import { useChatStore } from '@/lib/store';
import type { Conversation } from '@shared/schema';

interface ChatSidebarProps {
  conversations: Conversation[];
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  onOpenSettings: () => void;
  getUserInfo: (userId: string) => { username: string; avatarUrl?: string } | null;
}

export function ChatSidebar({
  conversations,
  onSelectConversation,
  onNewConversation,
  onOpenSettings,
  getUserInfo,
}: ChatSidebarProps) {
  const currentUser = useChatStore((state) => state.currentUser);
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const showMobileSidebar = useChatStore((state) => state.showMobileSidebar);
  const setShowMobileSidebar = useChatStore((state) => state.setShowMobileSidebar);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    
    if (conv.type === 'group') {
      return conv.name?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    const otherUserId = conv.participantIds.find((id) => id !== currentUser?.id);
    if (!otherUserId) return false;
    
    const userInfo = getUserInfo(otherUserId);
    return userInfo?.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentUser && (
              <>
                <UserAvatar
                  userId={currentUser.id}
                  username={currentUser.username}
                  avatarUrl={currentUser.avatarUrl}
                  size="md"
                  showStatus={true}
                />
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-foreground truncate" data-testid="text-current-user">
                    {currentUser.displayName}
                  </h2>
                  <p className="text-sm text-muted-foreground truncate">@{currentUser.username}</p>
                </div>
              </>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={onOpenSettings}
              data-testid="button-open-settings"
              className="hover-elevate active-elevate-2"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowMobileSidebar(false)}
              className="lg:hidden hover-elevate active-elevate-2"
              data-testid="button-close-sidebar"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-conversations"
          />
        </div>

        <Button
          onClick={onNewConversation}
          className="w-full"
          data-testid="button-new-conversation"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          New Conversation
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="text-no-conversations">
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Start a new conversation to get chatting!</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const otherUserId = conversation.participantIds.find((id) => id !== currentUser?.id);
              const userInfo = otherUserId ? getUserInfo(otherUserId) : null;

              return (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={conversation.id === activeConversationId}
                  onClick={() => {
                    onSelectConversation(conversation.id);
                    setShowMobileSidebar(false);
                  }}
                  otherUserName={userInfo?.username || 'Unknown'}
                  otherUserId={otherUserId}
                  otherUserAvatar={userInfo?.avatarUrl}
                />
              );
            })
          )}
        </div>
      </ScrollArea>
    </>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setShowMobileSidebar(true)}
        className="lg:hidden fixed top-4 left-4 z-40 hover-elevate active-elevate-2"
        data-testid="button-open-sidebar"
      >
        <Menu className="w-6 h-6" />
      </Button>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-80 flex-col bg-sidebar border-r border-sidebar-border">
        {sidebarContent}
      </div>

      {/* Mobile sidebar */}
      {showMobileSidebar && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="flex flex-col w-80 bg-sidebar border-r border-sidebar-border">
            {sidebarContent}
          </div>
          <div
            className="flex-1 bg-background/50 backdrop-blur-sm"
            onClick={() => setShowMobileSidebar(false)}
          />
        </div>
      )}
    </>
  );
}
