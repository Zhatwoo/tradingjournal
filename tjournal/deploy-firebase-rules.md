# Firebase Rules Deployment Guide

## Steps to Fix the Permissions Error:

### 1. Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase in your project (if not already done)
```bash
firebase init firestore
firebase init storage
```

### 4. Deploy the Rules
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules

# Or deploy both at once
firebase deploy --only firestore:rules,storage:rules
```

### 5. Alternative: Manual Setup in Firebase Console

If you prefer to set up rules manually in the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `tjornals`
3. Go to **Firestore Database** → **Rules** tab
4. Replace the existing rules with the content from `firestore.rules`
5. Go to **Storage** → **Rules** tab  
6. Replace the existing rules with the content from `storage.rules`
7. Click **Publish**

## What These Rules Do:

- **Users Collection**: Users can only access their own user document
- **Trades1 Collection**: Users can only read/write/delete their own trades
- **Settings Collection**: Users can only access their own settings
- **UserSettings Collection**: Users can only access their own user settings
- **Storage**: Users can only upload/access their own trade images and profile pictures

## Security Features:

- All operations require authentication (`request.auth != null`)
- Users can only access data where `userId` matches their `auth.uid`
- Prevents unauthorized access to other users' data
- Secure file uploads with user-specific paths

After deploying these rules, your Firebase permissions error should be resolved!
