# CORS Configuration Guide

## Problem
When deploying your frontend and backend on different domains, browsers block requests due to CORS (Cross-Origin Resource Sharing) policy.

## Solution Implemented

### 1. CORS Utility Function
Created `/studio-admin/src/lib/cors.ts` with helper functions to add CORS headers to all API responses.

### 2. Next.js Config
Updated `/studio-admin/next.config.ts` to add CORS headers globally to all `/api/*` routes.

### 3. API Routes
Updated all API route handlers to:
- Handle OPTIONS preflight requests
- Include CORS headers in responses
- Support requests from allowed origins

## Environment Variables

### Studio Admin (Backend) - Add to Vercel
In your Vercel project for `studio-admin`, add:

```
NEXT_PUBLIC_FRONTEND_URL=https://shivay-video.vercel.app
```

### Shivai Video (Frontend) - Already configured
Your frontend already uses:

```
VITE_API_BASE_URL=https://shivay-video-admin.vercel.app/api
```

## Deployment Steps

1. **Deploy Backend First:**
   ```bash
   cd studio-admin
   vercel --prod
   ```

2. **Add Environment Variable in Vercel:**
   - Go to Vercel Dashboard → Your studio-admin project
   - Go to Settings → Environment Variables
   - Add: `NEXT_PUBLIC_FRONTEND_URL` = `https://shivay-video.vercel.app`
   - Redeploy to apply changes

3. **Deploy Frontend:**
   ```bash
   cd Shivai-video
   vercel --prod
   ```

## How It Works

1. **Browser sends OPTIONS request** (preflight check)
   - Backend responds with CORS headers allowing the frontend domain

2. **Browser sends actual request** (GET, POST, etc.)
   - Backend includes CORS headers in response
   - Browser allows frontend to read the response

## Allowed Origins
The backend allows requests from:
- `http://localhost:5173` (frontend dev)
- `http://localhost:3000` (backend dev)
- `https://shivay-video.vercel.app` (production frontend)
- Any custom domain set in `NEXT_PUBLIC_FRONTEND_URL`

## Testing
After deployment:
1. Open browser DevTools → Network tab
2. Visit your frontend: `https://shivay-video.vercel.app`
3. Check API requests - they should now succeed
4. Response headers should include:
   - `Access-Control-Allow-Origin`
   - `Access-Control-Allow-Methods`
   - `Access-Control-Allow-Headers`

## Troubleshooting

### Still getting CORS errors?
1. Verify environment variable is set in Vercel
2. Redeploy after adding environment variable
3. Clear browser cache
4. Check Network tab for preflight OPTIONS requests

### API not responding?
1. Check MongoDB connection string
2. Verify Cloudinary credentials
3. Check Vercel function logs
