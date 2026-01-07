# 🚀 Vercel Deployment Fix Guide

## ✅ Problem Fixed

The deployment was failing because `vercel.json` files were referencing Vercel Secrets using `@secret_name` syntax, but those secrets didn't exist.

**Changes made:**
- ✅ Removed secret references from [Shivai-video/vercel.json](Shivai-video/vercel.json)
- ✅ Removed secret references from [studio-admin/vercel.json](studio-admin/vercel.json)

Now you need to add environment variables directly in Vercel Dashboard.

---

## 📋 Step-by-Step Deployment

### Step 1: Commit and Push Changes

```bash
git add .
git commit -m "fix: remove Vercel secret references from vercel.json"
git push
```

### Step 2: Configure Frontend Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **shivay-video** (frontend) project
3. Go to **Settings** → **Environment Variables**
4. Add the following variable:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_API_BASE_URL` | `https://shivay-video-admin.vercel.app/api` | Production, Preview, Development |

5. Click **Save**

### Step 3: Configure Backend Environment Variables

1. In Vercel Dashboard, select your **shivay-video-admin** (backend) project
2. Go to **Settings** → **Environment Variables**
3. Add ALL of the following variables:

| Name | Value | Environment |
|------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://arjundivraniyacg_db_user:IjK8cuYJ8CaOw483@shivayvideo.p5loizb.mongodb.net/` | Production, Preview, Development |
| `MONGODB_DB` | `shivayvideo` | Production, Preview, Development |
| `JWT_SECRET` | `your_jwt_secret_here` | Production, Preview, Development |
| `CLOUDINARY_CLOUD_NAME` | `deucrairj` | Production, Preview, Development |
| `CLOUDINARY_API_KEY` | `664682464975387` | Production, Preview, Development |
| `CLOUDINARY_API_SECRET` | `wVW2qMz54Ah6YhjaxxSSyMcIJrM` | Production, Preview, Development |
| `ADMIN_EMAIL` | `shivay@admin.com` | Production, Preview, Development |
| `ADMIN_PASSWORD` | `Shiay@2801` | Production, Preview, Development |
| `NEXT_PUBLIC_FRONTEND_URL` | `https://shivay-video.vercel.app` | Production, Preview, Development |

4. Click **Save** after each variable

### Step 4: Trigger Redeployment

After adding all environment variables, you need to redeploy:

**Option A - From Vercel Dashboard:**
1. Go to **Deployments** tab
2. Click the **⋮** menu on the latest deployment
3. Click **Redeploy**

**Option B - Push a New Commit:**
The changes to `vercel.json` will automatically trigger a new deployment when you push.

---

## 🔍 Verify Deployment

### Check Frontend:
1. Visit: `https://shivay-video.vercel.app`
2. Open Browser DevTools → Console
3. Should see: `Current API URL: https://shivay-video-admin.vercel.app/api`
4. No CORS errors should appear

### Check Backend:
1. Visit: `https://shivay-video-admin.vercel.app/api/hero`
2. Should return JSON data (not error)
3. Response headers should include CORS headers

---

## 🛠️ Quick Add Environment Variables (Copy-Paste)

### For Backend (studio-admin):

```
MONGODB_URI=mongodb+srv://arjundivraniyacg_db_user:IjK8cuYJ8CaOw483@shivayvideo.p5loizb.mongodb.net/
MONGODB_DB=shivayvideo
JWT_SECRET=your_jwt_secret_here
CLOUDINARY_CLOUD_NAME=deucrairj
CLOUDINARY_API_KEY=664682464975387
CLOUDINARY_API_SECRET=wVW2qMz54Ah6YhjaxxSSyMcIJrM
ADMIN_EMAIL=shivay@admin.com
ADMIN_PASSWORD=Shiay@2801
NEXT_PUBLIC_FRONTEND_URL=https://shivay-video.vercel.app
```

### For Frontend (shivay-video):

```
VITE_API_BASE_URL=https://shivay-video-admin.vercel.app/api
```

---

## ⚠️ Important Notes

1. **Select All Environments**: When adding each variable, make sure to select all three checkboxes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

2. **Must Redeploy**: Environment variable changes require a redeployment to take effect.

3. **No Secrets Needed**: We're using direct environment variables, NOT Vercel Secrets. This is simpler and works perfectly for this project.

4. **JWT_SECRET**: Change `your_jwt_secret_here` to a strong random string before production use!

---

## ✅ Expected Result

After following these steps:
- ✅ Both deployments should succeed
- ✅ No CORS errors
- ✅ Frontend can fetch data from backend
- ✅ All API endpoints work
- ✅ Admin login works

---

## 🐛 Troubleshooting

### Deployment still failing?
- Check Vercel deployment logs for specific errors
- Verify all environment variables are spelled correctly
- Make sure MongoDB URI is complete and valid

### CORS errors persist?
- Verify `NEXT_PUBLIC_FRONTEND_URL` matches your frontend URL exactly
- Check browser console for the actual error message
- Clear browser cache and hard refresh (Ctrl+Shift+R)

### Can't login to admin?
- Verify `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set correctly
- Check `JWT_SECRET` is set
- Look at Vercel function logs for authentication errors
