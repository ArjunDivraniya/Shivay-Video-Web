# ✅ Deployment Checklist

Use this checklist to ensure successful deployment of both admin and portfolio sites.

## Pre-Deployment

### Prepare Environment Variables

#### Admin Site Environment Variables
```bash
[ ] MONGODB_URI - Your MongoDB connection string
[ ] MONGODB_DB - Database name (e.g., shivay_studio)
[ ] CLOUDINARY_CLOUD_NAME - From Cloudinary dashboard
[ ] CLOUDINARY_API_KEY - From Cloudinary dashboard
[ ] CLOUDINARY_API_SECRET - From Cloudinary dashboard
[ ] JWT_SECRET - Random secure string (e.g., openssl rand -base64 32)
[ ] ADMIN_EMAIL - Your admin login email
[ ] ADMIN_PASSWORD - Strong password for admin login
[ ] ALLOWED_ORIGINS - "*" or your portfolio URL
```

#### Portfolio Site Environment Variables
```bash
[ ] VITE_API_BASE_URL - Your admin API URL (set after admin deployment)
```

## Step 1: Deploy Admin Site

### Using Vercel Dashboard
```bash
[ ] Go to vercel.com and login
[ ] Click "Add New Project"
[ ] Import your repository
[ ] Set Root Directory to: studio-admin
[ ] Click "Environment Variables"
[ ] Add all admin environment variables (see above)
[ ] Click "Deploy"
[ ] Wait for deployment to complete
[ ] Copy the deployment URL (e.g., https://shivay-video-admin.vercel.app)
```

### Using Vercel CLI
```bash
[ ] cd studio-admin
[ ] npm install
[ ] vercel
[ ] Follow prompts
[ ] Add environment variables via Vercel dashboard
[ ] vercel --prod
[ ] Copy the deployment URL
```

### Verify Admin Deployment
```bash
[ ] Open admin URL in browser
[ ] Should see login page
[ ] Login with ADMIN_EMAIL and ADMIN_PASSWORD
[ ] Verify dashboard loads
[ ] Test uploading an image
[ ] Test creating a service/film
```

### Test Admin API
```bash
[ ] curl https://your-admin-url.vercel.app/api/hero
[ ] curl https://your-admin-url.vercel.app/api/services
[ ] curl https://your-admin-url.vercel.app/api/gallery
[ ] All should return JSON data
[ ] No CORS errors
[ ] No authentication errors
```

## Step 2: Deploy Portfolio Site

### Using Vercel Dashboard
```bash
[ ] Go to vercel.com
[ ] Click "Add New Project"
[ ] Import your repository (can be same or different)
[ ] Set Root Directory to: Shivai-video
[ ] Click "Environment Variables"
[ ] Add: VITE_API_BASE_URL=https://your-admin-url.vercel.app/api
[ ] Replace "your-admin-url" with actual URL from Step 1
[ ] Click "Deploy"
[ ] Wait for deployment to complete
```

### Using Vercel CLI
```bash
[ ] cd Shivai-video
[ ] npm install
[ ] vercel
[ ] Follow prompts
[ ] Add VITE_API_BASE_URL via Vercel dashboard
[ ] vercel --prod
```

### Verify Portfolio Deployment
```bash
[ ] Open portfolio URL in browser
[ ] Hero section displays correctly
[ ] Services section shows service cards
[ ] Gallery section shows images
[ ] Films section displays videos
[ ] Testimonials section shows reviews
[ ] About section displays stats
[ ] Contact section works
```

## Step 3: Browser Testing

### Open Browser DevTools (F12)

#### Console Tab
```bash
[ ] No CORS errors
[ ] No 401 Unauthorized errors
[ ] No fetch errors
[ ] No JavaScript errors
```

#### Network Tab
```bash
[ ] Filter by "api"
[ ] All API calls show 200 status
[ ] Responses contain data
[ ] CORS headers present (Access-Control-Allow-Origin)
[ ] No failed requests
```

#### Application Tab
```bash
[ ] Images load correctly
[ ] No broken image icons
[ ] Cloudinary images accessible
```

## Step 4: Functionality Testing

### Portfolio Site
```bash
[ ] Hero section - Image and text display
[ ] Services section - All service cards visible
[ ] Gallery section - Images load and grid works
[ ] Films section - Videos display correctly
[ ] Testimonials section - Reviews show properly
[ ] About section - Stats and images display
[ ] Contact section - Form is visible
[ ] Navigation - All links work
[ ] Responsive design - Mobile view works
[ ] Performance - Page loads quickly
```

### Admin Dashboard
```bash
[ ] Login page - Can login successfully
[ ] Dashboard - Shows overview
[ ] Hero upload - Can upload/change hero image
[ ] Services - Can create/edit/delete services
[ ] Gallery - Can upload/manage photos
[ ] Films - Can upload/manage videos
[ ] Testimonials - Can create/edit reviews
[ ] About - Can update stats
[ ] Logout - Can logout successfully
```

## Step 5: API Endpoint Testing

### Public Endpoints (Should work without auth)
```bash
[ ] GET /api/hero
[ ] GET /api/services
[ ] GET /api/gallery
[ ] GET /api/films
[ ] GET /api/testimonials
[ ] GET /api/about
[ ] GET /api/weddings
[ ] GET /api/stories
[ ] GET /api/reviews
[ ] GET /api/sections
[ ] GET /api/settings
```

### Protected Endpoints (Should require auth)
```bash
[ ] POST /api/services - Returns 401 without token
[ ] PUT /api/services/123 - Returns 401 without token
[ ] DELETE /api/films/456 - Returns 401 without token
[ ] POST works when logged in as admin
[ ] PUT works when logged in as admin
[ ] DELETE works when logged in as admin
```

## Step 6: Security Verification

### Environment Variables
```bash
[ ] No sensitive data in code
[ ] All secrets in environment variables
[ ] Environment variables set in Vercel
[ ] JWT_SECRET is strong and random
[ ] ADMIN_PASSWORD is strong
```

### CORS Configuration
```bash
[ ] CORS headers present on API responses
[ ] ALLOWED_ORIGINS configured correctly
[ ] Only necessary origins allowed
```

### Authentication
```bash
[ ] Admin dashboard requires login
[ ] Invalid credentials rejected
[ ] Logout works correctly
[ ] Session expires appropriately
[ ] Protected routes not accessible without auth
```

## Step 7: Performance & SEO

### Performance
```bash
[ ] Images optimized
[ ] Page loads in < 3 seconds
[ ] No console errors
[ ] No memory leaks
[ ] Smooth animations
```

### SEO
```bash
[ ] Meta tags present
[ ] Title tags set
[ ] Description tags set
[ ] Open Graph tags set
[ ] Images have alt text
```

## Step 8: Final Checks

### Documentation
```bash
[ ] README.md updated
[ ] Environment variables documented
[ ] Deployment steps documented
[ ] API endpoints documented
```

### Monitoring
```bash
[ ] Vercel analytics enabled
[ ] Error tracking configured
[ ] Performance monitoring active
```

### Backup
```bash
[ ] Database backed up
[ ] Environment variables saved securely
[ ] Code committed to Git
[ ] Deployment URLs documented
```

## Troubleshooting Checklist

### If Portfolio Shows No Data
```bash
[ ] Check VITE_API_BASE_URL is set correctly
[ ] Verify admin API URL is accessible
[ ] Check browser console for errors
[ ] Verify Network tab shows API calls
[ ] Test API endpoints directly with curl
[ ] Check CORS headers are present
```

### If Admin Dashboard Won't Load
```bash
[ ] Check all environment variables are set
[ ] Verify MONGODB_URI is correct
[ ] Check JWT_SECRET is set
[ ] Verify CLOUDINARY credentials
[ ] Check Vercel function logs
[ ] Test database connection
```

### If Images Won't Upload
```bash
[ ] Verify Cloudinary credentials
[ ] Check CLOUDINARY_API_KEY is correct
[ ] Check CLOUDINARY_API_SECRET is correct
[ ] Check CLOUDINARY_CLOUD_NAME is correct
[ ] Verify upload preset if using unsigned uploads
```

### If CORS Errors Appear
```bash
[ ] Verify middleware.ts changes deployed
[ ] Check Access-Control-Allow-Origin header
[ ] Verify ALLOWED_ORIGINS environment variable
[ ] Force redeploy admin site
[ ] Clear browser cache
```

## Success Criteria

### Must Have (Critical)
```bash
✅ Admin site deployed and accessible
✅ Portfolio site deployed and accessible
✅ Data flows from admin to portfolio
✅ No CORS errors
✅ No authentication errors on public endpoints
✅ Admin can login and manage content
✅ All sections display correctly
```

### Should Have (Important)
```bash
✅ Images load quickly
✅ Videos play correctly
✅ Forms work properly
✅ Mobile responsive
✅ Performance is good
```

### Nice to Have (Optional)
```bash
✅ Custom domain configured
✅ SSL/HTTPS enabled
✅ Analytics tracking
✅ Error monitoring
✅ Performance monitoring
```

---

## 🎉 Deployment Complete!

Once all items are checked, your deployment is successful!

**Next Steps:**
1. Monitor Vercel dashboard for any issues
2. Check analytics regularly
3. Keep dependencies updated
4. Regular backups of database
5. Update content through admin dashboard

**Need Help?**
- Review [SUMMARY.md](./SUMMARY.md)
- Check [TROUBLESHOOTING.md](./ROOT_CAUSE_ANALYSIS.md)
- Read [ARCHITECTURE.md](./ARCHITECTURE.md)
