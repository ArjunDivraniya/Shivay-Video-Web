# Authentication & CRUD Protection Guide

## Overview

Your admin panel now has complete authentication protection:
- ✅ Login modal appears when trying CRUD operations without authentication
- ✅ All CRUD operations (Create, Read, Update, Delete) require login
- ✅ After successful login, all permissions are granted
- ✅ Session persistence across page reloads

## Components & Hooks

### 1. LoginModal Component
Located at: `src/components/LoginModal.tsx`

A beautiful, reusable login modal that appears when authentication is required.

**Usage:**
```tsx
import LoginModal from "@/components/LoginModal";

const [showModal, setShowModal] = useState(false);

return (
  <LoginModal
    isOpen={showModal}
    onClose={() => setShowModal(false)}
    onLoginSuccess={() => {
      setShowModal(false);
      // Refresh data or retry operation
    }}
  />
);
```

### 2. useCRUD Hook
Located at: `src/hooks/useCRUD.ts`

Handles all CRUD operations with automatic authentication checking.

**Usage:**
```tsx
import { useCRUD } from "@/hooks/useCRUD";

const { create, update, delete: deleteItem, loading, error } = useCRUD({
  onAuthRequired: () => {
    // Show login modal when auth is required
    setShowLoginModal(true);
  },
  onSuccess: (data) => {
    // Handle successful operation
    console.log("Operation successful:", data);
  },
  onError: (error) => {
    // Handle error
    setError(error);
  },
});

// Create operation
const handleCreate = async () => {
  await create("/api/items", { title: "New Item" });
};

// Update operation
const handleUpdate = async () => {
  await update("/api/items/123", { title: "Updated" });
};

// Delete operation
const handleDelete = async () => {
  await deleteItem("/api/items/123");
};
```

### 3. useAuth Hook
Located at: `src/hooks/useAuth.ts`

Check authentication status without triggering login flow.

**Usage:**
```tsx
import { useAuth } from "@/hooks/useAuth";

const { user, loading, isAuthenticated, checkAuth } = useAuth();

if (loading) return <Loading />;
if (!isAuthenticated) return <NotLoggedIn />;

return <Dashboard user={user} />;
```

### 4. WithAuth Wrapper
Located at: `src/components/WithAuth.tsx`

Wraps pages and automatically shows login modal if not authenticated.

**Usage:**
```tsx
import WithAuth from "@/components/WithAuth";

export default function AdminPage() {
  return (
    <WithAuth>
      <YourAdminContent />
    </WithAuth>
  );
}
```

## Implementation Pattern

Here's the recommended pattern for adding authentication to any page:

```tsx
"use client";

import LoginModal from "@/components/LoginModal";
import { useCRUD } from "@/hooks/useCRUD";
import { useState } from "react";

export default function YourPage() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [message, setMessage] = useState("");

  // CRUD operations with auth checking
  const { create, loading } = useCRUD({
    onAuthRequired: () => {
      setMessage("❌ Please login to perform this action");
      setShowLoginModal(true);
    },
    onSuccess: (data) => {
      setMessage("✓ Operation successful!");
      // Refresh data here
    },
    onError: (error) => {
      setMessage(`❌ Error: ${error}`);
    },
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // useCRUD will automatically check auth and show modal if needed
    await create("/api/your-endpoint", {
      // Your data here
    });
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    setMessage("✓ Logged in! Perform your action again.");
  };

  return (
    <div>
      {message && <div className="alert">{message}</div>}
      
      <form onSubmit={handleCreate}>
        {/* Your form fields */}
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </button>
      </form>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
```

## How It Works

### Step 1: User Tries CRUD Operation
User clicks "Create", "Update", or "Delete" button

### Step 2: Auth Check
`useCRUD` hook checks if user is authenticated via `/api/auth/me`

### Step 3: If Not Authenticated
- `onAuthRequired` callback is triggered
- Login modal appears

### Step 4: User Logs In
- User enters credentials in the modal
- `LoginModal` submits to `/api/auth/login`
- Credentials are stored in cookies

### Step 5: Permission Granted
- `onLoginSuccess` callback is triggered
- User can now perform CRUD operations
- Subsequent operations work without auth check

## Demo Page

Visit `/explore` to see this in action:
- Try creating an item without logging in
- The login modal appears automatically
- Log in and create the item
- Instant feedback with success/error messages

## Features

✅ **Automatic Authentication Checking**
- Every CRUD operation checks auth status
- No manual auth checks needed

✅ **Beautiful Modal UI**
- Professional login modal
- Works on mobile and desktop
- Smooth animations

✅ **Error Handling**
- Clear error messages
- Automatic error state management
- Prevents spam submissions

✅ **Session Persistence**
- Login session persists across page reloads
- Automatic logout on session expiry

✅ **Callback System**
- `onAuthRequired`: When login is needed
- `onSuccess`: When operation succeeds
- `onError`: When operation fails

## Security Features

🔒 **Backend Validation**
- All API routes validate authentication
- Session tokens verified server-side
- CSRF protection with credentials: "include"

🔒 **Secure Credentials**
- Passwords never exposed in client code
- Auth tokens stored in HttpOnly cookies
- No sensitive data in localStorage

## Customization

### Change Login Modal Styling
Edit `src/components/LoginModal.tsx` to match your branding

### Add More Callbacks
Extend `useCRUD` with additional callback options

### Custom Auth Logic
Modify `src/hooks/useAuth.ts` for custom requirements

## Login Credentials (Demo)

- **Email:** arjundivraniya8@gmail.com
- **Password:** 123456

---

**Questions?** Check the examples in `/src/app/explore/page.tsx` for working implementation!
