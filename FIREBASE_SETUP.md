# Firebase Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name (e.g., "seller-dashboard")
4. Disable Google Analytics (optional for this project)
5. Click "Create project"

## Step 2: Register Web App

1. In your Firebase project, click the **Web icon** (`</>`) to add a web app
2. Enter app nickname: "Seller Dashboard Web"
3. **Don't** check "Firebase Hosting" (we'll deploy later)
4. Click "Register app"
5. **Copy the firebaseConfig object** - you'll need this!

It looks like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

## Step 3: Enable Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click "Get started"
3. Click on **"Email/Password"** provider
   - Toggle "Enable"
   - Click "Save"
4. Click on **"Google"** provider
   - Toggle "Enable"
   - Select a support email
   - Click "Save"

## Step 4: Create Firestore Database

1. Go to **Build > Firestore Database**
2. Click "Create database"
3. Select **"Start in test mode"** (we'll add rules next)
4. Choose a location (closest to your users)
5. Click "Enable"

## Step 5: Set Firestore Security Rules

1. In Firestore Database, go to the **"Rules"** tab
2. Replace the rules with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Orders collection - users can only access their own orders
    match /orders/{orderId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && 
                               resource.data.userId == request.auth.uid;
    }
  }
}
```

3. Click **"Publish"**

## Step 6: Configure Your App

1. In your project folder, create `.env` file:
```bash
cp .env.example .env
```

2. Open `.env` and paste your Firebase config values:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

## Step 7: Create First User (Optional)

You can create a test user in Firebase Console:

1. Go to **Authentication > Users**
2. Click "Add user"
3. Enter email and password
4. Click "Add user"

Or just use the app's login page to sign up!

## Step 8: Test Your App

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` and try logging in!

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Make sure `.env` file exists and has all values
- Restart dev server after creating `.env`

### "Missing or insufficient permissions"
- Check Firestore rules are published
- Make sure you're logged in

### "Firebase: Error (auth/unauthorized-domain)"
- Go to Authentication > Settings > Authorized domains
- Add `localhost` if not already there

### Google Sign-In not working
- Make sure Google provider is enabled in Authentication
- Check that you selected a support email
