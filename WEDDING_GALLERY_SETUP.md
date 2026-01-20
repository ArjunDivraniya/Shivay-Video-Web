# Wedding Gallery Implementation

## Overview
A separate, database-driven gallery section specifically for wedding and prewedding photos. This is independent from the main Photo Gallery and the Wedding Stories carousel.

## Features
✓ **Admin Management**: Add, delete, and reorder wedding gallery images  
✓ **Photo Types**: Separate wedding and prewedding photos  
✓ **Masonry Layout**: Responsive grid that adjusts based on image count  
✓ **Stop Scroll on Hover**: Scroll is disabled when hovering over the gallery  
✓ **No Category Display**: Unlike the main gallery, no category text appears on hover  
✓ **Dynamic Grid**: Grid columns adjust (2→3→4→5 columns) based on image count  
✓ **Database-Driven**: All images fetched from MongoDB, not hardcoded  

## File Structure

### Backend
```
studio-admin/
├── src/
│   ├── models/
│   │   └── WeddingGalleryImage.ts    # MongoDB schema
│   ├── app/
│   │   └── api/
│   │       └── wedding-gallery/
│   │           └── route.ts           # API endpoints (GET/POST/PUT/DELETE)
│   ├── app/(admin)/dashboard/
│   │   └── wedding-gallery/
│   │       └── page.tsx               # Admin dashboard for managing images
│   └── middleware.ts                  # Updated to allow public GET access
└── package.json                       # May need next-cloudinary installed
```

### Frontend
```
Shivai-video/
├── src/
│   ├── components/
│   │   └── sections/
│   │       └── WeddingGallerySection.tsx  # Frontend display component
│   ├── services/
│   │   └── api.ts                        # Updated with getWeddingGallery() method
│   └── pages/
│       └── Index.tsx                     # Updated to include new section
└── package.json
```

## API Endpoints

### GET /api/wedding-gallery
Fetch all wedding gallery images (public, no auth required)
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "imageUrl": "https://...",
      "imagePublicId": "wedding/...",
      "photoType": "wedding",
      "order": 0,
      "createdAt": "2026-01-20T..."
    }
  ]
}
```

### POST /api/wedding-gallery
Add a new image (admin only)
```json
{
  "imageUrl": "https://...",
  "imagePublicId": "wedding/...",
  "photoType": "wedding",
  "order": 0
}
```

### PUT /api/wedding-gallery
Update image order/type (admin only)
```json
{
  "id": "_id",
  "order": 1,
  "photoType": "prewedding"
}
```

### DELETE /api/wedding-gallery
Delete an image (admin only)
```json
{
  "id": "_id",
  "imagePublicId": "wedding/..."
}
```

## Usage

### Admin: Adding Images
1. Go to Admin Dashboard → **Wedding Gallery** 💍
2. Click **+ Add Wedding Photo** or **+ Add Prewedding Photo**
3. Upload image via Cloudinary widget
4. Image appears in grid
5. Use ↑ ↓ buttons to reorder
6. Use ✕ button to delete

### Frontend: Display
The `WeddingGallerySection` component:
- Automatically fetches all images from `/api/wedding-gallery`
- Displays in masonry grid (responsive columns)
- **Hover effect**: Shows photo type badge, no category
- **Scroll lock**: Page scroll disabled on hover
- **Dynamic layout**: Adjusts to 2, 3, 4, or 5 columns based on image count

### Minimum Setup
- At least 1 image needed for display
- Recommended: 14+ images for optimal masonry effect
- Grid automatically scales based on actual image count

## Hover Behavior
Unlike the main gallery, the wedding gallery hover shows:
- ✓ Gradient overlay
- ✓ Photo type badge (Wedding/Prewedding)
- ✗ NO category text
- ✗ Scroll disabled

## Responsive Breakpoints
```
Mobile (< 768px):    2 columns
Tablet (768px):      3 columns
Desktop (1024px):    4 columns
Wide (1280px+):      5 columns
```

## Database Schema
```typescript
interface IWeddingGalleryImage {
  _id: ObjectId;
  imageUrl: string;                    // Cloudinary URL
  imagePublicId: string;               // Cloudinary public ID (for deletion)
  photoType: "wedding" | "prewedding"; // Photo type
  order: number;                       // Sort order
  createdAt: Date;                     // Timestamp
}
```

## Installation & Setup

### 1. Backend Setup
Already done! The following are included:
- ✓ `WeddingGalleryImage` model created
- ✓ `/api/wedding-gallery` endpoints created
- ✓ Middleware updated with public GET access
- ✓ Admin dashboard page created

### 2. Frontend Setup
Already done! The following are included:
- ✓ `WeddingGallerySection` component created
- ✓ API service method `getWeddingGallery()` added
- ✓ Component added to homepage
- ✓ Imports updated

### 3. Deploy
```bash
cd studio-admin
git add .
git commit -m "Add wedding gallery section"
git push
# Vercel auto-deploys

cd ../Shivai-video
git add .
git commit -m "Add wedding gallery section frontend"
git push
# Vercel auto-deploys
```

## Customization

### Change Grid Layout
In `WeddingGallerySection.tsx`, modify `getGridCols()`:
```typescript
const getGridCols = () => {
  const count = images.length;
  if (count <= 6) return "grid-cols-2 md:grid-cols-2 lg:grid-cols-3"; // Your breakpoints
  ...
};
```

### Change Masonry Heights
Update the `heights` array in the mapping:
```typescript
const heights = [
  "md:row-span-2",  // Tall image
  "md:row-span-3",  // Very tall
  "md:row-span-1",  // Regular
  "md:row-span-2",  // Tall
];
```

### Change Hover Overlay
In `WeddingGallerySection.tsx`, modify the overlay div:
```tsx
<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
```

## Troubleshooting

### Images not showing?
1. Check if images are uploaded in admin dashboard
2. Verify Cloudinary credentials in `.env.local`
3. Check browser console for API errors

### Scroll not locking on hover?
1. Verify `isHovering` state is updating
2. Check if `onMouseEnter` and `onMouseLeave` are firing
3. Ensure the container has the event listeners attached

### Grid layout looks wrong?
1. Check image count vs breakpoints in `getGridCols()`
2. Verify Tailwind CSS is processing grid classes
3. Clear cache and rebuild

## Notes
- Images are stored on Cloudinary, not in MongoDB (only URLs stored)
- Deleting an image removes it from Cloudinary and database
- Order is preserved in database for consistent display
- No category filter—all photos display together
- Separate from main Photo Gallery (different table/section)
