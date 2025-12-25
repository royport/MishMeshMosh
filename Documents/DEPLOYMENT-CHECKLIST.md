# Production Deployment Checklist

## Supabase Configuration

### 1. Authentication URL Configuration

In your Supabase Dashboard, navigate to **Authentication → URL Configuration** and configure:

#### Site URL
Set this to your deployed application URL:
```
https://your-deployed-domain.com
```

#### Redirect URLs
Add these patterns to allow authentication callbacks:

For production:
```
https://your-deployed-domain.com/**
```

For local development (keep this):
```
http://localhost:3000/**
```

**Why this matters:** Supabase strictly validates redirect URLs. Without proper configuration, authentication will complete but users won't be redirected correctly, appearing to stay on the login page.

### 2. Environment Variables

Ensure these environment variables are set in your deployment platform (Bolt, Vercel, Netlify, etc.):

```
NEXT_PUBLIC_SUPABASE_URL=https://ijidlimpznqmdyunnjng.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important:** These values are in your local `.env` file, but must be configured separately in your production environment settings.

### 3. Cookie Configuration

Supabase authentication uses HTTP-only cookies for security. In production (HTTPS):
- Cookies are automatically set with `Secure` flag
- `SameSite` is set to `Lax` by default
- No additional configuration needed if using standard setup

## Testing Checklist

After deployment, verify:

1. **Open DevTools → Application → Cookies**
   - After login, you should see Supabase auth cookies

2. **Check Network Tab**
   - Auth requests should show `set-cookie` headers

3. **Console Test**
   After successful login, run in browser console:
   ```javascript
   await supabase.auth.getSession()
   ```
   Should return a valid session object, not null

4. **Redirect Flow**
   - Login should redirect through `/auth/callback` then to `/workspace`
   - Should not redirect back to login page
   - No infinite redirect loops

## Common Issues

### Issue: Login shows success but stays on login page

**Possible causes:**
1. Deployed domain not added to Supabase Redirect URLs
2. Environment variables missing in production
3. Cookie/session not established before redirect

**Solution:** Follow steps 1 and 2 above

### Issue: Infinite redirect loop

**Possible causes:**
1. Middleware checking auth before cookies are set
2. `/auth` routes not excluded from middleware protection

**Solution:** Already handled in `lib/supabase/middleware.ts` - auth pages are excluded from protection

### Issue: Session appears null on protected routes

**Possible causes:**
1. Cookies not being sent with requests
2. Server-side session validation failing

**Solution:**
- Verify cookies exist in DevTools
- Check that `NEXT_PUBLIC_SUPABASE_URL` matches the actual Supabase project
- Ensure using proper Supabase client creation (SSR-aware)

## Architecture Notes

### Authentication Flow

1. User submits login/signup form
2. Client receives session from Supabase
3. Redirect to `/auth/callback?next=/workspace`
4. Callback page verifies session establishment
5. Full page reload to final destination with all cookies

This flow ensures:
- All authentication cookies are properly set
- Server-side middleware can validate the session
- No race conditions between client state and server state
- Works reliably in both development and production

### Middleware Protection

Protected routes: `/workspace/*`, `/admin/*`, `/create`

The middleware:
- Checks for valid Supabase session
- Redirects unauthenticated users to `/auth/login`
- Excludes `/auth/*` routes from checks to prevent loops
- Uses server-side session validation for security
