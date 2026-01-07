# Quick Deployment Checklist

## ✅ What Was Fixed

### Admin Side (studio-admin)
1. ✅ Added CORS headers to allow cross-origin requests
2. ✅ Made all GET API endpoints public (no auth required)
3. ✅ POST/PUT/DELETE still protected with authentication
4. ✅ Added OPTIONS preflight handling
5. ✅ Added ALLOWED_ORIGINS environment variable for security

### Client Side (Shivai-video)
1. ✅ Made API URL configurable with VITE_API_BASE_URL
2. ✅ Better environment variable handling

## 🚀 Deploy Now

### Step 1: Deploy Admin (First!)
```bash
cd studio-admin
```

Set these environment variables in Vercel:
- `MONGODB_URI` - Your MongoDB connection string
- `MONGODB_DB` - Database name (e.g., shivay_studio)
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret
- `JWT_SECRET` - Random secure string
- `ADMIN_EMAIL` - Your admin email
- `ADMIN_PASSWORD` - Your admin password
- `ALLOWED_ORIGINS` - `*` (or your portfolio URL for better security)

Then deploy:
```bash
vercel --prod
```

Copy your admin URL (e.g., `https://shivay-video-admin.vercel.app`)

### Step 2: Deploy Portfolio
```bash
cd Shivai-video
```

Set this environment variable in Vercel:
- `VITE_API_BASE_URL` - `https://your-admin-url.vercel.app/api`

Then deploy:
```bash
vercel --prod
```

## ✨ Test It

Open your portfolio site and check:
1. Hero section loads
2. Services appear
3. Gallery images show
4. Films/testimonials display

Open browser console (F12) and verify:
- No CORS errors
- API calls return 200 status
- Data is displayed correctly

## 🔧 If Still Not Working

1. **Check Network Tab in DevTools**
   - Are requests going to the correct URL?
   - Look for CORS errors
   - Check if Access-Control-Allow-Origin header is present

2. **Verify Environment Variables**
   - In Vercel: Settings → Environment Variables
   - Make sure they're set for "Production"
   - Redeploy if you just added them

3. **Test API Directly**
   ```bash
   curl https://your-admin-url.vercel.app/api/hero
   ```
   Should return data without errors

4. **Force Redeploy**
   ```bash
   vercel --prod --force
   ```

## 📝 Important Notes

- GET requests are now PUBLIC (anyone can read data)
- POST/PUT/DELETE require admin authentication
- Your admin dashboard is still protected
- Change default passwords!
- For better security, set ALLOWED_ORIGINS to your portfolio URL only
