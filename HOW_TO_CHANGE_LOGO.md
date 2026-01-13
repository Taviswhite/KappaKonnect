# How to Change the Logo

The logo is currently located at `src/assets/logo.jpeg` and is used in:
- **Sidebar** (main navigation)
- **Auth page** (login/signup page)

## Option 1: Replace the Existing File (Easiest)

1. **Replace the file:**
   - Delete or rename the current `src/assets/logo.jpeg`
   - Add your new logo file as `src/assets/logo.jpeg`
   - Keep the same filename and location

2. **Supported formats:**
   - `.jpeg` / `.jpg`
   - `.png`
   - `.svg`
   - `.webp`

3. **Recommended size:**
   - At least 200x200 pixels for best quality
   - Square aspect ratio works best

## Option 2: Use a Different File Name

If you want to use a different filename:

1. **Add your logo** to `src/assets/` (e.g., `src/assets/new-logo.png`)

2. **Update the imports** in these files:

   **`src/components/layout/Sidebar.tsx`** (line 22):
   ```tsx
   import logo from "@/assets/new-logo.png";
   ```

   **`src/pages/Auth.tsx`** (line 9):
   ```tsx
   import logo from "@/assets/new-logo.png";
   ```

## Option 3: Use a Logo from Public Folder

If you want to use a logo from the `public/` folder:

1. **Add your logo** to `public/` folder (e.g., `public/logo.png`)

2. **Update the imports** to use the public path:

   **`src/components/layout/Sidebar.tsx`**:
   ```tsx
   // Remove: import logo from "@/assets/logo.jpeg";
   // Use: const logo = "/logo.png";
   ```

   **`src/pages/Auth.tsx`**:
   ```tsx
   // Remove: import logo from "@/assets/logo.jpeg";
   // Use: const logo = "/logo.png";
   ```

## After Changing the Logo

1. **Restart the dev server** if it's running:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

2. **Clear browser cache** if you don't see the new logo

3. **Rebuild for production**:
   ```bash
   npm run build
   ```

## Current Logo Locations

- **File**: `src/assets/logo.jpeg`
- **Used in**: 
  - `src/components/layout/Sidebar.tsx` (line 22, 95)
  - `src/pages/Auth.tsx` (line 9, 117)
