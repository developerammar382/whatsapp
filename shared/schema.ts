import { z } from "zod";

// User schema for authentication and profile
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string().min(2).max(50),
  displayName: z.string().min(1).max(100),
  avatarUrl: z.string().optional(),
  status: z.enum(['online', 'offline', 'away']).default('offline'),
  lastSeen: z.number(),
  createdAt: z.number(),
});

export type User = z.infer<typeof userSchema>;

// Conversation schema (one-to-one or group)
export const conversationSchema = z.object({
  id: z.string(),
  type: z.enum(['direct', 'group']),
  name: z.string().optional(), // For group chats
  participantIds: z.array(z.string()),
  createdAt: z.number(),
  updatedAt: z.number(),
  lastMessageId: z.string().optional(),
  lastMessageText: z.string().optional(),
  lastMessageTimestamp: z.number().optional(),
});

export type Conversation = z.infer<typeof conversationSchema>;

// Message schema
export const messageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  text: z.string(),
  timestamp: z.number(),
  readBy: z.array(z.string()).default([]),
  reactions: z.record(z.string(), z.array(z.string())).default({}), // emoji -> userId[]
});

export type Message = z.infer<typeof messageSchema>;

// Typing indicator schema
export const typingIndicatorSchema = z.object({
  conversationId: z.string(),
  userId: z.string(),
  username: z.string(),
  timestamp: z.number(),
});

export type TypingIndicator = z.infer<typeof typingIndicatorSchema>;

// Insert schemas for creating new records
export const insertUserSchema = userSchema.omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;

export const insertConversationSchema = conversationSchema.omit({ id: true, createdAt: true, updatedAt: true });
export type InsertConversation = z.infer<typeof insertConversationSchema>;

export const insertMessageSchema = messageSchema.omit({ id: true, timestamp: true, readBy: true, reactions: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
