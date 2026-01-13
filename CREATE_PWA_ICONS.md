# Create PWA Icons from Logo

To complete the PWA setup, you need to create icon files from your fraternity logo.

## Required Icon Files

Create these files in the `public/` folder:

1. **`logo-192x192.png`** - 192x192 pixels
2. **`logo-512x512.png`** - 512x512 pixels

## Steps to Create Icons

### Option 1: Using Online Tools

1. Go to a PWA icon generator like:
   - https://realfavicongenerator.net/
   - https://www.pwabuilder.com/imageGenerator
   - https://favicon.io/favicon-generator/

2. Upload your logo image (`src/assets/logo.jpeg`)

3. Generate the required sizes (192x192 and 512x512)

4. Download and save to `public/` folder as:
   - `logo-192x192.png`
   - `logo-512x512.png`

### Option 2: Using Image Editing Software

1. Open your logo in an image editor (Photoshop, GIMP, etc.)

2. Resize to 192x192 pixels and save as `public/logo-192x192.png`

3. Resize to 512x512 pixels and save as `public/logo-512x512.png`

4. Make sure the background is transparent or matches your theme

### Option 3: Using Command Line (ImageMagick)

If you have ImageMagick installed:

```bash
# Convert and resize to 192x192
convert src/assets/logo.jpeg -resize 192x192 public/logo-192x192.png

# Convert and resize to 512x512
convert src/assets/logo.jpeg -resize 512x512 public/logo-512x512.png
```

## Update Favicon (Optional)

You can also update the favicon:

1. Create a 32x32 or 48x48 version of your logo
2. Save as `public/favicon.ico` (or convert existing favicon.ico)

## Verify

After adding the icons:

1. Run `npm run build`
2. Check that the icons appear in `dist/` folder
3. Test the PWA installation on a device

The app will now use your fraternity logo as the PWA icon!
