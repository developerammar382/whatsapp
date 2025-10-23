import { useEffect, useState } from 'react';
import { ChatSidebar } from '@/components/ChatSidebar';
import { ChatWindow } from '@/components/ChatWindow';
import { ProfileSettings } from '@/components/ProfileSettings';
import { NewConversationDialog } from '@/components/NewConversationDialog';
import { useChatStore } from '@/lib/store';
import type { User } from '@shared/schema';

interface ChatPageProps {
  users: User[];
  onSendMessage: (conversationId: string, text: string) => void;
  onTyping: (conversationId: string) => void;
  onAddReaction: (conversationId: string, messageId: string, emoji: string) => void;
  onRemoveReaction: (conversationId: string, messageId: string, emoji: string) => void;
  onCreateConversation: (otherUserId: string) => void;
  onUpdateProfile: (data: { displayName?: string; username?: string }) => Promise<void>;
  onUploadAvatar: (file: File) => Promise<void>;
  onSignOut: () => void;
  getUserInfo: (userId: string) => { username: string; avatarUrl?: string } | null;
}

export default function ChatPage({
  users,
  onSendMessage,
  onTyping,
  onAddReaction,
  onRemoveReaction,
  onCreateConversation,
  onUpdateProfile,
  onUploadAvatar,
  onSignOut,
  getUserInfo,
}: ChatPageProps) {
  const currentUser = useChatStore((state) => state.currentUser);
  const conversations = useChatStore((state) => state.conversations);
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const setActiveConversationId = useChatStore((state) => state.setActiveConversationId);
  const messages = useChatStore((state) => state.messages);
  const showSettings = useChatStore((state) => state.showSettings);
  const setShowSettings = useChatStore((state) => state.setShowSettings);
  const [showNewConversation, setShowNewConversation] = useState(false);

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId, setActiveConversationId]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const activeMessages = activeConversationId ? messages[activeConversationId] || [] : [];

  const otherUserId = activeConversation?.participantIds.find((id) => id !== currentUser?.id) || undefined;
  const otherUserInfo = otherUserId ? getUserInfo(otherUserId) : null;

  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar
        conversations={conversations}
        onSelectConversation={setActiveConversationId}
        onNewConversation={() => setShowNewConversation(true)}
        onOpenSettings={() => setShowSettings(true)}
        getUserInfo={getUserInfo}
      />

      <div className="flex-1 lg:ml-0">
        {activeConversation && activeConversationId ? (
          <ChatWindow
            conversationId={activeConversationId}
            messages={activeMessages}
            conversationName={
              activeConversation.type === 'group'
                ? activeConversation.name || 'Group Chat'
                : otherUserInfo?.username || 'Unknown'
            }
            otherUserId={otherUserId}
            otherUsername={otherUserInfo?.username}
            otherUserAvatar={otherUserInfo?.avatarUrl}
            onSendMessage={(text) => onSendMessage(activeConversationId, text)}
            onTyping={() => onTyping(activeConversationId)}
            onAddReaction={(messageId, emoji) => onAddReaction(activeConversationId, messageId, emoji)}
            onRemoveReaction={(messageId, emoji) => onRemoveReaction(activeConversationId, messageId, emoji)}
            getUserInfo={getUserInfo}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-background text-center p-8">
            <div className="max-w-md space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Welcome to ChatApp</h2>
              <p className="text-muted-foreground">
                Select a conversation from the sidebar or start a new one to begin chatting
              </p>
            </div>
          </div>
        )}
      </div>

      {showSettings && (
        <ProfileSettings
          onClose={() => setShowSettings(false)}
          onUpdateProfile={onUpdateProfile}
          onUploadAvatar={onUploadAvatar}
          onSignOut={onSignOut}
        />
      )}

      <NewConversationDialog
        open={showNewConversation}
        onClose={() => setShowNewConversation(false)}
        users={users}
        currentUserId={currentUser?.id || ''}
        onCreateConversation={onCreateConversation}
      />
    </div>
  );
}
