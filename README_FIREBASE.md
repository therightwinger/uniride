# UniRide - Firebase Integration

## 🚀 What's New with Firebase

Your UniRide app now uses Firebase for:

✅ **Real Authentication** - Secure user login/registration  
✅ **Cloud Database** - All data synced across devices  
✅ **Real-time Messaging** - Instant chat between users  
✅ **Image Storage** - Profile pictures and ID documents  
✅ **Admin Panel** - Manage users and verifications  
✅ **Data Persistence** - No more localStorage limitations

## 📁 New Files Created

### Configuration
- `lib/firebase.ts` - Firebase initialization
- `.env.local` - Environment variables (you need to fill this)

### Authentication
- `lib/firebase-auth.ts` - User registration, login, profile management
- `contexts/auth-context.tsx` - React context for auth state

### Features
- `lib/firebase-rides.ts` - Ride creation, joining, cancellation
- `lib/firebase-messages.ts` - Real-time messaging system
- `lib/firebase-admin.ts` - Admin user management

### Documentation
- `FIREBASE_SETUP.md` - Complete setup instructions
- `README_FIREBASE.md` - This file

## 🔧 Quick Setup (5 minutes)

### 1. Create Firebase Project
```
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it "uniride"
4. Create project
```

### 2. Get Configuration
```
1. Click Web icon (</>)
2. Register app as "UniRide Web"
3. Copy the config values
```

### 3. Update .env.local
Open `.env.local` and paste your Firebase config values.

### 4. Enable Services
In Firebase Console:
- **Authentication** → Enable Email/Password
- **Firestore Database** → Create database
- **Storage** → Enable storage

### 5. Set Security Rules
Copy rules from `FIREBASE_SETUP.md` sections 6 and 8.

### 6. Create Admin User
Follow Step 9 in `FIREBASE_SETUP.md`.

### 7. Restart Server
```bash
npm run dev
```

## 📚 How to Use Firebase Functions

### Authentication

```typescript
import { registerUser, signInUser, signOut } from "@/lib/firebase-auth"

// Register
const result = await registerUser(email, password, {
  name: "John Doe",
  phone: "1234567890",
  age: "25",
  govIdFile: file // File object
})

// Login
const result = await signInUser(email, password)

// Logout
await signOut()
```

### Rides

```typescript
import { createRide, getAvailableRides, joinRide } from "@/lib/firebase-rides"

// Create ride
await createRide({
  driverId: user.id,
  driver: { name: user.name, rating: 4.8, verified: true },
  pickup: "Chennai",
  dropoff: "Bangalore",
  // ... other fields
})

// Get rides
const { rides } = await getAvailableRides()

// Join ride
await joinRide(rideId, {
  id: user.id,
  name: user.name,
  rating: 4.5
})
```

### Messaging

```typescript
import { 
  getOrCreateConversation, 
  sendMessage, 
  subscribeToMessages 
} from "@/lib/firebase-messages"

// Start conversation
const { conversation } = await getOrCreateConversation(
  userId1, userId2, userName1, userName2, rideId
)

// Send message
await sendMessage(conversationId, senderId, senderName, "Hello!")

// Listen to messages (real-time)
const unsubscribe = subscribeToMessages(conversationId, (messages) => {
  console.log("New messages:", messages)
})
```

### Admin Functions

```typescript
import { getAllUsers, updateUserStatus } from "@/lib/firebase-admin"

// Get all users
const { users } = await getAllUsers()

// Verify user
await updateUserStatus(userId, "verified")

// Disable user
await updateUserStatus(userId, "disabled")
```

## 🔄 Migration from localStorage

The app currently uses localStorage. To migrate:

1. **Keep both systems** during transition
2. **Update pages gradually** to use Firebase
3. **Test each feature** before removing localStorage code

### Pages to Update:
- [ ] `app/register/page.tsx` - Use `registerUser()`
- [ ] `app/login/page.tsx` - Use `signInUser()`
- [ ] `app/rides/create/page.tsx` - Use `createRide()`
- [ ] `app/rides/page.tsx` - Use `getAvailableRides()`
- [ ] `app/rides/[id]/page.tsx` - Use `joinRide()`, `cancelRide()`
- [ ] `app/messages/page.tsx` - Use messaging functions
- [ ] `app/admin/page.tsx` - Use admin functions
- [ ] `app/profile/page.tsx` - Use auth context

## 🎯 Benefits Over localStorage

| Feature | localStorage | Firebase |
|---------|-------------|----------|
| Data persistence | Browser only | Cloud (all devices) |
| Real-time updates | ❌ | ✅ |
| User authentication | Manual | Built-in |
| Image storage | Base64 (limited) | Proper URLs |
| Data sharing | ❌ | ✅ All users |
| Security | Client-side only | Server rules |
| Scalability | ~5-10MB limit | Unlimited |
| Offline support | ✅ | ✅ (with config) |

## 🔐 Security Features

- **Authentication** - Only logged-in users can access data
- **Firestore Rules** - Server-side validation
- **Storage Rules** - Users can only upload their own files
- **Admin Role** - Special permissions for admin users
- **Verified Status** - Only verified users can create rides

## 📱 Real-time Features

With Firebase, these work in real-time:

1. **New rides appear instantly** for all users
2. **Messages deliver immediately** without refresh
3. **Seat availability updates** when someone joins
4. **Admin verifications** reflect instantly for users
5. **Profile changes sync** across all sessions

## 🐛 Common Issues

### "Firebase not configured"
- Check `.env.local` has all values
- Restart dev server: `npm run dev`

### "Permission denied"
- User not authenticated
- Check Firestore security rules
- Verify user status (pending/verified)

### "Storage upload failed"
- Check Storage rules in Firebase Console
- Verify file size < 5MB
- Check file type is allowed

## 📞 Support

For detailed setup instructions, see `FIREBASE_SETUP.md`.

For Firebase documentation: https://firebase.google.com/docs

## 🎉 Next Steps

1. Complete Firebase setup (follow `FIREBASE_SETUP.md`)
2. Test registration and login
3. Create admin user
4. Update pages to use Firebase functions
5. Test real-time messaging
6. Deploy to production

---

**Note**: Keep your `.env.local` file secure and never commit it to Git!
