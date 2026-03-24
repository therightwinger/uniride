# Firebase Architecture for UniRide

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        UniRide App                          │
│                     (Next.js Frontend)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Firebase SDK
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Firebase Services                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Authentication│  │   Firestore  │  │   Storage    │    │
│  │              │  │   Database   │  │              │    │
│  │ • Email/Pass │  │              │  │ • Profile    │    │
│  │ • User Mgmt  │  │ • Users      │  │   Images     │    │
│  │ • Sessions   │  │ • Rides      │  │ • Gov IDs    │    │
│  │              │  │ • Messages   │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Registration
```
User → Register Page → firebase-auth.ts → Firebase Auth
                                        ↓
                                   Create User
                                        ↓
                              Upload Gov ID → Storage
                                        ↓
                           Create Profile → Firestore
                                        ↓
                                  Return User
```

### 2. User Login
```
User → Login Page → firebase-auth.ts → Firebase Auth
                                     ↓
                              Verify Credentials
                                     ↓
                          Get Profile → Firestore
                                     ↓
                              Return User Data
```

### 3. Create Ride
```
Driver → Create Ride Page → firebase-rides.ts → Firestore
                                              ↓
                                      Validate User Status
                                              ↓
                                      Create Ride Document
                                              ↓
                                      Real-time Update
                                              ↓
                                All Users See New Ride
```

### 4. Real-time Messaging
```
User A → Send Message → firebase-messages.ts → Firestore
                                             ↓
                                    Create Message Doc
                                             ↓
                                    Real-time Listener
                                             ↓
                                    User B Sees Message
                                      (Instantly!)
```

## Database Structure

### Firestore Collections

```
firestore/
├── users/
│   └── {userId}/
│       ├── id: string
│       ├── name: string
│       ├── email: string
│       ├── role: "user" | "admin"
│       ├── status: "pending" | "verified" | "rejected" | "disabled"
│       ├── profileImage: string (URL)
│       ├── govIdImage: string (URL)
│       ├── rating: number
│       └── createdAt: timestamp
│
├── rides/
│   └── {rideId}/
│       ├── driverId: string
│       ├── driver: object
│       ├── pickup: string
│       ├── dropoff: string
│       ├── pickupCoords: { lat, lng }
│       ├── dropoffCoords: { lat, lng }
│       ├── date: string
│       ├── time: string
│       ├── seats: number
│       ├── seatsLeft: number
│       ├── price: number
│       ├── passengers: array
│       └── createdAt: timestamp
│
└── conversations/
    └── {conversationId}/
        ├── participants: [userId1, userId2]
        ├── participantNames: object
        ├── rideId: string (optional)
        ├── lastMessage: string
        ├── lastMessageTime: timestamp
        ├── unreadCount: object
        └── messages/
            └── {messageId}/
                ├── senderId: string
                ├── senderName: string
                ├── text: string
                ├── timestamp: timestamp
                └── read: boolean
```

### Storage Structure

```
storage/
├── profileImages/
│   └── {userId}/
│       └── {filename}
│
└── govIds/
    └── {userId}/
        └── {filename}
```

## Security Rules

### Firestore Rules Logic

```
Users Collection:
- Read: Any authenticated user
- Create: Only for own user ID
- Update: Only own profile (or admin)
- Delete: Admin only

Rides Collection:
- Read: Any authenticated user
- Create: Only verified users
- Update: Only ride owner or admin
- Delete: Only ride owner or admin

Conversations Collection:
- Read: Only participants
- Create: Any authenticated user
- Update: Only participants
- Messages: Only participants can read/write
```

### Storage Rules Logic

```
Profile Images:
- Read: Any authenticated user
- Write: Only own profile image

Government IDs:
- Read: Any authenticated user (for admin verification)
- Write: Only own ID
```

## Real-time Features

### How Real-time Works

1. **Client subscribes** to Firestore collection
2. **Firestore sends initial data**
3. **Any change triggers update** (add, modify, delete)
4. **Client receives update instantly**
5. **UI updates automatically**

### What's Real-time in UniRide

✅ New rides appear instantly  
✅ Messages deliver immediately  
✅ Seat availability updates live  
✅ User status changes reflect instantly  
✅ Admin verifications update in real-time

## API Functions

### Authentication (`lib/firebase-auth.ts`)
- `registerUser()` - Create new user
- `signInUser()` - Login user
- `signOut()` - Logout user
- `getCurrentUserProfile()` - Get user data
- `uploadProfileImage()` - Upload profile pic

### Rides (`lib/firebase-rides.ts`)
- `createRide()` - Post new ride
- `getAvailableRides()` - Get all rides
- `getRideById()` - Get single ride
- `joinRide()` - Join as passenger
- `leaveRide()` - Leave ride
- `cancelRide()` - Cancel ride (driver)

### Messaging (`lib/firebase-messages.ts`)
- `getOrCreateConversation()` - Start chat
- `sendMessage()` - Send message
- `getMessages()` - Get message history
- `subscribeToMessages()` - Real-time listener
- `markMessagesAsRead()` - Mark as read

### Admin (`lib/firebase-admin.ts`)
- `getAllUsers()` - Get all users
- `updateUserStatus()` - Verify/disable users
- `getPendingVerifications()` - Get pending users

## Performance Optimization

### Firestore Queries
- Indexed queries for fast retrieval
- Pagination for large datasets
- Real-time listeners only where needed
- Offline persistence enabled

### Storage
- Compressed images before upload
- CDN delivery for fast loading
- Lazy loading for images
- Thumbnail generation (can add)

### Caching
- Firebase SDK caches data locally
- Offline support built-in
- Reduces database reads
- Faster app performance

## Cost Optimization

### Free Tier Limits (Generous!)
- **Authentication**: Unlimited users
- **Firestore**: 50K reads/day, 20K writes/day
- **Storage**: 5GB storage, 1GB/day downloads
- **Hosting**: 10GB/month bandwidth

### Best Practices
- Use real-time listeners sparingly
- Implement pagination
- Cache frequently accessed data
- Optimize query patterns
- Compress images before upload

## Scalability

Firebase scales automatically:
- No server management needed
- Handles millions of users
- Global CDN for fast access
- Auto-scaling infrastructure
- 99.95% uptime SLA

## Next Steps

1. Complete Firebase setup (see QUICKSTART.md)
2. Test authentication flow
3. Implement real-time messaging
4. Add push notifications (optional)
5. Deploy to production
