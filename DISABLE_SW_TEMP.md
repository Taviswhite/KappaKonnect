# Temporarily Disable Service Worker for Testing

If the service worker is causing 404 issues, you can temporarily disable it:

## Option 1: Disable in vite.config.ts

Change this line in `vite.config.ts`:
```ts
registerType: "prompt",
```

To:
```ts
registerType: null,
```

Or comment out the entire VitePWA plugin temporarily.

## Option 2: Test Without PWA

1. Open the app in your phone's browser (not as PWA)
2. Test if routes work in the browser
3. If they work in browser but not PWA, it's a service worker issue

## Option 3: Clear Everything

1. **Uninstall PWA** completely
2. **Clear all browser data** on your phone
3. **Restart your phone**
4. **Rebuild and redeploy** the app
5. **Reinstall PWA** fresh
