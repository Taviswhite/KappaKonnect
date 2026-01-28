# Bulk Upload Profile Pictures Guide

This guide will help you upload all your member photos to Supabase Storage and link them to profiles.

## Step 1: Prepare Your Photos

1. **Organize your photos** - Name each photo file with the person's email or full name:
   - Option A: Use email (recommended): `jeremiah@example.com.jpg` or `jeremiah@example.com.jpeg`
   - Option B: Use full name: `Jeremiah Ramirez.jpg` or `Jeremiah Ramirez.jpeg`
   - Option C: Use firstname_lastname: `jeremiah_ramirez.jpg` or `jeremiah_ramirez.jpeg`

2. **Photo requirements**:
   - **Formats: JPEG (.jpg or .jpeg), PNG, WebP, or GIF** ✅
   - Max size: 5MB per photo
   - Recommended: Square photos (1:1 aspect ratio) work best
   - Recommended size: 512x512px or 1024x1024px
   - **JPEG is fully supported** - use `.jpg` or `.jpeg` extension, both work!

3. **Create a folder** with all your photos ready to upload

## Step 2: Upload Photos via Supabase Dashboard

### Method 1: Using Supabase Dashboard (Easiest)

1. Go to your Supabase Dashboard → **Storage** → **avatars** bucket
2. Click **"Upload file"** or drag and drop
3. Upload all your photos at once (you can select multiple files)
4. Make sure the file names match the email addresses or names from your profiles

### Method 2: Using Supabase CLI (For bulk uploads)

If you have many photos, use the Supabase CLI:

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Upload all photos from a folder
# Replace 'path/to/photos' with your photos folder
supabase storage upload avatars path/to/photos/*.jpg
```

### Method 3: Using a Script (For automated mapping)

See the `bulk_upload_avatars.js` script below for programmatic upload.

## Step 3: Map Photos to Profiles

After uploading, you need to link the photos to profiles. Run this SQL script in Supabase SQL Editor:

```sql
-- Update profiles with avatar URLs based on email
-- This assumes your photos are named like: jerimiah@example.com.jpg

UPDATE public.profiles p
SET avatar_url = (
  SELECT 
    'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/avatars/' || 
    p.email || '.jpg'
  WHERE EXISTS (
    SELECT 1 FROM storage.objects 
    WHERE bucket_id = 'avatars' 
    AND name = p.email || '.jpg'
  )
)
WHERE EXISTS (
  SELECT 1 FROM storage.objects 
  WHERE bucket_id = 'avatars' 
  AND name = p.email || '.jpg'
);

-- If your photos are named differently, adjust the pattern above
-- For example, if named "firstname_lastname.jpg":
-- UPDATE public.profiles p
-- SET avatar_url = (
--   SELECT 
--     'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/avatars/' || 
--     LOWER(REPLACE(REPLACE(p.full_name, ' ', '_'), '.', '')) || '.jpg'
--   WHERE EXISTS (
--     SELECT 1 FROM storage.objects 
--     WHERE bucket_id = 'avatars' 
--     AND name = LOWER(REPLACE(REPLACE(p.full_name, ' ', '_'), '.', '')) || '.jpg'
--   )
-- )
-- WHERE EXISTS (
--   SELECT 1 FROM storage.objects 
--   WHERE bucket_id = 'avatars' 
--   AND name = LOWER(REPLACE(REPLACE(p.full_name, ' ', '_'), '.', '')) || '.jpg'
-- );
```

**Important**: Replace `YOUR_PROJECT_REF` with your actual Supabase project reference (found in your Supabase URL).

## Step 4: Verify Uploads

Run this query to check which profiles have avatars:

```sql
SELECT 
  full_name,
  email,
  avatar_url,
  CASE 
    WHEN avatar_url IS NOT NULL THEN '✅ Has avatar'
    ELSE '❌ Missing avatar'
  END as status
FROM public.profiles
ORDER BY full_name;
```

## Alternative: Manual Mapping Script

If you need to map photos manually (different naming convention), use this script:

```sql
-- Manual mapping example - adjust the email/name patterns as needed
UPDATE public.profiles
SET avatar_url = 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/avatars/jerimiah@example.com.jpg'
WHERE email = 'jerimiah@example.com';

UPDATE public.profiles
SET avatar_url = 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/avatars/doole@example.com.jpg'
WHERE email = 'doole@example.com';

-- Continue for all profiles...
```

## Troubleshooting

1. **Photos not showing?**
   - Check that the bucket is public (should be set by the migration)
   - Verify the file names match exactly (case-sensitive)
   - Check the avatar_url in the profiles table

2. **Upload permission errors?**
   - Make sure you're logged in as an admin
   - Or use the Supabase Dashboard to upload (bypasses RLS)

3. **Wrong photos showing?**
   - Double-check file naming matches your mapping query
   - Verify the avatar_url values in the database

## Next Steps

After uploading and mapping:
1. Refresh your app
2. Check the Members page - all profiles should show photos
3. Individual users can still update their own photos via the Profile page
