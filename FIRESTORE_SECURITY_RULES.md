# Firestore Security Rules

## How to Update Security Rules

1. Go to Firebase Console: https://console.firebase.google.com/project/uniride/firestore/rules
2. Replace the existing rules with the rules below
3. Click "Publish"

## Complete Security Rules (LATEST VERSION)

**Last Updated**: After all improvements implemented

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId);
      allow update: if isOwner(userId);
      allow read, update: if isAdmin();
    }
    
    match /rides/{rideId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      allow delete: if isAuthenticated() && resource.data.driverId == request.auth.uid;
    }
    
    match /conversations/{conversationId} {
      allow read: if isAuthenticated() && request.auth.uid in resource.data.participants;
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && request.auth.uid in resource.data.participants;
      
      match /messages/{messageId} {
        allow read: if isAuthenticated() && request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
        allow create: if isAuthenticated() && request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
        allow update: if isAuthenticated() && request.auth.uid == resource.data.senderId;
      }
    }
    
    match /support/{messageId} {
      allow create: if true;
      allow read: if isAdmin();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
    
    match /notifications/{notificationId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAdmin();
      allow update: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    match /ratings/{ratingId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && resource.data.raterId == request.auth.uid;
      allow delete: if isAdmin();
    }
  }
}
```

## Important Notes

1. **Support Collection**: The rule `allow create: if true;` allows ANYONE (even unauthenticated users) to submit support messages. This is intentional so users can contact support even if they have login issues.

2. **If you want to require authentication for support messages**, change the support rule to:
```javascript
match /support/{messageId} {
  // Only authenticated users can create support messages
  allow create: if isAuthenticated();
  
  // Admins can read all support messages
  allow read: if isAdmin();
  
  // Admins can update support message status
  allow update: if isAdmin();
}
```

3. **Admin Role**: Make sure at least one user in your `users` collection has `role: "admin"` set. You can do this manually in Firebase Console:
   - Go to Firestore Database
   - Find your user document in the `users` collection
   - Add a field: `role` with value `admin`

## Testing the Rules

After publishing the rules:
1. Try submitting a support message from `/settings/support`
2. Check the browser console (F12) for any errors
3. Verify the message appears in Firestore Console under the `support` collection
4. Try accessing `/admin/support` to view messages

## Common Issues

### "Missing or insufficient permissions"
- Make sure you published the rules
- Check that the user is authenticated (logged in)
- For admin pages, ensure the user has `role: "admin"` in Firestore

### "PERMISSION_DENIED"
- The security rules are blocking the operation
- Check the specific rule for the collection you're trying to access
- Make sure the user meets the conditions in the rule

### Support messages not appearing
- Check Firestore Console to see if they're being created
- If they're not being created, check browser console for errors
- Verify the security rules allow `create` on the `support` collection
