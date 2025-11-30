# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Firebase Setup (2 minutes)

**Create Firebase Project:**
1. Go to https://console.firebase.google.com/
2. Click "Add project" → Enter name → Create
3. Click Web icon (`</>`) → Register app

**Enable Services:**
1. **Authentication** → Get started → Enable "Email/Password" and "Google"
2. **Firestore Database** → Create database → Start in test mode

**Get Config:**
1. Project Settings (gear icon) → Scroll to "Your apps"
2. Copy the `firebaseConfig` values

### 2. Configure App (1 minute)

Edit `.env` file in `seller-dashboard` folder:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 3. Set Firestore Rules (1 minute)

In Firebase Console → Firestore Database → Rules tab:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
                            resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
    }
  }
}
```

Click "Publish"

### 4. Run App (1 minute)

```bash
cd seller-dashboard
npm run dev
```

Open http://localhost:5173

### 5. First Login

**Option A:** Create account in app (use any email/password)

**Option B:** Firebase Console → Authentication → Add user manually

---

## 📊 Import Orders

1. Login to the app
2. Go to "Orders" page
3. Click "Import CSV"
4. Use `sample-orders.csv` or your own CSV file

**CSV Format:**
```csv
date,account,orderId,customerName,amount,paymentType,status,state,rto,replacement,deliveredDate
2024-11-29,Amazon,ORD001,John Doe,1500,COD,Delivered,Maharashtra,false,false,2024-11-29
```

---

## ❓ Common Issues

**"Configuration not found"**
- Restart dev server after editing `.env`
- Check all VITE_ variables are set

**"Permission denied"**
- Publish Firestore rules
- Make sure you're logged in

**Can't login**
- Enable Email/Password in Firebase Authentication
- Check `.env` values are correct

**Google login fails**
- Enable Google provider in Authentication
- Add support email in Google provider settings

---

## 🎯 What's Next?

- Add more sellers (each sees only their data)
- Import your Amazon/Flipkart order exports
- View dashboard stats and charts
- Generate reports and download CSV
- Later: Add profit tracking, inventory management
