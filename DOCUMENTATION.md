# Focus Isle App Design - Documentation

> Combined documentation for the Focus Isle App project

---

## Table of Contents

1. [README](#readme)
2. [Architecture](#architecture)
3. [Troubleshooting](#troubleshooting)
4. [Guidelines](#guidelines)
5. [Attributions](#attributions)

---

# README

This is a code bundle for Focus Isle App Design. The original project is available at https://www.figma.com/design/cVc2O7H6uRRZZD4VzpQGXm/Focus-Isle-App-Design.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

---

# Architecture

## 🔐 JWT Authentication Design

### ✅ Correct Implementation

We use **two separate Supabase clients** with different keys:

```typescript
// For admin operations (signup, creating users)
const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY // Admin key - bypasses RLS
);

// For validating user JWTs
const supabaseAnon = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY // Public key - validates user tokens
);
```

### Why This Matters

- **ANON_KEY**: Validates user access tokens from frontend
- **SERVICE_ROLE_KEY**: Only for admin operations (signup, not for validation)
- Mixing them causes JWT validation failures

---

## 💾 Database Design

### ✅ New Optimized Structure

**Single-Key Per User Model:**

```
profile:{userId} → {
  userId: string,
  email: string,
  name: string,
  unlockedPlants: string[],
  whitelist: string[]
}

sessions:{userId} → [
  {
    id: string,
    topic: string,
    startTime: Date,
    endTime: Date,
    duration: number,
    actualDuration: number,
    plantId: string,
    success: boolean,
    ...
  },
  ...more sessions...
]
```

### ❌ Old Structure (Problematic)

```
profile:{userId} → { ... }
session:{userId}:{sessionId} → { ... }  // ❌ Separate key per session
session:{userId}:{sessionId2} → { ... }
```

**Problems:**

- `getByPrefix()` is unreliable
- Each session is a separate database entry
- Harder to query and manage

### Why The New Design Is Better

1. **Single atomic operation**: All sessions in one key
2. **Reliable retrieval**: No prefix matching needed
3. **Better performance**: One database read instead of many
4. **Simpler code**: Array operations instead of key management

---

## 🔄 Migration Strategy

### For Existing Users

1. Visit `/debug` page
2. Click **"Migrate Data"** button
3. System will:
   - Find all old `session:{userId}:{sessionId}` entries
   - Combine them into a single `sessions:{userId}` array
   - Preserve all session data

### Code Reference

Migration endpoint: `/make-server-eeff6ec4/migrate-sessions`

```typescript
// Gets all old sessions
const oldSessions = await kv.getByPrefix(`session:${userId}:`);

// Saves to new structure
const sessionsKey = `sessions:${userId}`;
await kv.set(sessionsKey, oldSessions);
```

---

## 🛠️ Testing & Debugging

### Debug Page (`/debug`)

Shows:

- ✅ Server reachability
- ✅ JWT token status
- ✅ Profile API status
- ✅ User session info

### Dashboard Refresh Button

- Manually reload all user data
- Useful after Supabase updates
- Shows loading animation

---

## 📊 Data Flow

```
Frontend (React)
    ↓ access_token
Backend Server (Hono)
    ↓ validate with ANON_KEY
Supabase Auth
    ↓ get userId
KV Store
    ↓ read/write
sessions:{userId}
```

---

## 🔑 Key Takeaways

1. ✅ **JWT Validation**: Always use `supabaseAnon` with ANON_KEY
2. ✅ **Database**: Use single-key structure for collections
3. ✅ **Migration**: Run migration for existing users
4. ✅ **Debugging**: Use `/debug` page for troubleshooting

---

# Troubleshooting

## 🔴 **Problem: "Invalid JWT" 401 Errors**

### **Root Cause**

Your JWT access token has expired. Supabase tokens expire after 1 hour by default.

### **✅ Solution Applied**

We've implemented **automatic token refresh** with retry logic:

1. **Auto-Detection**: App checks if token is expiring soon (within 5 minutes)
2. **Auto-Refresh**: Automatically calls `supabase.auth.refreshSession()`
3. **Auto-Retry**: If any API call gets 401, it refreshes the token and retries once

### **How to Test**

1. **Refresh the page** (Ctrl+R or Cmd+R)
2. Check the console logs - you should see:

   ```
   🔄 Refreshing session...
   ✅ Session refreshed successfully
   New token expires at: XXXXXX
   ```

3. Try completing a focus session
4. Check for these success messages:
   ```
   === SAVING SESSION ===
   ✅ Session saved successfully to backend
   ```

---

## 🚀 **Quick Fix Steps**

### **Option 1: Refresh the Page**

- Simply reload the browser
- The app will automatically refresh your session

### **Option 2: Re-login**

1. Click "Logout"
2. Login again
3. Fresh token will be issued

### **Option 3: Use the Debug Page**

1. Navigate to `/debug`
2. Check the session status
3. Refresh the page if needed

---

## 📊 **Understanding the Console Logs**

### **✅ Good Signs**

```
✅ Server is reachable
✅ Valid session found on mount
✅ Session refreshed successfully
✅ Profile loaded successfully
✅ Loaded sessions: X
⚠️ Got 401, attempting to refresh token...  ← This is GOOD! Auto-retry working
🔄 Retrying request with fresh token...
```

### **❌ Bad Signs**

```
❌ Failed to refresh session
❌ No access token available
❌ Server is not reachable
❌ Token expired?: true  ← Need to refresh/re-login
```

---

## 🔄 **Data Migration (If History is Missing)**

After updating the backend, you may need to migrate old session data:

1. **Visit `/debug` page**
2. **Click "Migrate Data" button**
3. **Check console** for:
   ```
   Successfully migrated X sessions
   ```

---

## 🏗️ **Architecture Changes Made**

### **1. JWT Token Handling**

```typescript
// OLD (No retry)
fetch(url, { headers: { Authorization: `Bearer ${token}` } });

// NEW (Auto-retry with fresh token)
authenticatedFetch(url, options);
```

### **2. Database Structure**

```
OLD: session:{userId}:{sessionId} → {...}  ❌ Unreliable
NEW: sessions:{userId} → [sess1, sess2, ...]  ✅ Reliable
```

### **3. Token Expiration Check**

```typescript
// Auto-refresh if expiring within 5 minutes
const isExpiringSoon = expires_at < now + 300;
if (isExpiringSoon) {
  await getFreshToken();
}
```

---

## 🛠️ **Still Having Issues?**

### **Check These:**

1. **Supabase Edge Function Deployed?**

   - Go to Supabase Dashboard → Edge Functions
   - Ensure `/supabase/functions/server/index.tsx` is updated

2. **ANON_KEY Correct?**

   - Check `.env` file for `VITE_SUPABASE_ANON_KEY`
   - Should match your Supabase project settings

3. **Network Issues?**

   - Open browser DevTools → Network tab
   - Check if requests to `*.supabase.co` are blocked

4. **Token Really Expired?**
   - Open console and type: `(await supabase.auth.getSession()).data.session.expires_at`
   - Compare with: `Math.floor(Date.now() / 1000)`
   - If `expires_at < now`, you need to refresh

---

## 📱 **Expected Behavior**

### **On Page Load:**

1. Check token expiration
2. Auto-refresh if needed
3. Load profile and sessions
4. Display dashboard

### **On Session Save:**

1. Try to save with current token
2. If 401 → refresh token
3. Retry with fresh token
4. Show success/error

### **On Token Expiry:**

- No manual action needed
- App handles it automatically
- Seamless user experience

---

# Guidelines

**Add your own guidelines here**

## General guidelines

Any general rules you want the AI to follow.
For example:

- Only use absolute positioning when necessary. Opt for responsive and well structured layouts that use flexbox and grid by default
- Refactor code as you go to keep code clean
- Keep file sizes small and put helper functions and components in their own files.

## Design system guidelines

Rules for how the AI should make generations look like your company's design system

Additionally, if you select a design system to use in the prompt box, you can reference
your design system's components, tokens, variables and components.
For example:

- Use a base font-size of 14px
- Date formats should always be in the format "Jun 10"
- The bottom toolbar should only ever have a maximum of 4 items
- Never use the floating action button with the bottom toolbar
- Chips should always come in sets of 3 or more
- Don't use a dropdown if there are 2 or fewer options

### Button

The Button component is a fundamental interactive element in our design system, designed to trigger actions or navigate
users through the application. It provides visual feedback and clear affordances to enhance user experience.

#### Usage

Buttons should be used for important actions that users need to take, such as form submissions, confirming choices,
or initiating processes. They communicate interactivity and should have clear, action-oriented labels.

#### Variants

- **Primary Button**
  - Purpose: Used for the main action in a section or page
  - Visual Style: Bold, filled with the primary brand color
  - Usage: One primary button per section to guide users toward the most important action
- **Secondary Button**
  - Purpose: Used for alternative or supporting actions
  - Visual Style: Outlined with the primary color, transparent background
  - Usage: Can appear alongside a primary button for less important actions
- **Tertiary Button**
  - Purpose: Used for the least important actions
  - Visual Style: Text-only with no border, using primary color
  - Usage: For actions that should be available but not emphasized

---

# Attributions

This Figma Make file includes components from [shadcn/ui](https://ui.shadcn.com/) used under [MIT license](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md).

This Figma Make file includes photos from [Unsplash](https://unsplash.com) used under [license](https://unsplash.com/license).

---

_Last Updated: December 28, 2024_
