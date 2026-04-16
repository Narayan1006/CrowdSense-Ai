# SenseCrowd AI 🏟️ 

> **A real-time, AI-driven crowd intelligence and prediction platform for the Narendra Modi Stadium, Ahmedabad.**

SenseCrowd AI is a full-stack production-ready web application built to intelligently manage large-scale crowd logistics. It uses Firebase for real-time tracking and Google Gemini for dynamic, explainable predictive orchestration — splitting routing and control via a dual-interface architecture.

---

## ✨ Enterprise Features

| Feature | Description |
|---------|-------------|
| 🤖 **Explainable AI** | Chatbot logic enforced to deliver *Recommendation, Reasoning, Prediction & Confidence* for maximum transparency. |
| 🔮 **Traffic Prediction** | Client-side logical heuristics simulating real-time crowd momentum (e.g. Medium ➔ predicted High). |
| 🛡️ **Role-Based Access (RBAC)** | Secure route guards separating standard Attendee access from the administrative command center. |
| 🎫 **Smart Authentication** | Firebase Email/Password Auth for Admins | Mock ticket-verification lookup for Attendees. |
| ☁️ **Firebase & Vercel Ready** | Configs built-in ( `firebase.json` ) for immediate SPA deployment and remote hosting routing. |
| 🆘 **Emergency Mode** | Dedicated SOS triggers routing directly to central command instances. |
| 🏃‍♂️ **Smart Evacuation** | "Best Exit Now" triggers optimized real-time calculations out of congested stadium zones. |

---

## 🏗️ Architecture Stack

- **Frontend & Routing:** React 18 + React Router + Vite
- **Cloud Intelligence:** Google Gemini 2.0 Flash
- **Cloud Database:** Firebase Firestore (Real-time syncing)
- **Authentication:** Firebase Auth
- **Design System:** Glassmorphism UI (CSS Variables)

---

## 🚀 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root based off `.env.example`:
```env
VITE_GEMINI_API_KEY=your_gemini_key
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project
# ... add remaining standard Firebase configs
```

### 3. Launch Development Server
```bash
npm run dev
```
The application will boot at `http://localhost:3000`. 
- **Attendee Login:** Use `TKT-001` or `TKT-002` (Demo bypass supported)
- **Admin Login:** Proceed to `/admin` and login using Firebase registered credentials.

*(Note: Without `.env` keys, the app securely defaults to a local mock-mode retaining full UI functionality).*

---

## 🌍 Production Deployment (Firebase Hosting)

The project handles all build routing dynamically. To deploy directly to your Firebase configuration:

1. **Login via CLI:**
   ```bash
   npx firebase-tools login
   ```
2. **Build & Deploy:**
   ```bash
   npm run build
   npx firebase-tools deploy --only hosting
   ```

*(Requires the Firebase project specified in `.firebaserc` matching your Google IAM permissions).*

---

## 📁 Core Directory Structure

```text
src/
├── components/          ← UI Components (ChatPanel, CrowdStatus, AlertBanner)
├── context/             ← React Context Providers (AuthContext)
├── hooks/               ← Reusable Logic (useCrowdData, useAlerts)
├── pages/               ← Primary Views (LoginPage, UserApp, AdminDashboard)
├── services/            ← External SDKs (firebaseService, geminiService)
└── data/                ← Mock fallback databases and coordinate logic
```

---

## 🆘 Emergency Contacts

| Service | Number |
|---------|--------|
| 🏥 Medical (On-site) | 1077 |
| 👮 Security | 100 |
| 🚨 Police | 112 |

---
*Built via Firebase & Gemini for efficient crowd density normalization.*
