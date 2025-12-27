# 🎬 Shivay Studio Admin CMS - Complete Guide

## ✅ What's Implemented

### Authentication
- ✅ JWT-based login system
- ✅ Secure password hashing with bcryptjs
- ✅ Protected admin routes with middleware
- ✅ Logout functionality

### Dashboard
- ✅ Real-time stats (stories, photos, videos, featured items)
- ✅ Latest uploads display
- ✅ Quick overview

### Story Manager (Complete CRUD)
- ✅ Create stories with title, event type, location
- ✅ Drag & drop cover image upload to Cloudinary
- ✅ Tag management
- ✅ Mark as featured or homepage
- ✅ Real-time list view with thumbnails
- ✅ Edit and delete functionality

### Gallery Manager (Complete CRUD)
- ✅ Drag & drop media upload (images & videos)
- ✅ Category selection
- ✅ Tag management
- ✅ Homepage visibility toggle
- ✅ Real-time media grid with thumbnails
- ✅ Play button overlay for videos
- ✅ Delete functionality

### Reels Manager (Complete CRUD)
- ✅ Upload cinematic videos
- ✅ Video thumbnail generation
- ✅ Homepage toggle
- ✅ Reel grid with play icon
- ✅ Delete functionality

### Testimonials Manager (Complete CRUD)
- ✅ Create testimonials with client name & quote
- ✅ Optional client image upload
- ✅ Approval workflow
- ✅ Real-time listing
- ✅ Delete functionality

### Section Control (Full Functionality)
- ✅ Configure Hero section
- ✅ Configure Editor's Pick section
- ✅ Configure Latest section
- ✅ Select stories for each section
- ✅ Toggle section enabled/disabled
- ✅ Manage display order

### Settings
- ✅ Set hero story for homepage
- ✅ Manage studio experience years
- ✅ Manage weddings covered count
- ✅ Manage cities served count

### Backend APIs (All Complete)
- ✅ POST /api/auth/login - User login
- ✅ GET /api/auth/me - Get current admin
- ✅ POST /api/auth/logout - Logout
- ✅ POST /api/upload - Upload to Cloudinary
- ✅ POST /api/stories - Create story
- ✅ GET /api/stories - List all stories
- ✅ GET /api/stories/featured - Featured stories
- ✅ PUT /api/stories/:id - Update story
- ✅ DELETE /api/stories/:id - Delete story
- ✅ POST /api/media - Create media
- ✅ GET /api/media - List media
- ✅ PATCH /api/media/:id - Update media
- ✅ DELETE /api/media/:id - Delete media
- ✅ POST /api/reels - Create reel
- ✅ GET /api/reels - List reels
- ✅ PATCH /api/reels/:id - Update reel
- ✅ DELETE /api/reels/:id - Delete reel
- ✅ POST /api/testimonials - Create testimonial
- ✅ GET /api/testimonials - List testimonials
- ✅ PATCH /api/testimonials/:id - Update testimonial
- ✅ DELETE /api/testimonials/:id - Delete testimonial
- ✅ POST /api/sections - Create/update section
- ✅ GET /api/sections - List sections
- ✅ POST /api/settings - Save settings
- ✅ GET /api/settings - Get settings

### UI/UX
- ✅ Brand theme (Ivory, Maroon, Gold, Green palette)
- ✅ Playfair Display for headings, Inter for body
- ✅ Responsive admin layout with sidebar
- ✅ Drag & drop upload areas
- ✅ Real-time data updates
- ✅ Error messages and confirmations
- ✅ Loading states

## 🚀 How to Use

### 1. Login
Visit `http://localhost:3000/login`
- Email: `arjundivraniya8@gmail.com`
- Password: `123456`

### 2. Upload Media
**Gallery Manager:**
- Drag & drop images/videos
- Select category (wedding, pre-wedding, etc.)
- Add tags (comma-separated)
- Toggle "Show on homepage"
- Click Upload

### 3. Create Stories
**Story Manager:**
- Fill in title, event type, location
- Upload cover image (drag & drop)
- Add tags
- Mark as featured or homepage
- Click "Save story"
- See real-time list below

### 4. Manage Reels
**Reels Manager:**
- Upload video file
- Give it a title
- Toggle homepage visibility
- View in reel grid

### 5. Add Testimonials
**Testimonials Manager:**
- Add client name & quote
- Upload client photo (optional)
- Submit
- View and approve testimonials

### 6. Control Sections
**Section Control:**
- Hero: Select stories to appear as hero
- Editor's Pick: Curate featured content
- Latest: Auto-generated or manual
- Drag stories into sections
- Toggle enabled/disabled per section

### 7. Studio Settings
**Settings:**
- Set hero story for homepage
- Update years of experience
- Update weddings covered count
- Update cities served count

## 🔌 API Integration (Portfolio)

Portfolio site can fetch data from these public endpoints:

```javascript
// Get all stories
GET /api/stories

// Get featured stories only
GET /api/stories/featured

// Get all media
GET /api/media

// Get all reels
GET /api/reels

// Get section config
GET /api/sections

// Get testimonials
GET /api/testimonials

// Get settings/stats
GET /api/settings
```

All responses are JSON and cached with proper headers.

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** MongoDB + Mongoose
- **Media:** Cloudinary (CDN storage)
- **Auth:** JWT + httpOnly cookies
- **Styling:** Tailwind CSS v4
- **Fonts:** Playfair Display, Inter
- **Validation:** Zod

## 📦 Environment Variables

```
MONGODB_URI=mongodb+srv://...
MONGODB_DB=shivayvideo
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=deucrairj
CLOUDINARY_API_KEY=664682464975387
CLOUDINARY_API_SECRET=wVW2qMz54Ah6YhjaxxSSyMcIJrM
ADMIN_EMAIL=arjundivraniya8@gmail.com
ADMIN_PASSWORD=123456
```

## 🚀 Deployment

Ready for Vercel:
```bash
npm run build
npm start
```

Set env vars in Vercel dashboard. Admin & Portfolio can be separate deployments pointing to same MongoDB and Cloudinary.

## 🎨 Design System

**Colors:**
- Ivory: #F9F6F1
- Deep Maroon: #6E1F2A
- Royal Gold: #C6A15B
- Muted Green: #355E3B
- Dark Brown: #2E1F1C

**Typography:**
- Headings: Playfair Display (serif)
- Body: Inter (sans-serif)

**Components:**
- Cards: Soft shadows, minimal borders
- Buttons: Primary (maroon), Ghost (text)
- Inputs: Subtle borders, gold focus ring
- Animations: Fade-in on load, no heavy motion
