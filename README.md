# API Checker (KhansCreations)

A mobile-friendly API validation app with:
- Base URL selector (+ custom URL)
- API path input (default: `/chat/completions`)
- Bearer token input
- Model auto-detect + model selector + manual model input
- Loading overlay
- Green success popup (`Live / Valid`)
- Full-screen red error panel with error code + reason

---

## Project Structure

```bash
api-checker/
├─ public/
│  └─ index.html
├─ server.js
├─ server_addition.js
├─ package.json
└─ README.md
```

---

## Local Run

### 1) Install
```bash
npm install
```

### 2) Start
```bash
npm run dev
```

Open:
- `http://localhost:3000`

If port `3000` is busy:

**PowerShell**
```powershell
$env:PORT=3001
npm run dev
```

Then open:
- `http://localhost:3001`

---

## How It Works

- Frontend calls backend endpoint: `POST /api/check`
- Backend sends request to your target API with optional Bearer token
- For `/chat/completions`, backend auto-builds a minimal POST body when model is provided
- Model detect endpoint: `POST /api/detect-models`
  - Tries common model-list routes (`/models`, `/v1/models`, etc.)
  - Returns detected model IDs for dropdown selection

---

## GitHub Setup

### 1) Initialize and push
```bash
git init
git add .
git commit -m "Initial API Checker"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

### 2) Recommended `.gitignore`
Create `.gitignore` (included in this project) so `node_modules` is not pushed.

---

## Deploy from GitHub

### Option A: Render (recommended)
1. Push project to GitHub
2. Render → New Web Service → connect repo
3. Settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: `Node`
4. Deploy

### Option B: Railway
1. New Project → Deploy from GitHub repo
2. Railway auto-detects Node app
3. Start command: `npm start`

### Option C: VPS / self-host
```bash
npm install
npm start
```
Use Nginx reverse proxy + PM2 for production.

---

## Production Notes

- Never commit real API keys/tokens
- Use HTTPS in production
- Add rate limit + auth if you expose this publicly
- Add monitoring/logging for uptime

---

## Branding

Footer text:
- `A product by @KhansCreations`

---

Built for fast API validity checks and model discovery.
