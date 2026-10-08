# Deploy to Vercel - Complete Guide

## Prerequisites

1. **GitHub Account** - [Create here](https://github.com/signup)
2. **Vercel Account** - [Create here](https://vercel.com/signup)
3. **Google Cloud Credentials** - Already have from setup

## Step 1: Push to GitHub

### 1.1 Create a GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Name it: `bizcard-scanner`
3. Click "Create repository"
4. Copy the commands shown

### 1.2 Push Code to GitHub

In PowerShell in your BizCard folder:

```powershell
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bizcard-scanner.git
git push -u origin main
```

## Step 2: Deploy to Vercel

### 2.1 Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Click "Import Git Repository"
4. Paste your GitHub URL: `https://github.com/YOUR_USERNAME/bizcard-scanner`
5. Click "Import"

### 2.2 Configure Environment Variables

In Vercel, go to **Settings** → **Environment Variables**

Add the following (from your credentials.json):

```
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_PRIVATE_KEY_ID=your-key-id
GOOGLE_PRIVATE_KEY=your-private-key
GOOGLE_CLIENT_EMAIL=your-client-email
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_CERT_URL=your-cert-url
```

**To get these values:**
1. Open `credentials.json` (downloaded from Google Cloud)
2. Copy each field value into Vercel

### 2.3 Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for deployment to complete
3. You'll get a URL like: `https://bizcard-scanner.vercel.app`

## Step 3: How to Get Google Cloud Credentials

If you don't have credentials.json yet:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a service account (see SETUP_GUIDE.md step 2.3-2.4)
3. Download credentials.json
4. Open it in a text editor and copy the values for Vercel

## Using Your Deployed App

After deployment:
- Visit your Vercel URL
- Upload business card images
- The app will extract text automatically
- Save and manage your cards

## Troubleshooting

### "Missing Environment Variables"
- Make sure all 6 Google Cloud variables are set in Vercel Settings
- Redeploy after adding variables

### "API Error: Cannot authenticate"
- Check that credentials are correct
- Make sure Vision API is enabled in Google Cloud Console

### "File too large"
- Vercel has file size limits
- Compress images before uploading (< 5MB)

## Update Your App

When you make changes:

```powershell
git add .
git commit -m "Update description"
git push
```

Vercel will automatically redeploy!

---

**Your app is now live on Vercel! 🚀**
