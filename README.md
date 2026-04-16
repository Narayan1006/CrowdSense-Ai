# StadiumAI Companion 🏟️

> **AI-powered visitor companion for Narendra Modi Stadium, Ahmedabad**

A full-stack React + Firebase + Gemini AI web application that helps stadium visitors navigate, avoid crowds, and get real-time assistance during events.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
cd "c:\Gen_AI\Projects\CrowdSense Ai\CrowdSense-Ai"
npm install
```

### 2. Start the dev server
```bash
npm run dev
```

The app opens at **http://localhost:3000** — fully functional with simulated crowd data, no API keys required!

---

## 🔑 Adding API Keys (Optional — for full features)

Copy `.env.example` to `.env` and fill in your keys:

```bash
copy .env.example .env
```

| Key | Where to get it | Feature unlocked |
|-----|----------------|-----------------|
| `VITE_GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) | Real Gemini AI responses |
| `VITE_GOOGLE_MAPS_API_KEY` | [Google Cloud Console](https://console.cloud.google.com) | Live satellite map |
| `VITE_FIREBASE_*` | [Firebase Console](https://console.firebase.google.com) | Real-time Firestore crowd data |

> **Without keys:** App works in demo mode with intelligent mock AI responses, simulated crowd data, and an SVG stadium map.

---

## ✨ Features

| Feature | Status |
|---------|--------|
| 🤖 AI Chat (Gemini) | ✅ With fallback |
| 🎙️ Voice Input (STT) | ✅ Web Speech API |
| 🔊 Voice Output (TTS) | ✅ Web Speech API |
| 🗺️ Stadium Map | ✅ SVG / Google Maps |
| 📊 Real-time Crowd Data | ✅ Firebase / Simulated |
| ✨ Smart Suggestions | ✅ AI-powered |
| 🆘 Emergency Mode | ✅ All 3 categories |
| 📱 Mobile Responsive | ✅ |

---

## 🏗️ Tech Stack

- **Frontend:** React 18 + Vite
- **AI:** Google Gemini 1.5 Flash
- **Database:** Firebase Firestore
- **Maps:** Google Maps JavaScript API
- **Voice:** Web Speech API (native browser)
- **Styling:** Vanilla CSS with glassmorphism

---

## 📁 Project Structure

```
src/
├── components/
│   ├── ChatPanel/       ← AI chat with voice
│   ├── StadiumMap/      ← Interactive stadium map
│   ├── CrowdStatus/     ← Real-time crowd indicators
│   ├── EmergencyModal/  ← Emergency assistance
│   └── SmartSuggestions/← AI recommendations
├── services/
│   ├── geminiService.js ← Gemini AI integration
│   ├── firebaseService.js ← Crowd data management
│   └── voiceService.js  ← Speech APIs
├── data/
│   └── stadiumData.js   ← Stadium layout & coordinates
└── hooks/
    └── useCrowdData.js  ← Real-time data hook
```

---

## 🎯 Demo Queries to Try

- *"Which gate should I enter from?"*
- *"Where is the nearest food stall?"*
- *"Which area is least crowded right now?"*
- *"How do I reach the stadium by metro?"*
- *"Where is the washroom near Block C?"*
- *"I need medical help"*

---

## 🆘 Emergency Contacts

| Service | Number |
|---------|--------|
| 🏥 Medical (On-site) | 1077 |
| 👮 Security | 100 |
| 🚨 Police | 112 |
| 🔍 Lost & Found | Gate 1 Info Desk |
