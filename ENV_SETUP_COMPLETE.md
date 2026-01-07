# Environment Variables Setup Guide

## ✅ All Environment Variables Configured

### 📁 Studio Admin (Backend) - `/studio-admin/.env`

All required variables are set:

1. **MONGODB_URI** ✅
   - MongoDB connection string
   - Currently: `mongodb+srv://arjundivraniyacg_db_user:...@shivayvideo.p5loizb.mongodb.net/`

2. **MONGODB_DB** ✅
   - Database name
   - Currently: `shivayvideo`

3. **JWT_SECRET** ✅
   - Secret key for JWT token generation
   - Currently: `your_jwt_secret_here`
   - ⚠️ **IMPORTANT**: Change this to a strong random string in production!

4. **CLOUDINARY_CLOUD_NAME** ✅
   - Cloudinary cloud name
   - Currently: `deucrairj`

5. **CLOUDINARY_API_KEY** ✅
   - Cloudinary API key
   - Currently: `664682464975387`

6. **CLOUDINARY_API_SECRET** ✅
   - Cloudinary API secret
   - Currently: `wVW2qMz54Ah6YhjaxxSSyMcIJrM`

7. **ADMIN_EMAIL** ✅
   - Admin login email
   - Currently: `shivay@admin.com`

8. **ADMIN_PASSWORD** ✅
   - Admin login password
   - Currently: `Shiay@2801`

9. **NEXT_PUBLIC_FRONTEND_URL** ✅
   - Frontend URL for CORS
   - Currently: `https://shivay-video.vercel.app`

---

### 📁 Shivai Video (Frontend) - `/Shivai-video/.env`

All required variables are set:

1. **VITE_API_BASE_URL** ✅
   - Backend API URL
   - Currently: `https://shivay-video-admin.vercel.app/api`

---

## 🚀 Deployment Checklist

### For Vercel Deployment:

#### Backend (studio-admin):
1. Go to Vercel Dashboard → studio-admin project
2. Settings → Environment Variables
3. Add all variables from `/studio-admin/.env`:
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
4. Deploy/Redeploy

#### Frontend (Shivai-video):
1. Go to Vercel Dashboard → Shivai-video project
2. Settings → Environment Variables
3. Add:
   ```
   VITE_API_BASE_URL=https://shivay-video-admin.vercel.app/api
   ```
4. Deploy/Redeploy

---

## ⚠️ Security Recommendations

### Before going to production:

1. **Change JWT_SECRET** to a strong random string:
   ```bash
   # Generate a secure random string
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Use strong ADMIN_PASSWORD**:
   - At least 12 characters
   - Mix of uppercase, lowercase, numbers, and symbols

3. **Keep .env files secure**:
   - Never commit to Git (already in .gitignore)
   - Only store sensitive values in Vercel environment variables
   - Use different credentials for development and production

4. **MongoDB Security**:
   - Restrict IP access in MongoDB Atlas
   - Use strong database password
   - Enable database auditing

5. **Cloudinary Security**:
   - Enable signed uploads in production
   - Restrict API access by IP if possible
   - Monitor usage regularly

---

## 🔧 Local Development

Both .env files are now configured for local development:

### Run Backend:
```bash
cd studio-admin
npm install
npm run dev
```

### Run Frontend:
```bash
cd Shivai-video
npm install
npm run dev
```

---

## 📝 Notes

- All environment variables are properly configured ✅
- CORS is configured to allow requests from frontend ✅
- Both local and production setups are ready ✅
- Remember to update Vercel environment variables after local changes ⚠️
