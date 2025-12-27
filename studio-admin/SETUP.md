# Admin CMS – Setup Guide

## Environment Variables
Create `.env.local` in the project root:

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/
MONGODB_DB=shivay-studio
JWT_SECRET=your_super_secret_jwt_key_change_in_production
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
ADMIN_EMAIL=admin@shivay.com
ADMIN_PASSWORD=admin123
```

## First-Time Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Admin User
```bash
npx ts-node scripts/seed.ts
```

This creates an admin account with credentials from env (default: `admin@shivay.com` / `admin123`).

### 3. Run Dev Server
```bash
npm run dev
```

Visit `http://localhost:3000/login` and sign in.

## API Endpoints

### Public (GET only)
- `GET /api/stories` – All stories
- `GET /api/stories/featured` – Featured only
- `GET /api/media` – All media
- `GET /api/reels` – All reels
- `GET /api/sections` – Section config
- `GET /api/testimonials` – All testimonials

### Admin Protected
- `POST /api/auth/login` – Login
- `GET /api/auth/me` – Current user
- `POST /api/stories` – Create story
- `PUT /api/stories/:id` – Update story
- `DELETE /api/stories/:id` – Delete story
- (Similar for media, reels, sections, testimonials)

## Features Implemented
✓ JWT auth + middleware protection
✓ MongoDB models & schemas
✓ Login page + dashboard
✓ Story manager with creation form
✓ Skeleton pages for other sections
✓ Brand theme (Ivory, Maroon, Gold, Green)

## Next Steps
1. Connect Cloudinary upload widgets
2. Implement drag-drop for media
3. Add edit/delete flows
4. Build reels & sections UIs
5. Deploy to Vercel
