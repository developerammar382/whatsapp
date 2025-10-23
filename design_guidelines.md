# Real-Time Chat Application Design Guidelines

## Design Approach
**System-Based with Reference Inspiration**: Drawing from Discord and Slack's proven chat interfaces, optimized for real-time communication and extended user sessions. Focus on clarity, information density, and seamless interaction patterns.

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary)**
- Background Primary: `222 13% 13%` (Midnight blue #1E1E2F)
- Background Secondary: `222 13% 18%` (Lighter panels/cards)
- Background Tertiary: `222 13% 10%` (Deepest areas, modals)
- Brand Primary: `251 51% 56%` (Royal purple #5A4FCF)
- Accent: `175 95% 52%` (Teal #2FDACD)
- Text Primary: `240 9% 98%` (Soft white #F9F9FB)
- Text Secondary: `240 6% 70%` (Muted text)
- Text Tertiary: `240 5% 50%` (Timestamps, metadata)

**Light Mode**
- Background Primary: `240 9% 98%` (Soft white #F9F9FB)
- Background Secondary: `240 5% 95%` (Cards/panels)
- Background Tertiary: `0 0% 100%` (Pure white for contrast)
- Brand Primary: `251 51% 56%` (Royal purple - consistent)
- Accent: `175 95% 45%` (Slightly darker teal for contrast)
- Text Primary: `222 13% 13%` (Midnight blue for text)
- Text Secondary: `222 8% 40%` (Muted text)
- Text Tertiary: `222 5% 55%` (Timestamps, metadata)

### B. Typography

**Font Family**: Inter (Google Fonts) for all text
- Primary: `font-sans` (Inter)
- Monospace: `font-mono` for code snippets in messages

**Hierarchy**
- Page Headers: `text-2xl font-bold` (Settings, Group Info)
- Chat Names: `text-base font-semibold`
- Message Sender: `text-sm font-medium`
- Message Body: `text-sm font-normal`
- Timestamps: `text-xs font-normal`
- Button Text: `text-sm font-medium`
- Input Labels: `text-xs font-medium uppercase tracking-wide`

### C. Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 8, 12, and 16
- Compact spacing: `p-2, gap-2` (Message reactions, inline elements)
- Standard spacing: `p-4, gap-4` (Message bubbles, card padding)
- Section spacing: `p-8, gap-8` (Panel sections, major groupings)
- Large spacing: `p-12, gap-12` (Modal padding, isolated sections)

**Grid Structure**
- Three-column layout on desktop (lg: and above)
  - Sidebar: `w-80` (320px - User list, channel list)
  - Main Chat: `flex-1` (Flexible width for conversation)
  - Settings Panel: `w-96` (384px - Profile, settings when open)
- Collapse to single column on mobile with slide-in panels

### D. Component Library

**Navigation & Sidebar**
- Rounded corners: `rounded-lg` for all cards and panels
- Active state: Royal purple background with teal left border `border-l-4`
- Hover state: Slight background lift (`bg-opacity-80`)
- Online indicators: Small `w-3 h-3` teal dots with pulse animation
- Unread badges: Teal background with white text, `rounded-full`

**Chat Messages**
- Sender's messages: Align right with royal purple background `bg-[hsl(251,51%,56%)]`
- Received messages: Align left with secondary background color
- Message bubbles: `rounded-2xl` with `max-w-md`
- Timestamp: Absolute positioned `text-xs` in tertiary text color
- Read receipts: Small teal checkmarks beneath messages
- Reactions: `rounded-full` emoji containers with counts, positioned below bubble

**Input Fields**
- All inputs: `rounded-lg` with `border` in background tertiary
- Focus state: Teal ring `ring-2 ring-[hsl(175,95%,52%)]`
- Dark mode inputs: Match background secondary with lighter border
- Chat composer: Fixed bottom, `rounded-2xl`, elevated with shadow
- File attachments: Inline preview thumbnails with `rounded-md`

**Buttons**
- Primary CTA: Royal purple background, white text, `rounded-lg`
- Secondary: Transparent with royal purple border and text
- Icon buttons: Square `w-10 h-10`, circular hover background
- Send button: Teal background in message composer

**User Avatars**
- Sizes: `w-8 h-8` (small), `w-12 h-12` (medium), `w-24 h-24` (profile)
- Always `rounded-full` with royal purple ring for online status
- Offline: Gray ring or no ring

**Modals & Panels**
- Background: Background tertiary for depth
- Overlay: `bg-black/50` backdrop
- Corners: `rounded-xl` for prominent modals
- Shadows: `shadow-2xl` for elevation

**Status Indicators**
- Typing indicator: Three animated dots in teal color
- Online status: Teal pulsing dot
- Offline status: Gray static dot
- Away/idle: Amber dot

### E. Animations

**Minimal & Purposeful**
- Message send: Subtle fade-in and slide-up (`duration-200`)
- Online pulse: Continuous gentle pulse on status dots
- Typing indicator: Bouncing dots animation
- Modal entry: Fade and scale (`duration-300`)
- Panel slide: Smooth slide-in/out for mobile sidebars (`duration-200`)
- Hover states: Quick transitions (`duration-150`)

**No Distracting Effects**: Avoid page transitions, elaborate scroll animations, or excessive motion

### F. Responsive Breakpoints

- Mobile: `< 768px` - Single column, slide-in panels
- Tablet: `768px - 1024px` - Two-column (sidebar + chat)
- Desktop: `>= 1024px` - Full three-column layout

### G. Accessibility

- Maintain WCAG AA contrast ratios in both modes
- Consistent focus indicators with teal ring
- Screen reader labels for all interactive elements
- Keyboard navigation support for all actions
- Dark mode as default with persistent toggle preference

### H. Images

**Profile Avatars**: User-uploaded images displayed in circular avatars throughout the interface. Include placeholder gradients (royal purple to teal) with user initials for users without custom avatars.

**Chat Attachments**: Support inline image previews in messages with lightbox expansion on click. Display as rounded thumbnails `rounded-lg` within message bubbles.

No large hero images required - this is a utility-focused application where the interface IS the experience.