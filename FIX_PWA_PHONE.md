# Fix PWA 404 Errors on Phone

If you're getting 404 errors on your phone, follow these steps:

## Step 1: Clear Service Worker and Cache

### On Android (Chrome):
1. Open Chrome on your phone
2. Go to the app URL
3. Tap the **3-dot menu** (⋮) → **Settings**
4. Tap **Site settings** → **Storage**
5. Tap **Clear & reset**
6. Go back and tap **Unregister service worker** (if available)

### On iPhone (Safari):
1. Open Safari on your phone
2. Go to **Settings** → **Safari**
3. Tap **Clear History and Website Data**
4. Go back to the app and **Remove from Home Screen** (if installed)

## Step 2: Uninstall the PWA

### Android:
1. Long-press the app icon on your home screen
2. Tap **Uninstall** or **Remove**

### iPhone:
1. Long-press the app icon
2. Tap **Remove App** → **Delete App**

## Step 3: Rebuild and Redeploy

1. **Rebuild the app:**
   ```bash
   npm run build
   ```

2. **Deploy the new build** to your hosting platform

3. **Wait a few minutes** for the deployment to complete

## Step 4: Reinstall the PWA

1. **Open the app URL** in your phone's browser
2. **Clear browser cache** one more time
3. **Add to Home Screen** again:
   - **Android Chrome**: Menu (⋮) → **Add to Home screen**
   - **iPhone Safari**: Share button → **Add to Home Screen**

## Step 5: Test

1. Open the app from the home screen icon
2. Try navigating to different pages (Events, Members, Tasks, etc.)
3. All routes should work without 404 errors

## If Still Not Working

### Check the Service Worker:
1. Open the app in your phone's browser (not the PWA)
2. Open Developer Tools (if available) or use Chrome Remote Debugging
3. Go to **Application** → **Service Workers**
4. Check if the service worker is registered
5. Click **Unregister** if there's an old one
6. Refresh the page

### Force Update:
1. In the browser, go to the app URL
2. Hard refresh: **Ctrl+Shift+R** (or **Cmd+Shift+R** on Mac)
3. Or clear cache and reload

### Check Deployment:
- Make sure `vercel.json` (or `netlify.toml`) is in your repository
- Make sure the `_redirects` file is in the `public/` folder
- Redeploy after adding these files

## Alternative: Disable Service Worker Temporarily

If you want to test without the service worker, you can temporarily disable it:

1. In `vite.config.ts`, change:
   ```ts
   registerType: "autoUpdate",
   ```
   to:
   ```ts
   registerType: "prompt",
   injectRegister: null,
   ```

2. Rebuild and redeploy
3. This will prevent the service worker from caching routes
