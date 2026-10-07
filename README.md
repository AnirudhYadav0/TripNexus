# ✈️ TripNexus - AI Travel Planner

TripNexus is a modern AI-powered travel planning web application built with React, Vite, Express, Node.js, MongoDB, and Google Gemini AI.

---

## 📁 Repository Structure

```
TripNexus/
├── render.yaml          # Render Blueprint deployment configuration
├── client/
│   ├── client/          # Frontend (Vite + React)
│   └── server/          # Backend (Express + Node.js + MongoDB + Gemini AI)
```

---

## 🚀 Deployment on Render

You can deploy TripNexus on Render using either **Blueprint (Automatic)** or **Manual Setup**.

---

### Option A: Automatic Deployment via Render Blueprint (Recommended)

1. Push your repository to **GitHub**.
2. Log in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** → **Blueprint**.
4. Connect your `TripNexus` GitHub repository.
5. Render will detect `render.yaml` and prompt you for required Environment Variables:
   - `MONGODB_URI`: Your MongoDB connection string.
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
6. Click **Apply**. Render will automatically provision:
   - **Backend Web Service** (`tripnexus-server`)
   - **Frontend Static Site** (`tripnexus-client`) with API URL automatically linked!

---

### Option B: Manual Setup on Render

If you prefer setting up services manually on Render:

#### 1. Backend Service (Web Service)
- Click **New +** → **Web Service**.
- Connect your GitHub repository `TripNexus`.
- Configure settings:
  - **Name**: `tripnexus-server`
  - **Root Directory**: `client/server`
  - **Runtime**: `Node`
  - **Build Command**: `npm install`
  - **Start Command**: `npm start`
- Add **Environment Variables**:
  - `PORT`: `10000`
  - `MONGODB_URI`: `mongodb+srv://...`
  - `JWT_SECRET`: `your_jwt_secret_key`
  - `GEMINI_API_KEY`: `your_gemini_api_key`
- Save and deploy. Copy the backend service URL (e.g., `https://tripnexus-server.onrender.com`).

#### 2. Frontend Service (Static Site)
- Click **New +** → **Static Site**.
- Connect your GitHub repository `TripNexus`.
- Configure settings:
  - **Name**: `tripnexus-client`
  - **Root Directory**: `client/client`
  - **Build Command**: `npm install && npm run build`
  - **Publish Directory**: `dist`
- Add **Rewrite Rule**:
  - **Source**: `/*`
  - **Destination**: `/index.html`
  - **Action**: `Rewrite`
- Add **Environment Variable**:
  - `VITE_API_BASE_URL`: `https://tripnexus-server.onrender.com` (Your backend Render URL from Step 1)
- Save and deploy!

---

## 🔑 Environment Variables Summary

### Server (`client/server/.env`)
| Variable | Description | Example |
| --- | --- | --- |
| `PORT` | Server Port | `5000` or `10000` |
| `MONGODB_URI` | MongoDB Atlas Connection URI | `mongodb+srv://user:pass@cluster.mongodb.net/...` |
| `JWT_SECRET` | Secret key for JWT auth tokens | `your_secret_key` |
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...` |

### Client (`client/client/.env`)
| Variable | Description | Example |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Backend API URL | `https://tripnexus-server.onrender.com` |

---

## 🛠️ Local Development

### 1. Start Backend
```bash
cd client/server
npm install
npm run dev
```

### 2. Start Frontend
```bash
cd client/client
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.
