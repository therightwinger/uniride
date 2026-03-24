# Firebase Migration Checklist

## Phase 1: Firebase Setup ⚙️

- [ ] Create Firebase project
- [ ] Add web app to Firebase
- [ ] Copy config to `.env.local`
- [ ] Enable Email/Password authentication
- [ ] Create Firestore database
- [ ] Set Firestore security rules
- [ ] Enable Firebase Storage
- [ ] Set Storage security rules
- [ ] Create admin user
- [ ] Test Firebase connection

**Estimated Time:** 10-15 minutes

## Phase 2: Authentication 🔐

- [ ] Update `app/register/page.tsx`
  - [ ] Replace localStorage with `registerUser()`
  - [ ] Handle file upload with Firebase Storage
  - [ ] Test registration flow
  
- [ ] Update `app/login/page.tsx`
  - [ ] Replace localStorage with `signInUser()`
  - [ ] Test login flow
  - [ ] Test admin login redirect

- [ ] Add AuthProvider to `app/layout.tsx`
  - [ ] Wrap app with `<AuthProvider>`
  - [ ] Test auth state persistence

- [ ] Update `hooks/use-auth-guard.ts`
  - [ ] Use Firebase auth instead of localStorage
  - [ ] Test protected routes

**Estimated Time:** 30-45 minutes

## Phase 3: Rides Management 🚗

- [ ] Update `app/rides/create/page.tsx`
  - [ ] Replace localStorage with `createRide()`
  - [ ] Test ride creation
  - [ ] Verify Firestore document created

- [ ] Update `app/rides/page.tsx`
  - [ ] Replace localStorage with `getAvailableRides()`
  - [ ] Test ride listing
  - [ ] Verify past rides filtered

- [ ] Update `app/rides/[id]/page.tsx`
  - [ ] Use `getRideById()` for ride details
  - [ ] Replace join logic with `joinRide()`
  - [ ] Replace cancel logic with `cancelRide()`
  - [ ] Test join/leave functionality

- [ ] Update `app/map/page.tsx`
  - [ ] Use `getAvailableRides()` for map markers
  - [ ] Test map view with Firebase data

**Estimated Time:** 45-60 minutes

## Phase 4: Admin Panel 👨‍💼

- [ ] Update `app/admin/login/page.tsx`
  - [ ] Use Firebase auth for admin login
  - [ ] Test admin authentication

- [ ] Update `app/admin/page.tsx`
  - [ ] Replace localStorage with `getAllUsers()`
  - [ ] Use `updateUserStatus()` for verification
  - [ ] Test approve/reject/disable actions
  - [ ] Verify ID images load from Storage
  - [ ] Test real-time updates

**Estimated Time:** 30-45 minutes

## Phase 5: Messaging 💬

- [ ] Update `app/messages/page.tsx`
  - [ ] Use `getUserConversations()` for conversation list
  - [ ] Implement conversation UI
  - [ ] Test conversation creation

- [ ] Create message thread component
  - [ ] Use `subscribeToMessages()` for real-time
  - [ ] Use `sendMessage()` for sending
  - [ ] Use `markMessagesAsRead()` for read status
  - [ ] Test real-time message delivery

- [ ] Add message button to ride details
  - [ ] Create conversation with driver
  - [ ] Test messaging from ride page

**Estimated Time:** 60-90 minutes

## Phase 6: Profile & Settings 👤

- [ ] Update `app/profile/page.tsx`
  - [ ] Use auth context for user data
  - [ ] Add profile image upload
  - [ ] Test profile updates

- [ ] Update settings pages
  - [ ] `app/settings/profile/page.tsx`
  - [ ] `app/settings/security/page.tsx`
  - [ ] `app/settings/notifications/page.tsx`
  - [ ] `app/settings/privacy/page.tsx`
  - [ ] `app/settings/ratings/page.tsx`
  - [ ] `app/settings/support/page.tsx`

**Estimated Time:** 45-60 minutes

## Phase 7: Testing & Cleanup 🧪

- [ ] Test complete user flow
  - [ ] Register → Verify → Create Ride → Join Ride
  - [ ] Test messaging between users
  - [ ] Test admin verification flow

- [ ] Test edge cases
  - [ ] Expired rides don't show
  - [ ] Can't join full rides
  - [ ] Can't create ride without verification
  - [ ] Admin can disable users

- [ ] Remove localStorage code
  - [ ] Search for `localStorage.getItem`
  - [ ] Search for `localStorage.setItem`
  - [ ] Remove unused localStorage logic

- [ ] Update documentation
  - [ ] Update README with Firebase info
  - [ ] Document any custom changes

**Estimated Time:** 30-45 minutes

## Phase 8: Deployment 🚀

- [ ] Set up production Firebase project (optional)
- [ ] Add environment variables to hosting platform
- [ ] Deploy to Vercel/Netlify
- [ ] Test production deployment
- [ ] Monitor Firebase usage
- [ ] Set up Firebase Analytics (optional)

**Estimated Time:** 20-30 minutes

## Total Estimated Time: 4-6 hours

## Quick Reference

### Files to Update
```
✅ Created (Ready to use):
- lib/firebase.ts
- lib/firebase-auth.ts
- lib/firebase-rides.ts
- lib/firebase-messages.ts
- lib/firebase-admin.ts
- contexts/auth-context.tsx

📝 Need to Update:
- app/register/page.tsx
- app/login/page.tsx
- app/rides/create/page.tsx
- app/rides/page.tsx
- app/rides/[id]/page.tsx
- app/map/page.tsx
- app/admin/page.tsx
- app/admin/login/page.tsx
- app/messages/page.tsx
- app/profile/page.tsx
- app/layout.tsx (add AuthProvider)
- hooks/use-auth-guard.ts

💡 Example Files (Reference):
- app/login/page.firebase-example.tsx
- app/register/page.firebase-example.tsx
```

## Tips for Success

1. **Start with authentication** - Get login/register working first
2. **Test each phase** - Don't move to next phase until current works
3. **Keep localStorage temporarily** - Remove only after Firebase works
4. **Use browser console** - Check for Firebase errors
5. **Check Firebase Console** - Verify data is being saved
6. **Test real-time** - Open app in two browsers to see updates

## Common Issues & Solutions

### "Firebase not configured"
→ Check `.env.local` and restart server

### "Permission denied"
→ Check Firestore rules are published

### "User not found"
→ Make sure user document exists in Firestore

### "Storage upload failed"
→ Check Storage rules and file size

### "Messages not appearing"
→ Check conversation participants array

## Need Help?

- Read `FIREBASE_SETUP.md` for detailed setup
- Read `README_FIREBASE.md` for usage examples
- Check `FIREBASE_ARCHITECTURE.md` for system overview
- Look at example files for implementation patterns

## Progress Tracking

**Started:** ___________  
**Phase 1 Complete:** ___________  
**Phase 2 Complete:** ___________  
**Phase 3 Complete:** ___________  
**Phase 4 Complete:** ___________  
**Phase 5 Complete:** ___________  
**Phase 6 Complete:** ___________  
**Phase 7 Complete:** ___________  
**Phase 8 Complete:** ___________  
**Finished:** ___________

---

Good luck with the migration! 🎉
