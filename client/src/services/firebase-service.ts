// Firebase service layer for authentication, real-time messaging, and storage
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  Timestamp,
  writeBatch,
  limit,
  type Unsubscribe,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User, Conversation, Message } from '@shared/schema';

// Helper to convert Firestore timestamp to number
const timestampToNumber = (timestamp: any): number => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toMillis();
  }
  return timestamp || Date.now();
};

// Helper to compress and convert image to base64
const compressImageToBase64 = async (file: File, maxSizeKB: number = 50): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Resize image to max 200x200 while maintaining aspect ratio (smaller for better performance)
        const maxDimension = 200;
        if (width > height) {
          if (width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Try different quality levels to get under maxSizeKB
        let quality = 0.7;
        let base64 = canvas.toDataURL('image/jpeg', quality);
        
        // Reduce quality until size is acceptable
        while (base64.length > maxSizeKB * 1024 * 1.37 && quality > 0.1) {
          quality -= 0.1;
          base64 = canvas.toDataURL('image/jpeg', quality);
        }
        
        // Final size check - reject if still too large
        const finalSizeKB = base64.length / 1024 / 1.37;
        if (finalSizeKB > maxSizeKB) {
          reject(new Error(`Image too large (${finalSizeKB.toFixed(1)}KB). Please use a smaller image.`));
          return;
        }
        
        resolve(base64);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

// Authentication functions
export const signInWithEmail = async (email: string, password: string): Promise<void> => {
  await signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  username: string,
  displayName: string
): Promise<void> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Create user document in Firestore
  const userData: Omit<User, 'id'> = {
    email: user.email!,
    username,
    displayName,
    status: 'online',
    lastSeen: Date.now(),
    createdAt: Date.now(),
  };

  await setDoc(doc(db, 'users', user.uid), userData);
  
  // Set up presence
  await updateUserPresence(user.uid, 'online');
};

export const signInWithGoogle = async (): Promise<void> => {
  const provider = new GoogleAuthProvider();
  await signInWithRedirect(auth, provider);
};

export const signInWithGithub = async (): Promise<void> => {
  const provider = new GithubAuthProvider();
  await signInWithRedirect(auth, provider);
};

// Handle OAuth redirect result
export const handleAuthRedirect = async (): Promise<void> => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      const user = result.user;
      
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Create user document for OAuth users
        const userData: Omit<User, 'id'> = {
          email: user.email!,
          username: user.email!.split('@')[0],
          displayName: user.displayName || user.email!.split('@')[0],
          avatarUrl: user.photoURL || undefined,
          status: 'online',
          lastSeen: Date.now(),
          createdAt: Date.now(),
        };
        
        await setDoc(doc(db, 'users', user.uid), userData);
      }
      
      // Set up presence
      await updateUserPresence(user.uid, 'online');
    }
  } catch (error) {
    console.error('Auth redirect error:', error);
  }
};

export const signOutUser = async (): Promise<void> => {
  if (auth.currentUser) {
    await updateUserPresence(auth.currentUser.uid, 'offline');
  }
  await signOut(auth);
};

// User functions
export const getUserById = async (userId: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (userDoc.exists()) {
    return { id: userDoc.id, ...userDoc.data() } as User;
  }
  return null;
};

export const getAllUsers = async (): Promise<User[]> => {
  const usersSnapshot = await getDocs(collection(db, 'users'));
  return usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as User));
};

export const updateUserProfile = async (
  userId: string,
  data: { displayName?: string; username?: string }
): Promise<void> => {
  await updateDoc(doc(db, 'users', userId), data);
};

export const uploadUserAvatar = async (userId: string, file: File): Promise<string> => {
  // Compress and convert image to base64 (max 50KB to keep Firestore document small and performant)
  const base64Avatar = await compressImageToBase64(file, 50);
  
  // Update user document with base64 avatar
  await updateDoc(doc(db, 'users', userId), { avatarUrl: base64Avatar });
  
  return base64Avatar;
};

// Presence functions
const updateUserPresence = async (userId: string, status: 'online' | 'offline' | 'away'): Promise<void> => {
  await updateDoc(doc(db, 'users', userId), {
    status,
    lastSeen: Date.now(),
  });
};

export const listenToUserPresence = (callback: (onlineUserIds: string[]) => void): Unsubscribe => {
  const q = query(collection(db, 'users'), where('status', '==', 'online'));
  
  return onSnapshot(q, (snapshot) => {
    const onlineUserIds = snapshot.docs.map((doc) => doc.id);
    callback(onlineUserIds);
  });
};

// Conversation functions
export const listenToConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'conversations'),
    where('participantIds', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: timestampToNumber(data.createdAt),
        updatedAt: timestampToNumber(data.updatedAt),
        lastMessageTimestamp: timestampToNumber(data.lastMessageTimestamp),
      } as Conversation;
    });
    callback(conversations);
  });
};

export const createConversation = async (participantIds: string[]): Promise<string> => {
  // Check if conversation already exists between these users
  const q = query(
    collection(db, 'conversations'),
    where('participantIds', '==', participantIds.sort())
  );
  
  const existingConversations = await getDocs(q);
  if (!existingConversations.empty) {
    return existingConversations.docs[0].id;
  }
  
  // Create new conversation
  const conversationRef = doc(collection(db, 'conversations'));
  const conversationData = {
    type: 'direct' as const,
    participantIds: participantIds.sort(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  await setDoc(conversationRef, conversationData);
  return conversationRef.id;
};

// Message functions
export const listenToMessages = (
  conversationId: string,
  callback: (messages: Message[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, `conversations/${conversationId}/messages`),
    orderBy('timestamp', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: timestampToNumber(data.timestamp),
        readBy: data.readBy || [],
        reactions: data.reactions || {},
      } as Message;
    });
    callback(messages);
  });
};

export const sendMessage = async (
  conversationId: string,
  senderId: string,
  text: string
): Promise<void> => {
  const batch = writeBatch(db);
  
  // Add message
  const messageRef = doc(collection(db, `conversations/${conversationId}/messages`));
  batch.set(messageRef, {
    conversationId,
    senderId,
    text,
    timestamp: serverTimestamp(),
    readBy: [senderId],
    reactions: {},
  });
  
  // Update conversation
  const conversationRef = doc(db, 'conversations', conversationId);
  batch.update(conversationRef, {
    lastMessageId: messageRef.id,
    lastMessageText: text,
    lastMessageTimestamp: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  await batch.commit();
};

export const markMessageAsRead = async (
  conversationId: string,
  messageId: string,
  userId: string
): Promise<void> => {
  const messageRef = doc(db, `conversations/${conversationId}/messages`, messageId);
  await updateDoc(messageRef, {
    readBy: arrayUnion(userId),
  });
};

export const addReaction = async (
  conversationId: string,
  messageId: string,
  emoji: string,
  userId: string
): Promise<void> => {
  const messageRef = doc(db, `conversations/${conversationId}/messages`, messageId);
  const messageDoc = await getDoc(messageRef);
  
  if (messageDoc.exists()) {
    const data = messageDoc.data();
    const reactions = data.reactions || {};
    const currentUsers = reactions[emoji] || [];
    
    if (!currentUsers.includes(userId)) {
      reactions[emoji] = [...currentUsers, userId];
      await updateDoc(messageRef, { reactions });
    }
  }
};

export const removeReaction = async (
  conversationId: string,
  messageId: string,
  emoji: string,
  userId: string
): Promise<void> => {
  const messageRef = doc(db, `conversations/${conversationId}/messages`, messageId);
  const messageDoc = await getDoc(messageRef);
  
  if (messageDoc.exists()) {
    const data = messageDoc.data();
    const reactions = data.reactions || {};
    const currentUsers = reactions[emoji] || [];
    
    reactions[emoji] = currentUsers.filter((id: string) => id !== userId);
    
    if (reactions[emoji].length === 0) {
      delete reactions[emoji];
    }
    
    await updateDoc(messageRef, { reactions });
  }
};

// Typing indicator functions
export const listenToTypingIndicators = (
  conversationId: string,
  currentUserId: string,
  callback: (usernames: string[]) => void
): Unsubscribe => {
  const q = query(collection(db, `conversations/${conversationId}/typing`));
  
  return onSnapshot(q, (snapshot) => {
    const now = Date.now();
    const typingUsers = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          userId: doc.id,
          username: data.username,
          timestamp: timestampToNumber(data.timestamp),
        };
      })
      .filter((user) => {
        // Only show typing indicators from last 3 seconds and not from current user
        return user.userId !== currentUserId && now - user.timestamp < 3000;
      })
      .map((user) => user.username);
    
    callback(typingUsers);
  });
};

export const updateTypingStatus = async (
  conversationId: string,
  userId: string,
  username: string
): Promise<void> => {
  const typingRef = doc(db, `conversations/${conversationId}/typing`, userId);
  await setDoc(typingRef, {
    username,
    timestamp: serverTimestamp(),
  });
  
  // Auto-clear typing status after 3 seconds
  setTimeout(async () => {
    try {
      const typingDoc = await getDoc(typingRef);
      if (typingDoc.exists()) {
        const data = typingDoc.data();
        const timestamp = timestampToNumber(data.timestamp);
        if (Date.now() - timestamp >= 3000) {
          await updateDoc(typingRef, { timestamp: 0 });
        }
      }
    } catch (error) {
      // Ignore errors
    }
  }, 3000);
};

// Export auth redirect handler to be called on app startup
// Note: This is called in App.tsx before auth state listener
