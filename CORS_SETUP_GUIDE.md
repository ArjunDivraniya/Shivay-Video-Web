# CORS Configuration for Production

## Current Setup
- Backend API: `https://shivay-video-admin.vercel.app`
- Local Frontend: `http://localhost:8080`
- Deployed Frontend: `https://shivay-video.vercel.app`

## To Fix CORS on Vercel Dashboard

### Step 1: Go to Vercel Project Settings
1. Open https://vercel.com
2. Go to your `studio-admin` project
3. Click **Settings**

### Step 2: Add Environment Variables
1. Go to **Environment Variables**
2. Add/Update the variable:
   - **Name:** `ALLOWED_ORIGINS`
   - **Value:** `http://localhost:8080,http://localhost:5173,https://shivay-video.vercel.app`
   - **Environment:** Select all (Production, Preview, Development)
3. Click **Save**

### Step 3: Redeploy
1. Go to **Deployments**
2. Click the three dots on the latest deployment
3. Click **Redeploy** (or wait for auto-redeploy)

## What This Does
- ✓ Allows `http://localhost:8080` to fetch from the API
- ✓ Allows `http://localhost:5173` (alternative Vite port) 
- ✓ Allows `https://shivay-video.vercel.app` (production frontend)

## Test After Deployment
```powershell
# Test localhost:8080
$headers = @{ 'Origin' = 'http://localhost:8080' }
Invoke-WebRequest -Uri 'https://shivay-video-admin.vercel.app/api/hero' -Headers $headers

# Test deployed frontend
$headers = @{ 'Origin' = 'https://shivay-video.vercel.app' }
Invoke-WebRequest -Uri 'https://shivay-video-admin.vercel.app/api/hero' -Headers $headers
```

Both should return the origin in the `Access-Control-Allow-Origin` header.
