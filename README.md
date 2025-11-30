# Seller Dashboard

A React-based order management dashboard for Amazon sellers with automatic API sync.

## 🚀 Features

- **Amazon API Sync**: Automatically fetch orders from Amazon Seller Central
- **Authentication**: Email/password and Google login
- **Dashboard**: Real-time stats, charts, order counts
- **Orders Management**: Search, filter, update order status
- **Reports**: Date-range filtering, download CSV exports
- **Multi-user**: Each seller sees only their own data

## 🎯 How It Works

```
Amazon Seller API → Backend Server → Your Dashboard → Firestore
```

1. Backend fetches orders from Amazon
2. Dashboard displays and manages orders
3. All data stored in Firestore (free tier)

## 📦 Setup

### 1. Install Dependencies

**Frontend:**
```bash
cd seller-dashboard
npm install
```

**Backend:**
```bash
cd amazon-backend
npm install
```

### 2. Firebase Setup

1. Create project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password + Google)
3. Create Firestore Database (test mode)
4. Get config and add to `seller-dashboard/.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:5000
```

### 3. Amazon SP-API Credentials

1. Go to [Seller Central](https://sellercentral.amazon.com/)
2. Navigate to **Apps & Services** → **Develop Apps**
3. Create new app with **Orders** access
4. Get:
   - LWA Client ID
   - LWA Client Secret
   - Refresh Token (see `AMAZON_SYNC_FREE.md`)

### 4. Run the App

**Terminal 1 - Backend:**
```bash
cd amazon-backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd seller-dashboard
npm run dev
```

Open http://localhost:3000

### 5. Sync Orders

1. Login to dashboard
2. Go to **Orders** page
3. Click **🔄 Sync from Amazon**
4. Enter your Amazon credentials
5. Select date range
6. Click **Sync Orders**

## 🆓 Free Hosting

Deploy backend for free (no need to run on your computer):

### Render.com (Recommended)
```bash
# Push amazon-backend to GitHub
# Go to render.com → New Web Service
# Connect repo → Deploy
# Free: 750 hours/month
```

### Railway.app
```bash
# Go to railway.app
# New Project → Deploy from GitHub
# Free: $5 credit/month
```

### Fly.io
```bash
cd amazon-backend
flyctl launch
flyctl deploy
# Free: 3 VMs
```

Update `VITE_API_URL` in `.env` with your deployed URL.

## 📊 Firestore Rules

Set these rules in Firebase Console:

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

## 💰 Cost

**100% FREE!**

- Firebase Free Tier: 50K reads/day, 20K writes/day
- Backend Hosting: Free on Render/Railway/Fly.io
- Amazon SP-API: Free (included with seller account)

## 📖 Documentation

- `AMAZON_SYNC_FREE.md` - Detailed Amazon API setup
- `FREE_SETUP.md` - Firestore usage and limits
- `FIREBASE_SETUP.md` - Firebase configuration guide
- `amazon-backend/README.md` - Backend deployment guide

## 🔧 Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication
- **Charts**: Recharts
- **API**: Amazon SP-API

## 🐛 Troubleshooting

**Backend won't start:**
```bash
# Change port in amazon-backend/.env
PORT=5001
```

**Can't connect to backend:**
```bash
# Check VITE_API_URL matches backend URL
# Make sure backend is running
```

**Amazon API errors:**
- Verify credentials are correct
- Check app has Orders API access
- Ensure refresh token is valid

## 📝 License

MIT
