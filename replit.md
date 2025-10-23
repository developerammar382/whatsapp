# ChatApp - Real-time Messaging Platform

## Overview
ChatApp is a modern, production-ready real-time chat application built with React, Firebase, and TypeScript. It features a polished Discord/Slack-inspired interface with professional design using midnight blue, royal purple, soft white, and teal accent colors.

## Features Implemented

### Authentication
- Email/password authentication with Firebase Auth
- Google OAuth sign-in
- GitHub OAuth sign-in
- Secure user profile creation and management
- Auto-redirect handling for OAuth flows

### Real-time Messaging
- One-to-one direct messaging
- Real-time message delivery using Firestore listeners
- Message history with chronological ordering
- Auto-scroll to latest messages
- Message read receipts with checkmark indicators

### User Experience
- Online/offline status indicators with real-time presence detection
- Typing indicators showing when other users are composing messages
- Message reactions with emoji picker
- Profile customization (username, display name)
- Avatar upload and management via Firebase Storage
- Dark/light mode toggle with localStorage persistence
- Fully responsive design (mobile, tablet, desktop)
- Smooth animations and transitions

### UI Components
- Chat sidebar with conversation list
- Search functionality for conversations and users
- Main chat window with message bubbles
- Profile settings panel
- New conversation dialog
- User avatars with status indicators
- Theme toggle button

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Zustand** - State management
- **Wouter** - Lightweight routing
- **Shadcn/ui** - Component library
- **Lucide React** - Icon library
- **emoji-picker-react** - Emoji selection
- **date-fns** - Date formatting

### Backend
- **Firebase Authentication** - User authentication
- **Cloud Firestore** - Real-time database
- **Firebase Storage** - File/avatar storage
- **Firebase Hosting** - Deployment (ready)

## Project Structure

```
client/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ChatInput.tsx
│   │   ├── ChatSidebar.tsx
│   │   ├── ChatWindow.tsx
│   │   ├── ConversationItem.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── MessageReactions.tsx
│   │   ├── NewConversationDialog.tsx
│   │   ├── ProfileSettings.tsx
│   │   ├── ThemeProvider.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── TypingIndicator.tsx
│   │   └── UserAvatar.tsx
│   ├── pages/               # Page components
│   │   ├── auth.tsx         # Authentication page
│   │   └── chat.tsx         # Main chat interface
│   ├── services/            # Business logic
│   │   └── firebase-service.ts
│   ├── lib/                 # Utilities
│   │   ├── firebase.ts      # Firebase config
│   │   ├── store.ts         # Zustand store
│   │   └── queryClient.ts   # React Query config
│   ├── App.tsx              # Root component
│   └── index.css            # Global styles
├── shared/
│   └── schema.ts            # Shared TypeScript types
└── design_guidelines.md     # Design system documentation
```

## Data Models

### User
- id, email, username, displayName
- avatarUrl (optional)
- status (online/offline/away)
- lastSeen, createdAt timestamps

### Conversation
- id, type (direct/group)
- participantIds array
- lastMessage info (id, text, timestamp)
- createdAt, updatedAt timestamps

### Message
- id, conversationId, senderId
- text content
- timestamp
- readBy array (user IDs)
- reactions object (emoji -> userIds[])

### TypingIndicator
- conversationId, userId, username
- timestamp (auto-expires after 3 seconds)

## Firebase Configuration

The app requires three environment variables (already configured):
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_API_KEY`

## Design System

### Colors
- **Midnight Blue**: #1E1E2F (primary background in dark mode)
- **Royal Purple**: #5A4FCF (brand primary)
- **Soft White**: #F9F9FB (light mode background)
- **Teal**: #2FDACD (accent for buttons, highlights, status)

### Typography
- Font: Inter (Google Fonts)
- Hierarchy: Headers (2xl bold), Chat names (base semibold), Messages (sm normal), Timestamps (xs)

### Spacing
- Compact: 2-4px (reactions, inline elements)
- Standard: 8-16px (message bubbles, card padding)
- Large: 24-48px (section spacing)

### Components
- Rounded corners: lg (9px) for cards/panels, 2xl for message bubbles
- Buttons: Min height 36px (default), themed with hover/active states
- Avatars: Circular with gradient fallbacks, online status dots
- Inputs: Rounded lg with teal focus rings

## User Preferences
- Theme preference stored in localStorage
- Auto-selects first conversation when opening app
- Mobile-first responsive design

## Recent Changes (October 23, 2025)
- Initial project setup with complete MVP implementation
- All authentication methods configured (Email, Google, GitHub)
- Real-time messaging with Firestore
- Profile management with avatar uploads
- Dark/light theme toggle
- Responsive UI for all screen sizes
- Message reactions and typing indicators
- Read receipts and online status

## Next Steps (Future Enhancements)
- Push notifications using Firebase Cloud Messaging
- Message search functionality
- File and image sharing in messages
- Voice/video calling with WebRTC
- Group chat creation and management
- Message editing and deletion
- Custom emoji reactions
- Message threading/replies
