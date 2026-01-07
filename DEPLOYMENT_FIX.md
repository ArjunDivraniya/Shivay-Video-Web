# DEPLOYMENT FIX - API CORS & Authentication

## Problem
The portfolio site couldn't fetch data from the admin API when deployed because:
1. **Missing CORS headers** - The admin API didn't allow cross-origin requests
2. **Authentication blocking public reads** - All API routes required authentication
3. **No public GET endpoints** - The portfolio site needs read-only access

## What Was Fixed

### 1. middleware.ts (Admin Side)
- ✅ Added CORS headers to all responses
- ✅ Made GET requests public for read-only data
- ✅ Keep POST/PUT/DELETE protected with authentication
- ✅ Handle OPTIONS preflight requests
- ✅ Support environment-based origin whitelisting

### 2. api.ts (Client Side)
- ✅ Made API URL configurable via environment variable
- ✅ Better fallback handling for dev/production

### 3. Environment Variables
Created proper .env.example files for configuration

## Deployment Steps

### For Admin Site (studio-admin)

1. **Set Environment Variables in Vercel/Netlify:**
   ```bash
   MONGODB_URI=mongodb+srv://your-connection-string
   MONGODB_DB=shivay_studio
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   JWT_SECRET=your-secure-jwt-secret
   ADMIN_EMAIL=your@email.com
   ADMIN_PASSWORD=your-secure-password
   ALLOWED_ORIGINS=https://your-portfolio-site.vercel.app,http://localhost:8080
   ```

2. **Deploy the admin site** to Vercel:
   ```bash
   cd studio-admin
   vercel --prod
   ```

3. **Note your admin URL** (e.g., `https://shivay-video-admin.vercel.app`)

### For Portfolio Site (Shivai-video)

1. **Set Environment Variables in Vercel/Netlify:**
   ```bash
   VITE_API_BASE_URL=https://shivay-video-admin.vercel.app/api
   ```

2. **Deploy the portfolio site**:
   ```bash
   cd Shivai-video
   vercel --prod
   ```

## Testing

### Test API Endpoints
After deployment, test if the API is accessible:

```bash
# Test from browser console or terminal
curl https://shivay-video-admin.vercel.app/api/hero
curl https://shivay-video-admin.vercel.app/api/services
curl https://shivay-video-admin.vercel.app/api/gallery
```

All GET requests should work without authentication.

### What's Public vs Protected

**Public (No Auth Required):**
- ✅ GET /api/hero
- ✅ GET /api/services
- ✅ GET /api/gallery
- ✅ GET /api/films
- ✅ GET /api/testimonials
- ✅ GET /api/weddings
- ✅ GET /api/stories
- ✅ GET /api/about
- ✅ GET /api/reviews
- ✅ GET /api/sections
- ✅ GET /api/settings

**Protected (Auth Required):**
- 🔒 POST /api/* (create)
- 🔒 PUT /api/* (update)
- 🔒 DELETE /api/* (delete)
- 🔒 All admin dashboard pages

## Troubleshooting

### Still not working after deployment?

1. **Check CORS in browser console**
   - Open browser DevTools → Network tab
   - Look for CORS errors
   - Verify `Access-Control-Allow-Origin` header is present

2. **Verify environment variables**
   ```bash
   # In Vercel dashboard: Settings → Environment Variables
   # Make sure ALLOWED_ORIGINS includes your portfolio URL
   ```

3. **Check API URL**
   - In your portfolio site, check the Network tab
   - Verify requests go to correct URL
   - Should be: `https://shivay-video-admin.vercel.app/api/*`

4. **Redeploy both sites**
   ```bash
   # Sometimes environment variables need a redeploy
   vercel --prod --force
   ```

5. **Test API directly**
   ```bash
   # Test if API responds
   curl -v https://shivay-video-admin.vercel.app/api/hero
   
   # Should see CORS headers in response:
   # Access-Control-Allow-Origin: *
   ```

## Security Notes

- GET endpoints are public (read-only)
- POST/PUT/DELETE still require authentication
- Admin dashboard requires login
- Use ALLOWED_ORIGINS to restrict which sites can access your API
- Change default passwords in production!

## Local Development

For local development, both sites work together:

1. **Start Admin (Port 3000)**:
   ```bash
   cd studio-admin
   npm run dev
   ```

2. **Start Portfolio (Port 8080)**:
   ```bash
   cd Shivai-video
   npm run dev
   ```

The Vite proxy automatically forwards `/api` requests to the admin site.
