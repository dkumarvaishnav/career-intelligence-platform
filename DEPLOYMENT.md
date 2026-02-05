# 🚀 Deployment Guide

This guide walks you through deploying the Career Intelligence Platform using **Vercel** (frontend) and **Render** (backend).

## 📋 Prerequisites

- GitHub account with this repo pushed
- [Vercel account](https://vercel.com) (free)
- [Render account](https://render.com) (free)
- Google Gemini API key from [AI Studio](https://aistudio.google.com/app/apikey)

---

## 🎯 Architecture Overview

```
┌─────────────────────┐         ┌─────────────────────┐
│   Vercel (Free)     │         │   Render (Free)     │
│                     │  HTTPS  │                     │
│   Next.js Frontend  │ ◄────── │   FastAPI Backend   │
│   (your-app.vercel) │         │   (your-api.render) │
└─────────────────────┘         └─────────────────────┘
                                         │
                                         ▼
                                ┌─────────────────────┐
                                │   Google Gemini AI  │
                                └─────────────────────┘
```

---

## 🔧 Step 1: Deploy Backend on Render

### 1.1 Create New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repo
4. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `career-intelligence-backend` |
| **Runtime** | `Python` |
| **Build Command** | `pip install -r backend/requirements.txt` |
| **Start Command** | `uvicorn backend.main:app --host 0.0.0.0 --port $PORT` |
| **Plan** | `Free` |

### 1.2 Set Environment Variables

In Render dashboard → **Environment**:

| Key | Value |
|-----|-------|
| `GOOGLE_API_KEY` | Your Gemini API key |
| `PYTHON_VERSION` | `3.11` |
| `FRONTEND_URL` | `https://your-app.vercel.app` (add after Vercel deploy) |

### 1.3 Deploy

Click **Create Web Service**. Wait 2-3 minutes for deployment.

Your backend URL will be: `https://career-intelligence-backend.onrender.com`

### 1.4 Verify

Visit `https://career-intelligence-backend.onrender.com/health`

You should see:
```json
{"status": "ok", "service": "career-intelligence-backend", "version": "1.0.0"}
```

---

## 🎨 Step 2: Deploy Frontend on Vercel

### 2.1 Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repo

### 2.2 Configure Build

Vercel should auto-detect the `vercel.json` config, but verify:

| Setting | Value |
|---------|-------|
| **Framework** | `Next.js` |
| **Root Directory** | `./` (default) |
| **Build Command** | `cd frontend && npm install && npm run build` |
| **Output Directory** | `frontend/.next` |

### 2.3 Set Environment Variables

In **Environment Variables** section:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://career-intelligence-backend.onrender.com` |

⚠️ **Important:** Use your actual Render backend URL from Step 1.3

### 2.4 Deploy

Click **Deploy**. Wait 2-3 minutes.

Your frontend URL will be: `https://your-project.vercel.app`

---

## 🔗 Step 3: Connect Frontend ↔ Backend

### 3.1 Update Render CORS

Go back to Render dashboard → **Environment** and add/update:

| Key | Value |
|-----|-------|
| `FRONTEND_URL` | `https://your-project.vercel.app` |

Click **Save Changes** → Render will auto-redeploy.

---

## ✅ Step 4: Verify Deployment

1. Visit your Vercel URL
2. Upload a test resume
3. Enter a target role
4. Click **Analyze My Readiness**
5. Wait 30-60 seconds for AI analysis

If you see results, congratulations! 🎉

---

## 🐛 Troubleshooting

### "Failed to fetch" Error

**Cause:** CORS blocking or backend not running

**Fix:**
1. Check Render logs for errors
2. Verify `FRONTEND_URL` env var matches your Vercel domain exactly
3. Redeploy Render service

### Analysis Times Out

**Cause:** Render free tier spins down after 15 min inactivity

**Fix:**
1. First request "wakes up" the server (takes 30-60 sec)
2. Click analyze again after 1 minute
3. Consider upgrading to Render Starter ($7/mo) for always-on

### "GOOGLE_API_KEY not found"

**Cause:** Environment variable not set in Render

**Fix:**
1. Go to Render → Environment
2. Add `GOOGLE_API_KEY` with your Gemini key
3. Save and redeploy

---

## 🔐 Security Notes

- Never commit `.env` files (already in `.gitignore`)
- Use Vercel/Render environment variables for secrets
- API keys are never exposed to frontend

---

## 💰 Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Hobby | **Free** |
| Render | Free | **Free** (spins down after 15 min) |
| Render | Starter | $7/month (always on) |
| Google Gemini | Free tier | **Free** (generous limits) |

---

## 🔄 Auto-Deploy on Git Push

Both Vercel and Render auto-deploy when you push to `main`:

```bash
git add .
git commit -m "Update feature"
git push origin main
# → Vercel auto-deploys frontend
# → Render auto-deploys backend
```

---

## 📧 Need Help?

Open an issue on GitHub if you encounter problems not covered here.
