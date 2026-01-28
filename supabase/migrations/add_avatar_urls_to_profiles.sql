-- Add avatar URLs to all profiles
-- 
-- NOTE: This migration is for GENERATED avatars. If you have actual photos of members,
-- use the BULK_UPLOAD_AVATARS.md guide and map_uploaded_avatars.sql instead.
--
-- This will only update profiles that don't already have an avatar_url set.

-- Option 1: Use UI Avatars (generated avatars based on names)
-- Uncomment this if you want to use generated avatars as placeholders:
/*
UPDATE public.profiles
SET avatar_url = 'https://ui-avatars.com/api/?name=' || 
                 REPLACE(REPLACE(full_name, ' ', '+'), '.', '') || 
                 '&background=random&color=fff&size=256&bold=true&format=png'
WHERE avatar_url IS NULL OR avatar_url = '';
*/

-- Option 2: Use DiceBear avatars (more variety)
-- Uncomment this if you prefer DiceBear:
/*
UPDATE public.profiles
SET avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || 
                 REPLACE(REPLACE(full_name, ' ', ''), '.', '')
WHERE avatar_url IS NULL OR avatar_url = '';
*/

-- If you have actual photos, DO NOT run this migration.
-- Instead, follow the BULK_UPLOAD_AVATARS.md guide to upload real photos.
