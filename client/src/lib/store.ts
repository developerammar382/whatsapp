import { create } from 'zustand';
import type { User, Conversation, Message } from '@shared/schema';

interface ChatStore {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  
  conversations: Conversation[];
  setConversations: (conversations: Conversation[]) => void;
  
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  
  messages: Record<string, Message[]>;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  
  typingUsers: Record<string, string[]>; // conversationId -> usernames[]
  setTypingUsers: (conversationId: string, usernames: string[]) => void;
  
  onlineUsers: Set<string>;
  setOnlineUsers: (userIds: string[]) => void;
  
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  
  showMobileSidebar: boolean;
  setShowMobileSidebar: (show: boolean) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  
  conversations: [],
  setConversations: (conversations) => set({ conversations }),
  
  activeConversationId: null,
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  
  messages: {},
  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [conversationId]: messages },
    })),
  addMessage: (conversationId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), message],
      },
    })),
  
  typingUsers: {},
  setTypingUsers: (conversationId, usernames) =>
    set((state) => ({
      typingUsers: { ...state.typingUsers, [conversationId]: usernames },
    })),
  
  onlineUsers: new Set(),
  setOnlineUsers: (userIds) => set({ onlineUsers: new Set(userIds) }),
  
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'dark',
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return { theme: newTheme };
    }),
  
  showSettings: false,
  setShowSettings: (show) => set({ showSettings: show }),
  
  showMobileSidebar: false,
  setShowMobileSidebar: (show) => set({ showMobileSidebar: show }),
}));
