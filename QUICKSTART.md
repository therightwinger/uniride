# 🚀 Firebase Quick Start Guide

## 5-Minute Setup

### 1. Create Firebase Project
Go to: https://console.firebase.google.com/

1. Click "Add project"
2. Name: `uniride`
3. Disable Analytics (optional)
4. Click "Create project"

### 2. Add Web App
1. Click the Web icon `</>`
2. App nickname: `UniRide Web`
3. Click "Register app"
4. **Copy the config object** (you'll need this next)

### 3. Update .env.local
Open `.env.local` and replace with your values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 4. Enable Authentication
1. Go to **Build** → **Authentication**
2. Click "Get started"
3. Enable **Email/Password**
4. Click "Save"

### 5. Create Firestore Database
1. Go to **Build** → **Firestore Database**
2. Click "Create database"
3. Choose **Production mode**
4. Location: `asia-south1` (closest to India)
5. Click "Enable"

### 6. Set Firestore Rules
1. Click **Rules** tab
2. Copy this and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && isOwner(userId);
      allow update: if isOwner(userId);
    }
    
    match /rides/{rideId} {
      allow read, write: if isSignedIn();
    }
    
    match /conversations/{conversationId} {
      allow read, write: if isSignedIn();
      match /messages/{messageId} {
        allow read, write: if isSignedIn();
      }
    }
  }
}
```

3. Click "Publish"

### 7. Enable Storage
1. Go to **Build** → **Storage**
2. Click "Get started"
3. Choose **Production mode**
4. Click "Next" → "Done"

### 8. Set Storage Rules
1. Click **Rules** tab
2. Copy this and paste:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isSignedIn() {
      return request.auth != null;
    }
    
    match /profileImages/{userId}/{fileName} {
      allow read: if isSignedIn();
      allow write: if isSignedIn() && request.auth.uid == userId;
    }
    
    match /govIds/{userId}/{fileName} {
      allow read: if isSignedIn();
      allow write: if isSignedIn() && request.auth.uid == userId;
    }
  }
}
```

3. Click "Publish"

### 9. Restart Dev Server
```bash
npm run dev
```

### 10. Test It!
1. Go to http://localhost:3000
2. Click "Register"
3. Create a new account
4. Upload a government ID
5. Login and test the app

## ✅ You're Done!

Your app now has:
- ✅ Real authentication
- ✅ Cloud database
- ✅ Image storage
- ✅ Real-time sync

## 🔧 Optional: Create Admin User

1. Register a user normally
2. Go to Firebase Console → **Authentication** → **Users**
3. Copy the User UID
4. Go to **Firestore Database**
5. Find the user document in `users` collection
6. Edit the document:
   - Change `role` to `"admin"`
   - Change `status` to `"verified"`
7. Save

Now login with that user to access admin panel at `/admin`

## 📚 Next Steps

- Read `README_FIREBASE.md` for usage examples
- Read `FIREBASE_SETUP.md` for detailed docs
- Update pages to use Firebase functions
- Test real-time messaging

## 🐛 Troubleshooting

**"Firebase not configured"**
- Check `.env.local` has all values
- Restart dev server

**"Permission denied"**
- Check Firestore rules are published
- Make sure user is logged in

**Can't upload images**
- Check Storage rules are published
- Verify file size < 5MB

## 🎉 Happy Coding!
