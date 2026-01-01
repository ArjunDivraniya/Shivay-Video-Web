## API Reference

All endpoints return JSON. Authenticated routes require the `admin_token` httpOnly cookie set by `POST /api/auth/login`.

### Auth
- **POST** `/api/auth/login` — Body: `email`, `password`; on success returns `{ email, role, success: true }` and sets `admin_token` cookie; 401 on invalid credentials.
- **GET** `/api/auth/me` — Returns `{ email, role }` for valid token; 401 if missing/invalid.
- **POST** `/api/auth/logout` — Clears `admin_token`; returns `{ ok: true }`.

### Uploads
- **POST** `/api/upload` — `multipart/form-data` with `file` and optional `folder`; uploads to Cloudinary and returns the Cloudinary upload result (public_id, url, etc.); 400 if no file.

### Stories
- **GET** `/api/stories` — List all stories.
- **POST** `/api/stories` — Create story; body must include `title`, `eventType`, `location`, `coverImage { url, publicId }`; optional `gallery[]`, `videos[]`, `tags[]`, `isFeatured`, `showOnHomepage`; returns created story.
- **GET** `/api/stories/featured` — List stories where `isFeatured` is true.
- **PUT** `/api/stories/:id` — Update any story fields (same shape as create); returns updated story or 404.
- **DELETE** `/api/stories/:id` — Deletes story; returns `{ ok: true }` or 404.

### Media
- **GET** `/api/media` — List all media items.
- **POST** `/api/media` — Body: `type` (`image`|`video`), `category`, `url`, `publicId`; optional `thumbnail`, `tags[]`, `isHomepage`; returns created media.
- **PATCH** `/api/media/:id` — Partial update of media fields; returns updated media or 404.
- **DELETE** `/api/media/:id` — Deletes media and attempts Cloudinary delete when `publicId` is present; returns `{ ok: true }` or 404.

### Reels
- **GET** `/api/reels` — List all reels.
- **POST** `/api/reels` — Body: `title`, `videoUrl`, `publicId`; optional `thumbnail`, `showOnHomepage`; returns created reel.
- **PATCH** `/api/reels/:id` — Partial update; returns updated reel or 404.
- **DELETE** `/api/reels/:id` — Deletes reel and its Cloudinary asset when `publicId` is present; returns `{ ok: true }` or 404.

### Testimonials
- **GET** `/api/testimonials` — List all testimonials.
- **POST** `/api/testimonials` — Body: `clientName`, `quote`; optional `image { url, publicId }`, `approved` (default false); returns created testimonial.
- **PATCH** `/api/testimonials/:id` — Partial update; returns updated testimonial or 404.
- **DELETE** `/api/testimonials/:id` — Deletes testimonial and any Cloudinary image; returns `{ ok: true }` or 404.

### Sections
- **GET** `/api/sections` — List all sections sorted by `order`.
- **POST** `/api/sections` — Upsert section by `key` (`hero`|`editor_pick`|`latest`) with `contentIds[]`, `enabled`, `order`; returns section.
- **PUT** `/api/sections/:key` — Partial update of a section by key; returns updated section or 404.

### Settings
- **GET** `/api/settings` — Returns settings object or `{}` if none.
- **POST** `/api/settings` — Upsert settings with `heroStoryId` (optional), `studioExperience`, `weddingsCovered`, `citiesServed`; returns saved settings.

### Hero
- **GET** `/api/hero` — Returns latest hero record or `{}`.
- **POST** `/api/hero` — Body: `imageUrl`, `imagePublicId`; replaces existing hero records; returns created hero.
- **PUT** `/api/hero/:id` — Replace hero image; returns updated hero or 404.
- **DELETE** `/api/hero/:id` — Deletes hero; returns confirmation or 404.

### About
- **GET** `/api/about` — Returns about stats or 404 if missing.
- **POST** `/api/about` — Create about stats; body requires numeric `experienceYears`, `weddingsCompleted`, `destinations`, `happyCouples`; optional `images[]`; 400 if already exists.
- **PUT** `/api/about/:id` — Update any stats/images; returns updated document or 404.
- **DELETE** `/api/about/:id` — Deletes about record; returns confirmation or 404.

### Footer
- **GET** `/api/footer` — Returns footer data or 404 if missing.
- **POST** `/api/footer` — Create footer; body requires `phone`, `email`; optional `instagram`, `youtube`, `facebook`.
- **PUT** `/api/footer/:id` — Update footer fields; returns updated document or 404.

### Gallery
- **GET** `/api/gallery` — List gallery images.
- **POST** `/api/gallery` — Body: `imageUrl`, `imagePublicId`, `category`; optional `serviceType`; returns created image.
- **DELETE** `/api/gallery/:id` — Deletes image; returns confirmation or 404.

### Films
- **GET** `/api/films` — List all films.
- **POST** `/api/films` — Body: `title`, `category`, `videoUrl`, `videoPublicId`; optional `serviceType`; returns created film.
- **PUT** `/api/films/:id` — Update film fields; returns updated film or 404.
- **DELETE** `/api/films/:id` — Deletes film; returns confirmation or 404.

### Our Story
- **GET** `/api/our-story` — Returns latest story block or `{}`.
- **POST** `/api/our-story` — Body: `imageUrl`, `imagePublicId`, `startedYear`, `description`; replaces existing record; returns created block.
- **PUT** `/api/our-story/:id` — Update fields; returns updated block or 404.
- **DELETE** `/api/our-story/:id` — Deletes block; returns confirmation or 404.

### Reviews
- **GET** `/api/reviews` — List all reviews.
- **POST** `/api/reviews` — Body: `coupleName`, `review`, `place`, `serviceType`; returns created review.
- **PUT** `/api/reviews/:id` — Update review fields; returns updated review or 404.
- **DELETE** `/api/reviews/:id` — Deletes review; returns confirmation or 404.

### Services
- **GET** `/api/services` — List all services.
- **POST** `/api/services` — Body: `serviceName`, `serviceType`, `imageUrl`, `imagePublicId`; optional `description`, `isActive`; returns created service.
- **PUT** `/api/services/:id` — Update service fields; returns updated service or 404.
- **DELETE** `/api/services/:id` — Deletes service; returns confirmation or 404.

### Weddings
- **GET** `/api/weddings` — List wedding stories.
- **POST** `/api/weddings` — Body: `title`, `coupleName`, `place`, `serviceType`, `coverPhoto { url, publicId }`; optional `gallery[]`; returns created wedding story.
- **GET** `/api/weddings/:id` — Fetch single wedding story or 404.
- **PUT** `/api/weddings/:id` — Update fields; returns updated wedding story or 404.
- **DELETE** `/api/weddings/:id` — Deletes wedding story; returns confirmation or 404.
