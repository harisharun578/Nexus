# 🚀 NEXUS AI — Workplace Operating System

> Enterprise AI workplace platform with biometric authentication, ML analytics, voice commands, and AI copilot.

![NEXUS AI](https://img.shields.io/badge/NEXUS_AI-v2.0-00ffc8?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb)

---

## ✨ Features

| Feature | Technology |
|---|---|
| 👁️ Real Face Recognition | face-api.js + TensorFlow + DeepFace |
| 👆 Fingerprint Auth | WebAuthn API (Touch ID / Windows Hello) |
| 🔷 Google OAuth | @react-oauth/google |
| 🤖 AI Copilot | OpenAI GPT / Rule-based NLP |
| 🎙️ Voice Commands | Web Speech API |
| 📊 Burnout Prediction | Random Forest (scikit-learn) |
| 🎫 Ticket Classification | TF-IDF + Naive Bayes |
| 🔍 Anomaly Detection | Isolation Forest |
| 😊 Emotion Detection | DeepFace |
| 🎨 5 UI Themes | Neon / Aurora / Cyberpunk / Corporate / Arctic |
| 🚨 Emergency SOS | Real-time WebSocket alerts |
| 📡 Real-time Updates | Socket.io |

---

## 🗂️ Project Structure

```
nexus-ai-workplace-os/
├── frontend/          # React 18 app
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── biometric/    # FaceScanner, FingerprintAuth
│   │   │   ├── ai/           # AICopilot, VoiceAssistant
│   │   │   ├── layout/       # Sidebar
│   │   │   └── common/       # ThemeSwitcher
│   │   ├── pages/            # All page components
│   │   ├── context/          # Zustand stores
│   │   └── styles/           # Global CSS + themes
│   └── public/
│       └── models/           # face-api.js model weights
├── backend/           # Node.js + Express API
│   ├── routes/        # auth, hr, tickets, ai, employees...
│   ├── models/        # Mongoose schemas
│   ├── middleware/    # JWT auth
│   └── uploads/       # User photos, screenshots
├── ml-services/       # Python FastAPI ML service
│   ├── main.py        # All ML endpoints
│   └── models/        # Trained model files (auto-generated)
├── database/
│   └── seeds/         # Demo data seeder
├── devops/
│   └── docker-compose.yml
└── docker-compose.yml
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB (local or Atlas)
- Git

### 1. Clone & Install

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/nexus-ai-workplace-os.git
cd nexus-ai-workplace-os

# Install backend deps
cd backend && npm install && cd ..

# Install frontend deps
cd frontend && npm install && cd ..

# Install ML deps
cd ml-services && pip install -r requirements.txt && cd ..
```

### 2. Configure Environment

```bash
# Copy env template
cp .env.example backend/.env

# Edit backend/.env with your values:
# - MONGO_URI (your MongoDB connection string)
# - GOOGLE_CLIENT_ID (from Google Cloud Console)
# - OPENAI_API_KEY (optional - has fallback)
```

### 3. Download face-api.js Models

```bash
# Download model weights to frontend/public/models/
# Required files (download from https://github.com/justadudewhohacks/face-api.js/tree/master/weights):
# - tiny_face_detector_model-weights_manifest.json
# - tiny_face_detector_model-shard1
# - face_landmark_68_model-weights_manifest.json
# - face_landmark_68_model-shard1
# - face_recognition_model-weights_manifest.json
# - face_recognition_model-shard1
# - face_recognition_model-shard2
```

Or use the download script:
```bash
cd frontend/public/models
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1
curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard2
```

### 4. Seed Database

```bash
cd database/seeds
node seedData.js
```

### 5. Start All Services

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Running on http://localhost:5000
```

**Terminal 2 — ML Service:**
```bash
cd ml-services
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# Running on http://localhost:8000
```

**Terminal 3 — Frontend:**
```bash
cd frontend
npm start
# Running on http://localhost:3000
```

---

## 🐳 Docker (One Command)

```bash
docker-compose up --build
```

Services:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- ML Service: http://localhost:8000
- MongoDB: localhost:27017

---

## 🎯 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@nexus.ai | Admin@123 |
| HR Manager | priya@nexus.ai | Pass@123 |
| Engineer | john@nexus.ai | Pass@123 |
| ML Engineer | rahul@nexus.ai | Pass@123 |
| Finance | sneha@nexus.ai | Pass@123 |

---

## 🎙️ Voice Commands

Say these commands in the app:
- *"Open dashboard"* — Navigate to dashboard
- *"Open HR portal"* — Go to HR page
- *"Raise ticket"* — Open IT Helpdesk
- *"Show analytics"* — Go to Analytics
- *"Find employees"* — Open Directory

---

## 🔐 Authentication Flow

```
User → Choose Login Method
         ├── Password → JWT Token → Dashboard
         ├── Face ID  → face-api.js descriptor → Backend compare → JWT
         ├── Fingerprint → WebAuthn → Browser biometric → JWT
         └── Google → OAuth2 → JWT → Dashboard
```

---

## 🧠 ML Models

| Model | Algorithm | Purpose |
|-------|-----------|---------|
| Burnout Prediction | Random Forest | Work-life balance risk |
| Ticket Classifier | TF-IDF + Naive Bayes | Auto-categorize tickets |
| Anomaly Detection | Isolation Forest | Security monitoring |
| Face Recognition | face-api.js (ResNet) | Biometric login |
| Emotion Detection | DeepFace | Wellness monitoring |

---

## 📡 API Endpoints

```
POST /api/auth/signup          — Register account
POST /api/auth/login           — Password login
POST /api/auth/google          — Google OAuth
POST /api/auth/face-login      — Face recognition login
POST /api/auth/register-face   — Store face embeddings
POST /api/auth/register-fingerprint — WebAuthn registration

GET  /api/dashboard/stats      — Personal dashboard stats
GET  /api/employees            — Employee directory
GET  /api/tickets              — All tickets
POST /api/tickets              — Create ticket
GET  /api/hr/my-leaves         — My leave requests
POST /api/hr/apply-leave       — Apply for leave
POST /api/ai/chat              — AI Copilot chat
POST /api/ai/ticket-suggestion — AI ticket help
POST /api/emergency/sos        — Emergency SOS
```

---

## 🎨 Themes

Switch themes from the sidebar:
- ⚡ **Neon AI** — Electric green cyberpunk
- 🌌 **Glass Aurora** — Purple aurora glass
- 🔴 **Cyberpunk** — Red neon dystopia
- 💼 **Corporate** — Enterprise blue
- ❄️ **Arctic** — Clean white minimal

---

## 🏆 Hackathon Demo Flow

1. Open http://localhost:3000
2. Click **"Get Started"** → Sign Up
3. Fill account form → **face camera activates**
4. Blink & move head (liveness check) → 12 samples captured
5. Register fingerprint → **Done!**
6. Log out → Log back in with **Face ID**
7. Dashboard opens → type in AI chat: *"Create IT ticket laptop slow"*
8. AI auto-creates ticket + suggests fix
9. Navigate to Analytics → see ML burnout predictions
10. Press voice button → say *"Open HR portal"*

---

Built with ❤️ for Hackathon 2024 · NEXUS AI Team
