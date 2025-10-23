import { useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/components/ThemeProvider';
import { useToast } from '@/hooks/use-toast';
import AuthPage from '@/pages/auth';
import ChatPage from '@/pages/chat';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useChatStore } from '@/lib/store';

import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signInWithGithub,
  signOutUser,
  listenToUserPresence,
  listenToConversations,
  listenToMessages,
  listenToTypingIndicators,
  sendMessage,
  addReaction,
  removeReaction,
  updateTypingStatus,
  createConversation,
  updateUserProfile,
  uploadUserAvatar,
  getAllUsers,
  getUserById,
  markMessageAsRead,
  handleAuthRedirect,
} from '@/services/firebase-service';

function AppContent() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const currentUser = useChatStore((state) => state.currentUser);
  const setCurrentUser = useChatStore((state) => state.setCurrentUser);
  const setConversations = useChatStore((state) => state.setConversations);
  const setMessages = useChatStore((state) => state.setMessages);
  const setTypingUsers = useChatStore((state) => state.setTypingUsers);
  const setOnlineUsers = useChatStore((state) => state.setOnlineUsers);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const conversations = useChatStore((state) => state.conversations);
  const activeConversationId = useChatStore((state) => state.activeConversationId);

  // Handle OAuth redirects on app startup
  useEffect(() => {
    handleAuthRedirect();
  }, []);

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          let userData = await getUserById(firebaseUser.uid);
          
          // If user document doesn't exist (OAuth first-time sign-in), create it
          if (!userData) {
            const newUserData = {
              email: firebaseUser.email!,
              username: firebaseUser.email!.split('@')[0],
              displayName: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
              avatarUrl: firebaseUser.photoURL || undefined,
              status: 'online' as const,
              lastSeen: Date.now(),
              createdAt: Date.now(),
            };
            
            await setDoc(doc(db, 'users', firebaseUser.uid), newUserData);
            userData = { id: firebaseUser.uid, ...newUserData };
          }
          
          setCurrentUser(userData);
          setAuthenticated(true);
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast({
            title: 'Error',
            description: 'Failed to load user data',
            variant: 'destructive',
          });
        }
      } else {
        setCurrentUser(null);
        setAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setCurrentUser, toast]);

  // Set up real-time listeners when authenticated
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribers: (() => void)[] = [];

    // Listen to presence updates
    const presenceUnsub = listenToUserPresence((onlineUserIds) => {
      setOnlineUsers(onlineUserIds);
    });
    unsubscribers.push(presenceUnsub);

    // Listen to conversations
    const conversationsUnsub = listenToConversations(currentUser.id, (conversations) => {
      setConversations(conversations);
    });
    unsubscribers.push(conversationsUnsub);

    // Load all users for new conversation dialog
    getAllUsers()
      .then(setAllUsers)
      .catch((error) => {
        console.error('Error loading users:', error);
      });

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [currentUser, setConversations, setOnlineUsers]);

  // Listen to messages for active conversations
  useEffect(() => {
    if (!currentUser || conversations.length === 0) return;

    const unsubscribers: (() => void)[] = [];

    conversations.forEach((conversation) => {
      // Messages listener
      const messagesUnsub = listenToMessages(conversation.id, (messages) => {
        setMessages(conversation.id, messages);
        
        // Auto-mark messages as read when viewing the conversation
        if (conversation.id === activeConversationId) {
          messages.forEach((msg) => {
            if (!msg.readBy.includes(currentUser.id) && msg.senderId !== currentUser.id) {
              markMessageAsRead(conversation.id, msg.id, currentUser.id).catch(console.error);
            }
          });
        }
      });
      unsubscribers.push(messagesUnsub);

      // Typing indicators listener
      const typingUnsub = listenToTypingIndicators(conversation.id, currentUser.id, (usernames) => {
        setTypingUsers(conversation.id, usernames);
      });
      unsubscribers.push(typingUnsub);
    });

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [currentUser, conversations, activeConversationId, setMessages, setTypingUsers]);

  const handleEmailSignIn = async (email: string, password: string) => {
    try {
      await signInWithEmail(email, password);
      toast({
        title: 'Welcome back!',
        description: 'Successfully signed in to your account',
      });
    } catch (error: any) {
      throw new Error(error.message || 'Invalid email or password');
    }
  };

  const handleEmailSignUp = async (
    email: string,
    password: string,
    username: string,
    displayName: string
  ) => {
    try {
      await signUpWithEmail(email, password, username, displayName);
      toast({
        title: 'Account created!',
        description: 'Welcome to ChatApp',
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create account');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign in with Google',
        variant: 'destructive',
      });
    }
  };

  const handleGithubSignIn = async () => {
    try {
      await signInWithGithub();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign in with GitHub',
        variant: 'destructive',
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign out',
        variant: 'destructive',
      });
    }
  };

  const handleSendMessage = async (conversationId: string, text: string) => {
    if (!currentUser) return;
    try {
      await sendMessage(conversationId, currentUser.id, text);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const handleTyping = async (conversationId: string) => {
    if (!currentUser) return;
    try {
      await updateTypingStatus(conversationId, currentUser.id, currentUser.username);
    } catch (error) {
      // Silently fail for typing indicators
    }
  };

  const handleAddReaction = async (conversationId: string, messageId: string, emoji: string) => {
    if (!currentUser) return;
    try {
      await addReaction(conversationId, messageId, emoji, currentUser.id);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to add reaction',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveReaction = async (conversationId: string, messageId: string, emoji: string) => {
    if (!currentUser) return;
    try {
      await removeReaction(conversationId, messageId, emoji, currentUser.id);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to remove reaction',
        variant: 'destructive',
      });
    }
  };

  const handleCreateConversation = async (otherUserId: string) => {
    if (!currentUser) return;
    try {
      const conversationId = await createConversation([currentUser.id, otherUserId]);
      useChatStore.getState().setActiveConversationId(conversationId);
      toast({
        title: 'Conversation created',
        description: 'You can now start chatting!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to create conversation',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateProfile = async (data: { displayName?: string; username?: string }) => {
    if (!currentUser) return;
    try {
      await updateUserProfile(currentUser.id, data);
      setCurrentUser({ ...currentUser, ...data });
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleUploadAvatar = async (file: File) => {
    if (!currentUser) return;
    try {
      const avatarUrl = await uploadUserAvatar(currentUser.id, file);
      setCurrentUser({ ...currentUser, avatarUrl });
      toast({
        title: 'Avatar uploaded',
        description: 'Your avatar has been updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to upload avatar',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const getUserInfo = (userId: string) => {
    const user = allUsers.find((u) => u.id === userId);
    return user ? { username: user.username, avatarUrl: user.avatarUrl } : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      {authenticated && currentUser ? (
        <ChatPage
          users={allUsers}
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          onAddReaction={handleAddReaction}
          onRemoveReaction={handleRemoveReaction}
          onCreateConversation={handleCreateConversation}
          onUpdateProfile={handleUpdateProfile}
          onUploadAvatar={handleUploadAvatar}
          onSignOut={handleSignOut}
          getUserInfo={getUserInfo}
        />
      ) : (
        <AuthPage
          onEmailSignIn={handleEmailSignIn}
          onEmailSignUp={handleEmailSignUp}
          onGoogleSignIn={handleGoogleSignIn}
          onGithubSignIn={handleGithubSignIn}
        />
      )}
      <Toaster />
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
