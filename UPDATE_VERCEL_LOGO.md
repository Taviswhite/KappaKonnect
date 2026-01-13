# Update App Logo and Name for Vercel

To change the logo and name displayed by Vercel, you need to update:

## 1. Package Name (Already Updated ✅)

The `package.json` name has been updated to `"kappaconnect"`.

## 2. Add PWA Icons

Vercel uses the PWA manifest icons. You need to add these files to the `public/` folder:

### Required Files:
- `public/pwa-192x192.png` - 192x192 pixels
- `public/pwa-512x512.png` - 512x512 pixels
- `public/favicon.ico` - Favicon (optional, but recommended)

### How to Create Icons:

1. **Take your logo image** (from `src/assets/logo.jpeg`)

2. **Resize it to the required sizes:**
   - Use an online tool: https://realfavicongenerator.net/
   - Or use image editing software (Photoshop, GIMP, etc.)
   - Or use command line (if you have ImageMagick):
     ```bash
     convert src/assets/logo.jpeg -resize 192x192 public/pwa-192x192.png
     convert src/assets/logo.jpeg -resize 512x512 public/pwa-512x512.png
     ```

3. **Save the files:**
   - `public/pwa-192x192.png`
   - `public/pwa-512x512.png`

4. **Update favicon (optional):**
   - Replace `public/favicon.ico` with your logo
   - Use: https://favicon.io/favicon-converter/

## 3. Vercel Project Settings

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **General**
4. Update:
   - **Project Name**: Change to "KappaConnect"
   - **Framework Preset**: Should be "Vite" or "Other"

## 4. After Adding Icons

1. **Rebuild the app:**
   ```bash
   npm run build
   ```

2. **Commit and push:**
   ```bash
   git add public/pwa-*.png public/favicon.ico
   git commit -m "Add PWA icons and favicon"
   git push
   ```

3. **Wait for Vercel to redeploy** (2-3 minutes)

4. **Clear browser cache** and test

## Current Configuration

- **App Name**: KappaConnect (already set in `index.html` and `vite.config.ts`)
- **PWA Icons**: Need to be added to `public/` folder
- **Favicon**: `public/favicon.ico` (can be updated)

The app name is already configured. You just need to add the icon files!
