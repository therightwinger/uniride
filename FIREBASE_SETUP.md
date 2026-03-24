# Firebase Setup Guide for UniRide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `uniride` (or your preferred name)
4. Disable Google Analytics (optional, can enable later)
5. Click "Create project"

## Step 2: Register Web App

1. In your Firebase project, click the **Web icon** (`</>`) to add a web app
2. Enter app nickname: `UniRide Web`
3. Check "Also set up Firebase Hosting" (optional)
4. Click "Register app"
5. Copy the Firebase configuration object

## Step 3: Configure Environment Variables

1. Open `.env.local` file in your project root
2. Replace the placeholder values with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Step 4: Enable Authentication

1. In Firebase Console, go to **Build** → **Authentication**
2. Click "Get started"
3. Enable **Email/Password** sign-in method
4. Click "Save"

## Step 5: Create Firestore Database

1. Go to **Build** → **Firestore Database**
2. Click "Create database"
3. Choose **Start in production mode** (we'll add rules next)
4. Select your preferred location (choose closest to India, e.g., `asia-south1`)
5. Click "Enable"

## Step 6: Set Firestore Security Rules

1. In Firestore Database, go to **Rules** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isVerified() {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.status == 'verified';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && isOwner(userId);
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Rides collection
    match /rides/{rideId} {
      allow read: if isSignedIn();
      allow create: if isVerified();
      allow update: if isSignedIn() && 
                      (resource.data.driverId == request.auth.uid || isAdmin());
      allow delete: if isSignedIn() && 
                      (resource.data.driverId == request.auth.uid || isAdmin());
    }
    
    // Conversations collection
    match /conversations/{conversationId} {
      allow read: if isSignedIn() && 
                    request.auth.uid in resource.data.participants;
      allow create: if isSignedIn();
      allow update: if isSignedIn() && 
                      request.auth.uid in resource.data.participants;
      
      // Messages subcollection
      match /messages/{messageId} {
        allow read: if isSignedIn() && 
                      request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
        allow create: if isSignedIn() && 
                        request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
      }
    }
  }
}
```

3. Click "Publish"

## Step 7: Enable Firebase Storage

1. Go to **Build** → **Storage**
2. Click "Get started"
3. Choose **Start in production mode**
4. Click "Next" and "Done"

## Step 8: Set Storage Security Rules

1. In Storage, go to **Rules** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Profile images
    match /profileImages/{userId}/{fileName} {
      allow read: if isSignedIn();
      allow write: if isSignedIn() && isOwner(userId);
    }
    
    // Government IDs
    match /govIds/{userId}/{fileName} {
      allow read: if isSignedIn();
      allow write: if isSignedIn() && isOwner(userId);
    }
  }
}
```

3. Click "Publish"

## Step 9: Create Admin User

1. Go to **Authentication** → **Users**
2. Click "Add user"
3. Enter admin email and password
4. Click "Add user"
5. Copy the User UID
6. Go to **Firestore Database**
7. Click "Start collection"
8. Collection ID: `users`
9. Document ID: Paste the User UID
10. Add fields:
    - `email`: (string) admin email
    - `name`: (string) "Admin"
    - `role`: (string) "admin"
    - `status`: (string) "verified"
    - `createdAt`: (string) current ISO date
11. Click "Save"

## Step 10: Restart Development Server

```bash
npm run dev
```

## Step 11: Test the Integration

1. Register a new user with the app
2. Upload a government ID
3. Login as admin to verify users
4. Create a ride (after verification)
5. Test messaging between users

## Firestore Database Structure

```
users/
  {userId}/
    - id: string
    - name: string
    - email: string
    - phone: string (optional)
    - age: string (optional)
    - role: "user" | "admin"
    - status: "pending" | "verified" | "rejected" | "disabled"
    - profileImage: string (URL)
    - govIdImage: string (URL)
    - rating: number
    - totalRides: number
    - submittedAt: string (ISO date)
    - verifiedAt: string (ISO date)
    - disabledAt: string (ISO date)
    - createdAt: string (ISO date)

rides/
  {rideId}/
    - driverId: string
    - driver: object
    - pickup: string
    - dropoff: string
    - pickupCoords: { lat, lng }
    - dropoffCoords: { lat, lng }
    - date: string
    - time: string
    - seats: number
    - seatsLeft: number
    - price: number
    - vehicleType: string
    - notes: string
    - passengers: array
    - createdAt: string (ISO date)

conversations/
  {conversationId}/
    - participants: array of user IDs
    - participantNames: object
    - rideId: string (optional)
    - lastMessage: string
    - lastMessageTime: string (ISO date)
    - unreadCount: object
    - createdAt: string (ISO date)
    
    messages/
      {messageId}/
        - conversationId: string
        - senderId: string
        - senderName: string
        - text: string
        - timestamp: string (ISO date)
        - read: boolean
```

## Troubleshooting

### Error: "Firebase: Error (auth/configuration-not-found)"
- Make sure `.env.local` has correct values
- Restart dev server after updating `.env.local`

### Error: "Missing or insufficient permissions"
- Check Firestore security rules
- Make sure user is authenticated
- Verify user has correct role/status

### Images not uploading
- Check Storage security rules
- Verify Storage is enabled in Firebase Console
- Check file size limits (default 5MB)

### Messages not appearing
- Check Firestore rules for conversations collection
- Verify both users are in participants array
- Check browser console for errors

## Next Steps

- Set up Firebase Cloud Messaging for push notifications
- Add email verification flow
- Implement password reset
- Add analytics tracking
- Set up Firebase Hosting for deployment
