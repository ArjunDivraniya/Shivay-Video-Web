# API Architecture - Before & After Fix

## BEFORE FIX ❌

```
┌─────────────────────────────────────────────────────────────┐
│                     DEPLOYMENT ISSUE                         │
└─────────────────────────────────────────────────────────────┘

LOCAL (Working ✅)
┌──────────────────┐      Proxy       ┌──────────────────┐
│   Portfolio      │ ───────────────> │   Admin API      │
│  localhost:8080  │    Same Origin   │  localhost:3000  │
│                  │ <─────────────── │                  │
└──────────────────┘                  └──────────────────┘
     ✅ Works!                              ✅ No CORS needed

PRODUCTION (Broken ❌)
┌──────────────────┐    Direct Request   ┌──────────────────┐
│   Portfolio      │ ───────────X───────> │   Admin API      │
│  portfolio.app   │  Different Origin   │  admin.app/api   │
│                  │ <──────────X──────── │                  │
└──────────────────┘                     └──────────────────┘
     ❌ CORS Error                          ❌ No CORS headers
     ❌ 401 Unauthorized                    ❌ Auth required on GET

Problems:
1. No Access-Control-Allow-Origin header
2. All /api/* routes require authentication
3. Portfolio has no auth token
```

## AFTER FIX ✅

```
┌─────────────────────────────────────────────────────────────┐
│                       FIXED!                                 │
└─────────────────────────────────────────────────────────────┘

PRODUCTION (Working ✅)
┌──────────────────┐   GET /api/hero     ┌──────────────────┐
│   Portfolio      │ ──────────────────> │   Admin API      │
│  portfolio.app   │                     │  admin.app/api   │
│                  │ <────── 200 OK ──── │                  │
│                  │   + CORS Headers    │  ✅ Public GET   │
└──────────────────┘   + JSON Data       └──────────────────┘
     ✅ Data loaded!                         ✅ CORS enabled
     ✅ No errors                            ✅ No auth on GET

Fixes Applied:
1. ✅ Access-Control-Allow-Origin: *
2. ✅ GET requests don't need auth
3. ✅ POST/PUT/DELETE still protected
```

## REQUEST FLOW COMPARISON

### GET Request (Public Read)

**BEFORE:**
```
Browser → GET /api/services
          ↓
     Middleware checks auth
          ↓
     ❌ No token found
          ↓
     Return 401 Unauthorized
          ↓
     ❌ Portfolio shows no data
```

**AFTER:**
```
Browser → GET /api/services
          ↓
     Middleware checks if GET + public endpoint
          ↓
     ✅ Yes! Skip auth
          ↓
     Add CORS headers
          ↓
     Query MongoDB
          ↓
     Return data + CORS headers
          ↓
     ✅ Portfolio displays services
```

### POST Request (Protected Write)

**BEFORE & AFTER (Same - Still Protected):**
```
Admin Dashboard → POST /api/services
                  ↓
             Check auth token
                  ↓
             ✅ Valid token?
                  ↓
             Yes → Create service
             No  → Return 401
```

## MIDDLEWARE LOGIC

```typescript
middleware(request) {
  if (request.method === "OPTIONS") {
    // Handle CORS preflight
    return CORS_HEADERS + 200 OK
  }
  
  if (request.method === "GET" && isPublicEndpoint(request.path)) {
    // Public read - no auth needed
    return CORS_HEADERS + ALLOW_REQUEST
  }
  
  if (request.path.startsWith("/api")) {
    // Protected write operations
    if (!hasValidToken(request)) {
      return CORS_HEADERS + 401 Unauthorized
    }
    return CORS_HEADERS + ALLOW_REQUEST
  }
  
  // Dashboard pages - require login
  if (!hasValidToken(request)) {
    return REDIRECT_TO_LOGIN
  }
}
```

## PUBLIC vs PROTECTED ENDPOINTS

```
┌───────────────────────────────────────────────────────────┐
│                    API ENDPOINTS                          │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  PUBLIC (No Auth) 🌍                                     │
│  ✅ Anyone can read                                      │
│  ────────────────────────────────────────                │
│  GET  /api/hero                                          │
│  GET  /api/services                                      │
│  GET  /api/gallery                                       │
│  GET  /api/films                                         │
│  GET  /api/testimonials                                  │
│  GET  /api/about                                         │
│  GET  /api/weddings                                      │
│  GET  /api/stories                                       │
│                                                           │
│  PROTECTED (Auth Required) 🔒                            │
│  ✅ Admin only                                           │
│  ────────────────────────────────────────                │
│  POST    /api/services        (create)                   │
│  PUT     /api/services/:id    (update)                   │
│  DELETE  /api/services/:id    (delete)                   │
│  ALL     /dashboard           (admin UI)                 │
│  ALL     /admin/*             (admin pages)              │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

## CORS HEADERS EXPLAINED

```http
Access-Control-Allow-Origin: *
  ↑ Allows requests from any domain

Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
  ↑ Specifies allowed HTTP methods

Access-Control-Allow-Headers: Content-Type, Authorization
  ↑ Allows these headers in requests

Access-Control-Max-Age: 86400
  ↑ Browser can cache preflight response for 24 hours
```

## ENVIRONMENT VARIABLES

### Admin Site (studio-admin)
```
MONGODB_URI ────────────> Database connection
CLOUDINARY_* ───────────> Media storage
JWT_SECRET ─────────────> Session tokens
ADMIN_EMAIL ────────────> Login credentials
ADMIN_PASSWORD ─────────> Login credentials
ALLOWED_ORIGINS ────────> CORS configuration (optional)
```

### Portfolio Site (Shivai-video)
```
VITE_API_BASE_URL ──────> Points to admin API
   │
   └──> https://admin.vercel.app/api
```

## SECURITY MODEL

```
┌─────────────────────────────────────────────┐
│           Security Layers                   │
├─────────────────────────────────────────────┤
│                                             │
│  Layer 1: CORS                              │
│  ├─ Controls which domains can access API  │
│  └─ Configurable via ALLOWED_ORIGINS       │
│                                             │
│  Layer 2: HTTP Method                       │
│  ├─ GET:  Public (read-only)               │
│  └─ POST/PUT/DELETE: Protected (write)     │
│                                             │
│  Layer 3: Authentication                    │
│  ├─ JWT tokens for admin sessions          │
│  ├─ Verified on every protected request    │
│  └─ Expires after inactivity               │
│                                             │
│  Layer 4: Database                          │
│  ├─ MongoDB with authentication            │
│  └─ Environment-based credentials          │
│                                             │
└─────────────────────────────────────────────┘
```

## DEPLOYMENT FLOW

```
┌───────────────────────────────────────────────────────┐
│                                                       │
│  1. Deploy Admin Site (First!)                       │
│     ├─ Set environment variables                     │
│     ├─ Deploy to Vercel                              │
│     └─ Copy deployed URL                             │
│                                                       │
│  2. Configure Portfolio                               │
│     ├─ Set VITE_API_BASE_URL to admin URL           │
│     └─ Deploy to Vercel                              │
│                                                       │
│  3. Test                                              │
│     ├─ Open portfolio site                           │
│     ├─ Check browser console (no CORS errors)       │
│     ├─ Verify data loads                            │
│     └─ Test admin dashboard login                    │
│                                                       │
└───────────────────────────────────────────────────────┘
```

## SUCCESS INDICATORS

```
✅ Portfolio site loads completely
✅ Hero section displays
✅ Services grid shows cards
✅ Gallery images appear
✅ Films/videos display
✅ Testimonials show
✅ No CORS errors in console
✅ No 401 Unauthorized errors
✅ Network tab shows 200 status codes
✅ Admin dashboard accessible
✅ Admin can login successfully
✅ Admin can create/edit content
```

## FAILURE INDICATORS & FIXES

```
❌ CORS Error
   → Check middleware.ts has CORS headers
   → Redeploy admin site
   
❌ 401 Unauthorized on GET
   → Check middleware.ts public GET routes
   → Redeploy admin site
   
❌ Wrong API URL
   → Set VITE_API_BASE_URL environment variable
   → Redeploy portfolio site
   
❌ No data displaying
   → Check Network tab for actual error
   → Verify admin API URL is correct
   → Check MongoDB connection
   
❌ Can't login to admin
   → Check ADMIN_EMAIL and ADMIN_PASSWORD env vars
   → Check JWT_SECRET is set
   → Verify MongoDB connection
```
