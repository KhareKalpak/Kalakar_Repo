# 🔥 FIREBASE INTEGRATION - IMPLEMENTATION GUIDE

## Overview

The Kalakar application has been fully integrated with Firebase Authentication and Firestore Database. All user data, portfolios, auditions, and applications are now stored in the cloud instead of localStorage.

---

## What's Been Implemented

### 1. **Firebase Authentication** ✅
- User signup with email and password
- Firebase user creation and authentication
- Secure password handling through Firebase
- User session management with Firebase Auth state

### 2. **Firestore Database** ✅
Firebase collections set up:
- **users** - User registration data
- **portfolios** - Actor portfolios
- **auditions** - Director audition listings
- **applications** - Actor applications to auditions

### 3. **Frontend Integration** ✅

#### **login.js** - Sign Up with Firebase
- Uses `firebase.auth().createUserWithEmailAndPassword(email, password)`
- Saves user profile to Firestore `users` collection
- Maintains sessionStorage fallback for immediate access
- Comprehensive error handling for Firebase auth errors

#### **script.js** - Landing Page Logout
- Uses `firebase.auth().signOut()` to sign out users
- Clears local session storage
- Redirects to homepage after logout

#### **dashboard.js** - Dashboard Management
- **Authentication Check**: Uses `firebase.auth().onAuthStateChanged()` to verify user
- **Portfolio Management**:
  - Save portfolios to Firestore `portfolios` collection
  - Load portfolios using `db.collection('portfolios').doc(userId).get()`
  - Query with fallback to localStorage
- **Audition Management**:
  - Directors post auditions to Firestore `auditions` collection
  - Actors browse auditions with `db.collection('auditions').get()`
  - Filter by `directorId` to show only director's auditions
- **Application Management**:
  - Actors apply to auditions, saved to Firestore `applications` collection
  - Track applications with `where('actorId', '==', userId)`
  - Directors review applications with `where('auditionId', '==', auditionId)`

---

## Technical Implementation Details

### Firebase Initialization
```javascript
// File: js/firebase-config.js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
```

### Data Models

**Users Collection:**
```javascript
{
  uid: "firebase-uid",
  email: "user@example.com",
  role: "actor" or "director",
  contactNumber: "+91XXXXXXXXXX",
  age: 25,
  joinDate: "MM/DD/YYYY",
  createdAt: ISO timestamp
}
```

**Portfolios Collection:**
```javascript
{
  userId: "firebase-uid",
  title: "My Acting Portfolio",
  bio: "About me...",
  experience: "Previous roles...",
  skills: "Acting, Drama, Comedy",
  savedDate: "MM/DD/YYYY",
  updatedAt: ISO timestamp
}
```

**Auditions Collection:**
```javascript
{
  directorId: "firebase-uid",
  projectTitle: "Marathi Drama Series",
  roleTitle: "Lead Male",
  roleDescription: "Description...",
  location: "Pune, Online",
  deadline: "YYYY-MM-DD",
  postedDate: "MM/DD/YYYY",
  createdAt: ISO timestamp
}
```

**Applications Collection:**
```javascript
{
  auditionId: "firestore-doc-id",
  projectTitle: "Marathi Drama Series",
  roleTitle: "Lead Male",
  actorEmail: "actor@example.com",
  actorId: "firebase-uid",
  portfolio: { portfolio object },
  appliedDate: "MM/DD/YYYY",
  createdAt: ISO timestamp,
  status: "pending"
}
```

---

## How to Complete Firebase Setup

### Step 1: Create Firebase Project
1. Visit https://console.firebase.google.com
2. Click "Create a project"
3. Enter project name: `kalakar-platform`
4. Enable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Services

**Firestore Database:**
1. In left sidebar: Build → Firestore Database
2. Click "Create Database"
3. Start in test mode
4. Select region: asia-south1 (closest to Pune)
5. Click "Create"

**Authentication:**
1. In left sidebar: Build → Authentication
2. Click "Get Started"
3. Select "Email/Password"
4. Toggle to enable
5. Click "Save"

### Step 3: Get Firebase Config

1. Click settings icon (⚙️) → Project settings
2. Scroll to "Your apps" section
3. Click Web app `</>`
4. Select or create "kalakar-web" app
5. Copy the Firebase config object

### Step 4: Update firebase-config.js

Replace placeholder values in `js/firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_FROM_FIREBASE",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 5: Configure Security Rules

1. Go to Firestore Database → Rules
2. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own user document
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Actors can read and write their own portfolio
    match /portfolios/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Auditions can be read by all authenticated users
    // Directors can only write their own
    match /auditions/{auditionId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == resource.data.directorId;
      allow create: if request.auth != null;
    }

    // Applications
    match /applications/{applicationId} {
      allow read: if request.auth.uid == resource.data.actorId ||
                     request.auth.uid == resource.data.directorId;
      allow write: if request.auth.uid == resource.data.actorId;
    }
  }
}
```

3. Click "Publish"

### Step 6: Test Firebase Setup

1. Open your website
2. Open Developer Console (F12)
3. Go to Console tab
4. You should see: "Firebase initialized successfully!"
5. Try signing up with test email
6. Check Firestore: Build → Firestore Database → Collections
7. You should see `users` collection with your test user

---

## Features Now Available

### 🎬 Actor Features
✅ Sign up with email and password
✅ Create and manage portfolio
✅ Browse director auditions
✅ Apply to auditions with portfolio
✅ Track application status
✅ Logout securely

### 🎥 Director Features
✅ Sign up with email and password
✅ Post auditions for projects
✅ View posted auditions
✅ Review actor portfolios
✅ Select/reject actors
✅ Logout securely

---

## Backward Compatibility

The system maintains localStorage fallback for backward compatibility:
- If Firestore queries fail, it falls back to localStorage
- Existing localStorage data is preserved
- New data is saved to both Firestore and localStorage
- This ensures smooth transition and data migration

---

## Error Handling

All Firebase operations include:
- Try-catch error handling
- Console error logging
- User-friendly error messages
- Fallback to localStorage if Firestore fails
- Graceful error recovery

---

## What's Next?

1. **Complete Firebase Setup** (User action)
   - Create Firebase project
   - Get Firebase credentials
   - Update firebase-config.js
   - Set security rules

2. **Test the Integration**
   - Sign up a test actor
   - Sign up a test director
   - Create a portfolio
   - Post an audition
   - Apply to audition

3. **Future Enhancements**
   - Email notifications for new applications
   - Profile image storage in Firebase Storage
   - Real-time chat between actors and directors
   - Reviews and ratings system
   - Payment integration

---

## Troubleshooting

### "Firebase is not defined"
- Ensure firebase-config.js is loaded
- Check all 3 Firebase SDK scripts are in head section
- Clear browser cache and refresh

### "Permission denied" errors
- Check Firestore security rules are published
- Verify you're logged in (request.auth != null)
- Check uid in rules matches authenticated user

### Data not appearing in Firestore
- Check Developer Console for errors (F12 → Console)
- Verify firebase-config.js has correct values
- Ensure you clicked "Publish" on security rules
- Try signing up again

### Sign up shows error
- Check email is valid format
- Check password is at least 6 characters
- Check email not already registered
- Look at console error for details

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Open Developer Console (F12) for error messages
3. Verify Firebase credentials in firebase-config.js
4. Check that Firestore Database is active (blue checkmark)
5. Ensure security rules are published

---

**You're all set! Your Kalakar platform now has a real Firebase backend! 🎉**

All user data is securely stored in the cloud with proper authentication and authorization.
