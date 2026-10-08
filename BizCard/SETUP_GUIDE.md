# Business Card Scanner - Setup Guide

## What You Need

1. **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
2. **Google Cloud Account** (free) - [Create here](https://console.cloud.google.com)

## Step 1: Install Node.js Dependencies

Open PowerShell in this folder and run:

```powershell
npm install
```

This will install all required packages (Express, Google Cloud Vision, etc.)

## Step 2: Set Up Google Cloud Vision API

### 2.1 Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Create Project"
3. Name it "BizCard Scanner" and click Create
4. Wait for it to finish (1-2 minutes)

### 2.2 Enable Vision API
1. In the search bar at the top, search for "Vision API"
2. Click on "Cloud Vision API"
3. Click "Enable"

### 2.3 Create a Service Account
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Fill in:
   - Service account name: `bizcard-scanner`
   - Click "Create and Continue"
4. Click "Continue" on the next screens
5. Click "Done"

### 2.4 Create API Key
1. Click on the service account you just created
2. Go to the "Keys" tab
3. Click "Add Key" → "Create new key"
4. Select "JSON" and click "Create"
5. A JSON file will download - **Save it as `credentials.json` in the BizCard folder**

### 2.5 Create .env File
1. In the BizCard folder, create a file named `.env` (copy from .env.example)
2. It should contain:
```
GOOGLE_APPLICATION_CREDENTIALS=credentials.json
PORT=3000
```

## Step 3: Run the App

In PowerShell, run:

```powershell
npm start
```

You'll see:
```
Server running on http://localhost:3000
```

## Step 4: Open the App

Open your browser and go to: **http://localhost:3000**

## How to Use

1. **Upload** a business card image
2. The app **automatically extracts**:
   - Name
   - Designation
   - Company
   - Email
   - Phone numbers
   - Website
3. **Review and edit** the fields
4. **Save** the card
5. View all **saved cards** at the bottom

## Troubleshooting

### "Cannot find module '@google-cloud/vision'"
- Run `npm install` again

### "GOOGLE_APPLICATION_CREDENTIALS not found"
- Make sure `credentials.json` is in the BizCard folder
- Make sure `.env` file exists with correct path

### "Server not running"
- Check if port 3000 is already in use
- Try a different port: change PORT in .env file

### OCR not extracting text
- Make sure Vision API is enabled in Google Cloud Console
- Check that credentials.json has proper permissions

## Need Help?

- Make sure Node.js is installed: `node --version`
- Make sure npm packages installed: `npm list`
- Check Google Cloud Console for API errors

---

**Enjoy scanning business cards! 📇**
