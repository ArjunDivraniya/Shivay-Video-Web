# Shivay Studio Admin - Upload & Database Integration Guide

## Setup Instructions

### 1. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB=shivay_studio

# Cloudinary Configuration (Get from https://cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT Secret (generate a random string)
JWT_SECRET=your_secure_random_string_here

# Admin Credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=changeme123
```

### 2. Required Services

#### MongoDB Atlas Setup
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Create a database user
4. Get connection string and add to `MONGODB_URI`

#### Cloudinary Setup
1. Sign up at https://cloudinary.com
2. Go to Dashboard → Settings
3. Copy Cloud Name, API Key, API Secret
4. Create folders in Cloudinary: `shivay-studio/media`, `shivay-studio/reels`, `shivay-studio/stories`, `shivay-studio/testimonials`

### 3. Installation & Running

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

Visit `http://localhost:3000` and log in with your admin credentials.

## Features

### ✅ Media Manager (`/admin/media`)
- **Drag & drop upload** to Cloudinary
- Image & video support
- Categories: Wedding, Engagement, Pre-Wedding, Events
- Tagging system
- Homepage visibility toggle
- Real-time gallery grid
- Delete with Cloudinary cleanup

### ✅ Reel Manager (`/admin/reels`)
- Video upload with auto-thumbnails
- Title management
- Homepage toggle
- Video grid display
- Delete functionality

### ✅ Story Manager (`/admin/stories`)
- Create wedding/event stories
- Drag & drop cover image upload
- Event type & location tracking
- Tags system
- Featured & homepage toggles
- Story cards with cover images
- Delete with confirmation

### ✅ Testimonial Manager (`/admin/testimonials`)
- Client testimonial collection
- Approval workflow (Pending/Approved)
- Optional client photo upload
- Bulk action buttons
- Visual status indicators
- Delete functionality

## API Endpoints

### Media
- `GET /api/media` - List all media
- `POST /api/media` - Create media entry
- `PATCH /api/media/[id]` - Update media
- `DELETE /api/media/[id]` - Delete media

### Reels
- `GET /api/reels` - List all reels
- `POST /api/reels` - Create reel
- `PATCH /api/reels/[id]` - Update reel
- `DELETE /api/reels/[id]` - Delete reel

### Stories
- `GET /api/stories` - List all stories
- `POST /api/stories` - Create story
- `PUT /api/stories/[id]` - Update story
- `DELETE /api/stories/[id]` - Delete story

### Testimonials
- `GET /api/testimonials` - List all testimonials
- `POST /api/testimonials` - Create testimonial
- `PATCH /api/testimonials/[id]` - Update testimonial
- `DELETE /api/testimonials/[id]` - Delete testimonial

### Upload
- `POST /api/upload` - Upload file to Cloudinary
  - Accepts: image/*, video/*
  - Returns: `{ secure_url, public_id, thumbnail_url, eager }`

## Database Models

### Media
```typescript
{
  type: "image" | "video",
  category: string,
  url: string,
  publicId: string,
  thumbnail?: string,
  tags: string[],
  isHomepage: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Reel
```typescript
{
  title: string,
  videoUrl: string,
  publicId: string,
  thumbnail?: string,
  showOnHomepage: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Story
```typescript
{
  title: string,
  eventType: string,
  location: string,
  coverImage: { url: string, publicId: string },
  gallery: { url: string, publicId: string, type: "image" }[],
  videos: { url: string, publicId: string, type: "video" }[],
  tags: string[],
  isFeatured: boolean,
  showOnHomepage: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Testimonial
```typescript
{
  clientName: string,
  quote: string,
  image?: { url: string, publicId: string },
  approved: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Troubleshooting

### Upload Fails
1. Check Cloudinary credentials in `.env.local`
2. Verify Cloudinary account is active
3. Check file size limits (default 100MB for Cloudinary)
4. Ensure folder structure exists in Cloudinary

### Database Connection Issues
1. Verify MongoDB URI is correct
2. Add your IP to MongoDB Atlas whitelist
3. Check database user has proper permissions
4. Verify `MONGODB_DB` name matches created database

### Authentication Issues
1. JWT_SECRET must be set
2. Admin credentials in `.env.local` are used on first login
3. Clear cookies and try again if stuck on login

## Real-Time Updates

All pages automatically:
- Fetch latest data on page load
- Refresh list after create/update/delete
- Show success/error messages
- Update UI optimistically where applicable

## Development Notes

- Built with Next.js 16 & React 19
- TypeScript for type safety
- Tailwind CSS for styling
- MongoDB with Mongoose ORM
- JWT authentication
- Cloudinary for media hosting
- Real-time validation with Zod

## Next Steps

1. Set up auth login page at `/login`
2. Connect portfolio frontend to these APIs
3. Add admin dashboard analytics
4. Implement sections management
5. Add settings management for studio info
